// WordPress domain routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer while
// preserving existing behavior.

import type { Env } from './utils';
import { json, proxyToBackend, callSupabaseRpc } from './utils';

/**
 * Best-effort upsert of a text-based site setting in Supabase.
 * Uses service role key when available but falls back to anon key.
 * Copied from src/index.ts for WordPress sync admin toggles.
 */
async function updateSiteSetting(env: Env, key: string, value: string): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return;
  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

  const url = new URL(`${baseUrl}/rest/v1/site_settings`);
  url.searchParams.set('on_conflict', 'key');

  try {
    await fetch(url.toString(), {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        key,
        value,
        category: 'wordpress',
        description: `Managed WordPress setting: ${key}`,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch {
    // Non-fatal; callers treat failure as best-effort
  }
}

/**
 * Log a WordPress sync activity record into the activity_logs table.
 * Copied from src/index.ts.
 */
async function logWordPressSyncActivity(
  env: Env,
  info: {
    success: boolean;
    postsProcessed: number;
    startedAt: Date;
    finishedAt: Date;
    error?: string | null;
    triggeredBy?: string | null;
    isScheduler?: boolean;
    failedPostIds?: number[];
  },
): Promise<void> {
  const durationMs = info.finishedAt.getTime() - info.startedAt.getTime();

  const details: any = {
    type: 'wordpress_sync',
    status: info.success ? 'success' : 'error',
    postsProcessed: info.postsProcessed,
    startedAt: info.startedAt.toISOString(),
    finishedAt: info.finishedAt.toISOString(),
    durationMs,
    error: info.error || null,
    triggeredBy: info.triggeredBy || null,
    isScheduler: info.isScheduler === true,
  };

  if (info.failedPostIds && info.failedPostIds.length) {
    details.failedPostIds = info.failedPostIds;
  }

  try {
    await callSupabaseRpc(env, 'log_activity', {
      action: 'wordpress_sync',
      details,
    });
  } catch (err) {
    console.error('Failed to write WordPress sync activity_log', err);
  }
}

/**
 * Update both site settings and activity logs after a WordPress sync run.
 * Copied from src/index.ts.
 */
async function updateWordPressSyncMetadata(
  env: Env,
  info: {
    success: boolean;
    postsProcessed: number;
    startedAt: Date;
    finishedAt: Date;
    error?: string | null;
    isScheduler?: boolean;
    triggeredBy?: string | null;
    failedPostIds?: number[];
  },
): Promise<void> {
  try {
    const statusValue = info.success ? 'success' : 'error';
    const lastSyncIso = info.finishedAt.toISOString();

    await callSupabaseRpc(env, 'update_site_setting', {
      key: 'wordpress_last_sync_status',
      value: statusValue,
      category: 'sync',
      description: 'Last WordPress sync status',
    });

    await callSupabaseRpc(env, 'update_site_setting', {
      key: 'wordpress_last_sync_time',
      value: lastSyncIso,
      category: 'sync',
      description: 'Last WordPress sync completion time',
    });

    await logWordPressSyncActivity(env, info);
  } catch (err) {
    console.error('Failed to update WordPress sync metadata', err);
  }
}

// Register all WordPress-related routes on the provided router instance.
export function registerWordpressRoutes(router: any) {
  // WORDPRESS SYNC STATUS
  router.get('/api/wordpress/status', async (_req: Request, env: Env) => {
    try {
      const lastSync = await env.SYNC_METADATA_KV.get('last_sync_timestamp');
      const lastStatus = await env.SYNC_METADATA_KV.get('last_sync_status');

      return json({
        lastSync: lastSync ? new Date(lastSync) : null,
        status: lastStatus || 'idle',
        schedulerEnabled: env.ENABLE_WORDPRESS_SCHEDULER === 'true',
      });
    } catch (error) {
      return json({ error: String(error) }, { status: 500 });
    }
  });

  // WORDPRESS MANUAL SYNC (internal + scheduler)
  router.post('/api/wordpress/sync/manual', async (req: Request, env: Env) => {
    const startedAt = new Date();
    let postsProcessed = 0;
    let errorMessage: string | null = null;

    try {
      const key = req.headers.get('X-Sync-Key');
      const isScheduler = req.headers.get('X-Scheduler') === 'true';
      if (!isScheduler && env.WORDPRESS_SYNC_KEY && key !== env.WORDPRESS_SYNC_KEY) {
        return json({ error: 'Unauthorized' }, { status: 403 });
      }

      const lockId = env.LOCKS_DO.idFromName('wordpress-sync');
      const lock = env.LOCKS_DO.get(lockId);

      const acquired = await lock.fetch(
        new Request('https://worker', {
          method: 'POST',
          body: JSON.stringify({ key: 'wordpress-sync', action: 'acquire' }),
        }),
      );

      const lockData = (await acquired.json()) as any;
      if (!lockData.acquired) {
        return json({ error: 'Sync already in progress' }, { status: 409 });
      }

      // Mark sync as running in KV so UIs can reflect real-time status
      try {
        await env.SYNC_METADATA_KV.put('last_sync_status', 'running');
        await env.SYNC_METADATA_KV.put('last_sync_timestamp', startedAt.toISOString());
      } catch {
        // best-effort
      }

      try {
        const wpRes = await fetch(
          `${env.WORDPRESS_API}?per_page=100&orderby=modified&order=desc`,
        );
        if (!wpRes.ok) throw new Error('WordPress API failed');

        const posts = (await wpRes.json()) as any[];
        postsProcessed = Array.isArray(posts) ? posts.length : 0;

        const failed: Array<{ id: any; slug?: string; status: number; error?: string }> = [];

        for (const post of posts) {
          try {
            const res = await callSupabaseRpc(env, 'upsert_wordpress_post', {
              post_id: post.id,
              title: post.title?.rendered,
              content: post.content?.rendered,
              excerpt: post.excerpt?.rendered,
              slug: post.slug,
              date: post.date,
            });

            if (!res.ok) {
              const body = await res.text().catch(() => '');
              failed.push({
                id: post.id,
                slug: typeof post.slug === 'string' ? post.slug : undefined,
                status: res.status,
                error: body ? body.slice(0, 200) : undefined,
              });
            }
          } catch (err: any) {
            failed.push({
              id: post.id,
              slug: typeof post.slug === 'string' ? post.slug : undefined,
              status: 0,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        const finishedAt = new Date();
        const hadFailures = typeof failed !== 'undefined' && failed.length > 0;

        try {
          await env.SYNC_METADATA_KV.put('last_sync_timestamp', finishedAt.toISOString());
          await env.SYNC_METADATA_KV.put(
            'last_sync_status',
            hadFailures ? 'partial-error' : 'success',
          );
        } catch {
          // ignore KV failures
        }

        if (hadFailures) {
          const detail = failed
            .map((f) => `id=${String(f.id)} slug=${f.slug || '-'} status=${f.status}`)
            .slice(0, 10)
            .join('; ');
          errorMessage = `upsert_wordpress_post failed for ${failed.length} posts: ${detail}`;
        }

        // Update Supabase site settings and activity logs (best-effort)
        await updateWordPressSyncMetadata(env, {
          success: !hadFailures,
          postsProcessed,
          startedAt,
          finishedAt,
          error: errorMessage,
          isScheduler,
          triggeredBy: isScheduler ? 'scheduler' : 'manual',
          failedPostIds: hadFailures
            ? failed.map((f) => Number(f.id)).filter((id) => Number.isFinite(id))
            : undefined,
        });

        return json({
          success: true,
          postsProcessed,
          startedAt: startedAt.toISOString(),
          finishedAt: finishedAt.toISOString(),
        });
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : String(err);
        const finishedAt = new Date();

        try {
          await env.SYNC_METADATA_KV.put('last_sync_status', `error: ${errorMessage}`);
        } catch {
          // ignore
        }

        await updateWordPressSyncMetadata(env, {
          success: false,
          postsProcessed,
          startedAt,
          finishedAt,
          error: errorMessage,
          isScheduler,
          triggeredBy: isScheduler ? 'scheduler' : 'manual',
        });

        return json({ error: errorMessage }, { status: 500 });
      } finally {
        try {
          await lock.fetch(
            new Request('https://worker', {
              method: 'POST',
              body: JSON.stringify({ key: 'wordpress-sync', action: 'release' }),
            }),
          );
        } catch {
          // ignore lock release errors
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      try {
        await env.SYNC_METADATA_KV.put('last_sync_status', `error: ${msg}`);
      } catch {
        // ignore KV failures
      }
      return json({ error: msg }, { status: 500 });
    }
  });

  // WORDPRESS POSTS PROXY (avoids browser CORS and matches Express shape)
  router.get('/api/wordpress/posts', async (req: Request, env: Env) => {
    try {
      const incomingUrl = new URL(req.url);
      const pageParam = incomingUrl.searchParams.get('page');
      const perPageParam = incomingUrl.searchParams.get('per_page');
      const slug = incomingUrl.searchParams.get('slug') || '';
      const search = incomingUrl.searchParams.get('search') || '';
      const fields = incomingUrl.searchParams.get('_fields') || '';

      const page =
        Number.isFinite(Number(pageParam)) && Number(pageParam) > 0 ? Number(pageParam) : 1;
      const perPageRaw = Number(perPageParam);
      const per_page =
        Number.isFinite(perPageRaw) && perPageRaw > 0
          ? Math.max(1, Math.min(100, perPageRaw))
          : 100;

      const params = new URLSearchParams();
      if (slug) {
        params.set('slug', slug.trim());
      } else {
        params.set('page', String(page));
        params.set('per_page', String(per_page));
      }
      if (search) params.set('search', search.trim());
      if (fields) params.set('_fields', fields.trim());

      const wpBase =
        env.WORDPRESS_API ||
        'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';
      const wpUrl = `${wpBase}?${params.toString()}`;

      const wpRes = await fetch(wpUrl);
      if (!wpRes.ok) {
        const text = await wpRes.text().catch(() => '');
        throw new Error(
          `WordPress API error: ${wpRes.status} ${wpRes.statusText} ${text.slice(0, 200)}`,
        );
      }

      const posts = await wpRes.json();

      const totalPagesHeader = wpRes.headers.get('X-WP-TotalPages');
      const totalHeader = wpRes.headers.get('X-WP-Total');
      const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
      const total = totalHeader ? parseInt(totalHeader, 10) : (Array.isArray(posts) ? posts.length : 0);

      return json({
        success: true,
        posts,
        totalPages,
        total,
      });
    } catch (error) {
      console.error(
        '[WordPress] Error fetching posts via Worker proxy',
        error instanceof Error ? error.message : String(error),
      );
      return json(
        {
          success: false,
          message: `Error fetching WordPress posts`,
        },
        { status: 500 },
      );
    }
  });
}