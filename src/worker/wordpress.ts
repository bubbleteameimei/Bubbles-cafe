// WordPress domain routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer while
// preserving existing behavior.

import type { Env } from './utils';
import { json, proxyToBackend, callSupabaseRpc, getBearerToken, getSupabaseCurrentUser } from './utils';
import { updateSiteSetting, updateWordPressSyncMetadata } from './wordpress-shared';

interface AdminSyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'error' | 'running';
  message: string;
  postsProcessed: number;
  duration: number;
  error?: string | null;
}

/**
 * Shared admin auth helper for WordPress admin routes.
 */
async function requireAdmin(
  req: Request,
  env: Env,
): Promise<{ user: { isAdmin: boolean } | null; response?: Response }> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return { user: null, response: json({ error: 'Supabase not configured' }, { status: 500 }) };
  }

  const token = getBearerToken(req);
  if (!token) {
    return {
      user: null,
      response: json({ error: 'Admin authentication required' }, { status: 401 }),
    };
  }

  const currentUser = await getSupabaseCurrentUser(env, token);
  if (!currentUser || !currentUser.isAdmin) {
    return {
      user: null,
      response: json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return { user: currentUser };
}

/**
 * Parse a single activity_logs row into an AdminSyncLog.
 */
function mapActivityRowToAdminSyncLog(row: any): AdminSyncLog | null {
  if (!row) return null;

  let details: any = row.details;
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch {
      details = {};
    }
  }
  if (!details || typeof details !== 'object') {
    details = {};
  }

  const startedAtRaw =
    details.startedAt || details.startTime || details.started_at || row.created_at || new Date().toISOString();
  const finishedAtRaw =
    details.finishedAt || details.endTime || details.finished_at || row.created_at || startedAtRaw;

  const startedAt = new Date(startedAtRaw);
  const finishedAt = new Date(finishedAtRaw);
  const duration =
    Number.isFinite(startedAt.getTime()) && Number.isFinite(finishedAt.getTime())
      ? Math.max(0, finishedAt.getTime() - startedAt.getTime())
      : 0;

  const statusRaw = String(details.status || '').toLowerCase();
  let status: 'success' | 'error' | 'running';
  if (statusRaw === 'success') {
    status = 'success';
  } else if (statusRaw === 'running') {
    status = 'running';
  } else if (statusRaw === 'partial-error') {
    status = 'error';
  } else {
    status = 'error';
  }

  const postsProcessed = Number(details.postsProcessed ?? 0);
  const error =
    typeof details.error === 'string' && details.error.trim().length > 0
      ? details.error.trim()
      : null;

  let message: string = '';
  if (typeof details.message === 'string' && details.message.trim()) {
    message = details.message.trim();
  } else if (status === 'success') {
    message =
      postsProcessed > 0
        ? `Synced ${postsProcessed} posts successfully`
        : 'WordPress sync completed successfully';
  } else if (status === 'running') {
    message = 'WordPress sync in progress';
  } else if (error) {
    message = `WordPress sync failed: ${error}`;
  } else {
    message = 'WordPress sync failed';
  }

  const timestamp =
    (details.finishedAt as string) ||
    (details.startedAt as string) ||
    (row.created_at as string) ||
    new Date().toISOString();

  return {
    id: String(row.id),
    timestamp,
    status,
    message,
    postsProcessed: Number.isFinite(postsProcessed) && postsProcessed > 0 ? postsProcessed : 0,
    duration,
    error,
  };
}

/**
 * Fetch recent WordPress sync logs from activity_logs.
 */
async function fetchWordPressSyncLogs(env: Env, limit = 20): Promise<AdminSyncLog[]> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return [];
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

  const url = new URL(`${baseUrl}/rest/v1/activity_logs`);
  url.searchParams.set('select', 'id,action,details,created_at');
  url.searchParams.set('action', 'eq.wordpress_sync');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', String(limit));

  try {
    const res = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return [];
    }

    const rows = ((await res.json().catch(() => [])) as any[]) || [];
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const logs: AdminSyncLog[] = [];
    for (const row of rows) {
      const mapped = mapActivityRowToAdminSyncLog(row);
      if (mapped) {
        logs.push(mapped);
      }
    }
    return logs;
  } catch {
    return [];
  }
}

// Register all WordPress-related routes on the provided router instance.
export function registerWordpressRoutes(router: any) {
  // WORDPRESS SYNC STATUS (public/basic)
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

  // WORDPRESS ADMIN: SYNC STATUS (detailed)
  router.get('/api/admin/wordpress/status', async (req: Request, env: Env) => {
    const { response } = await requireAdmin(req, env);
    if (response) return response;

    try {
      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json',
      };

      // Determine whether sync is enabled (site setting overrides env flag when present)
      let enabled = env.ENABLE_WORDPRESS_SCHEDULER === 'true';
      // Default to 30 minutes to match Cloudflare cron schedule unless overridden in site_settings
      let syncIntervalMs = 30 * 60 * 1000;

      try {
        const settingsUrl = new URL(`${baseUrl}/rest/v1/site_settings`);
        settingsUrl.searchParams.set('select', 'key,value');
        settingsUrl.searchParams.set(
          'key',
          'in.(wordpress_sync_enabled,wordpress_sync_interval)',
        );

        const res = await fetch(settingsUrl.toString(), { headers });
        if (res.ok) {
          const rows = ((await res.json().catch(() => [])) as any[]) || [];
          if (Array.isArray(rows)) {
            for (const row of rows) {
              const key = String(row.key || '');
              const value = String(row.value ?? '').trim();
              if (key === 'wordpress_sync_enabled' && value) {
                const v = value.toLowerCase();
                enabled = v === 'true' || v === '1' || v === 'yes' || v === 'on';
              } else if (key === 'wordpress_sync_interval') {
                const ms = Number(value);
                if (Number.isFinite(ms) && ms > 0) {
                  syncIntervalMs = ms;
                }
              }
            }
          }
        }
      } catch {
        // ignore settings errors; fall back to env
      }

      // KV state for running/last sync
      let isRunning = false;
      let lastSyncTime: string | null = null;

      try {
        const lastStatus = await env.SYNC_METADATA_KV.get('last_sync_status');
        const lastTimestamp = await env.SYNC_METADATA_KV.get('last_sync_timestamp');
        if (lastStatus === 'running') {
          isRunning = true;
        }
        if (lastTimestamp) {
          lastSyncTime = lastTimestamp;
        }
      } catch {
        // ignore KV failures
      }

      // Activity logs (for errors/last sync)
      const logs = await fetchWordPressSyncLogs(env, 20);
      if (!lastSyncTime && logs.length) {
        lastSyncTime = logs[0].timestamp;
      }

      const errors = logs
        .filter((log) => log.status === 'error' || (log.error && log.error.length > 0))
        .slice(0, 5)
        .map((log) => ({
          id: log.id,
          timestamp: log.timestamp,
          message: log.error || log.message,
          details: {
            postsProcessed: log.postsProcessed,
            durationMs: log.duration,
          },
        }));

      const totalProcessed = logs.reduce(
        (acc, log) =>
          Number.isFinite(log.postsProcessed) && log.postsProcessed > 0
            ? acc + log.postsProcessed
            : acc,
        0,
      );

      // Count WordPress-sourced posts (best-effort)
      let postsCount = 0;
      try {
        const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
        postsUrl.searchParams.set('select', 'id');
        postsUrl.searchParams.set('metadata->>source', 'eq.wordpress_api');
        postsUrl.searchParams.set('limit', '1');

        const res = await fetch(postsUrl.toString(), {
          headers: {
            ...headers,
            Prefer: 'count=exact',
          },
        });

        if (res.ok) {
          const contentRange = res.headers.get('Content-Range');
          if (contentRange && contentRange.includes('/')) {
            const parts = contentRange.split('/');
            const totalStr = parts[1];
            const n = parseInt(totalStr, 10);
            if (Number.isFinite(n)) {
              postsCount = n;
            }
          } else {
            const rows = ((await res.json().catch(() => [])) as any[]) || [];
            postsCount = Array.isArray(rows) ? rows.length : 0;
          }
        }
      } catch {
        // ignore post count errors
      }

      // Approximate next sync time
      let nextSync: string | null = null;
      if (enabled) {
        const base = lastSyncTime ? new Date(lastSyncTime) : new Date();
        const next = new Date(base.getTime() + syncIntervalMs);
        if (Number.isFinite(next.getTime())) {
          nextSync = next.toISOString();
        }
      }

      return json({
        isRunning,
        lastSync: lastSyncTime,
        nextSync,
        postsCount,
        errors,
        totalProcessed,
        syncInterval: syncIntervalMs,
        enabled,
      });
    } catch {
      return json({ error: 'Failed to load WordPress sync status' }, { status: 500 });
    }
  });

  // WORDPRESS ADMIN: SYNC LOGS
  router.get('/api/admin/wordpress/logs', async (req: Request, env: Env) => {
    const { response } = await requireAdmin(req, env);
    if (response) return response;

    try {
      const logs = await fetchWordPressSyncLogs(env, 50);
      return json(logs);
    } catch {
      return json({ error: 'Failed to load WordPress sync logs' }, { status: 500 });
    }
  });

  // WORDPRESS ADMIN: DIAGNOSTICS
  // Useful for confirming WordPress -> Supabase mirroring and spotting stale caches.
  router.get('/api/admin/wordpress/diagnostics', async (req: Request, env: Env) => {
    const { response } = await requireAdmin(req, env);
    if (response) return response;

    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: 'application/json',
    };

    const kv: { lastStatus: string | null; lastTimestamp: string | null } = {
      lastStatus: null,
      lastTimestamp: null,
    };

    try {
      kv.lastStatus = await env.SYNC_METADATA_KV.get('last_sync_status');
      kv.lastTimestamp = await env.SYNC_METADATA_KV.get('last_sync_timestamp');
    } catch {
      // ignore
    }

    let wpCount = 0;
    let communityCount = 0;

    try {
      const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
      postsUrl.searchParams.set('select', 'id');
      postsUrl.searchParams.set('metadata->>source', 'eq.wordpress_api');
      postsUrl.searchParams.set('limit', '1');

      const res = await fetch(postsUrl.toString(), {
        headers: {
          ...headers,
          Prefer: 'count=exact',
        },
      });

      if (res.ok) {
        const contentRange = res.headers.get('Content-Range');
        if (contentRange && contentRange.includes('/')) {
          const parts = contentRange.split('/');
          const totalStr = parts[1];
          const n = parseInt(totalStr, 10);
          if (Number.isFinite(n)) {
            wpCount = n;
          }
        }
      }
    } catch {
      // ignore
    }

    try {
      const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
      postsUrl.searchParams.set('select', 'id');
      postsUrl.searchParams.set('metadata->>isCommunityPost', 'eq.true');
      postsUrl.searchParams.set('limit', '1');

      const res = await fetch(postsUrl.toString(), {
        headers: {
          ...headers,
          Prefer: 'count=exact',
        },
      });

      if (res.ok) {
        const contentRange = res.headers.get('Content-Range');
        if (contentRange && contentRange.includes('/')) {
          const parts = contentRange.split('/');
          const totalStr = parts[1];
          const n = parseInt(totalStr, 10);
          if (Number.isFinite(n)) {
            communityCount = n;
          }
        }
      }
    } catch {
      // ignore
    }

    let newestWordpressPost: any = null;
    let newestCommunityPost: any = null;

    try {
      const url = new URL(`${baseUrl}/rest/v1/posts`);
      url.searchParams.set('select', 'id,slug,created_at,metadata');
      url.searchParams.set('metadata->>source', 'eq.wordpress_api');
      url.searchParams.set('order', 'created_at.desc');
      url.searchParams.set('limit', '1');

      const res = await fetch(url.toString(), { headers });
      if (res.ok) {
        const rows = ((await res.json().catch(() => [])) as any[]) || [];
        if (Array.isArray(rows) && rows.length > 0) {
          newestWordpressPost = rows[0];
        }
      }
    } catch {
      // ignore
    }

    try {
      const url = new URL(`${baseUrl}/rest/v1/posts`);
      url.searchParams.set('select', 'id,slug,created_at,metadata');
      url.searchParams.set('metadata->>isCommunityPost', 'eq.true');
      url.searchParams.set('order', 'created_at.desc');
      url.searchParams.set('limit', '1');

      const res = await fetch(url.toString(), { headers });
      if (res.ok) {
        const rows = ((await res.json().catch(() => [])) as any[]) || [];
        if (Array.isArray(rows) && rows.length > 0) {
          newestCommunityPost = rows[0];
        }
      }
    } catch {
      // ignore
    }

    let latestSyncRow: any = null;
    try {
      const url = new URL(`${baseUrl}/rest/v1/wordpress_sync`);
      url.searchParams.set('select', '*');
      url.searchParams.set('order', 'created_at.desc');
      url.searchParams.set('limit', '1');

      const res = await fetch(url.toString(), { headers });
      if (res.ok) {
        const rows = ((await res.json().catch(() => [])) as any[]) || [];
        if (Array.isArray(rows) && rows.length > 0) {
          latestSyncRow = rows[0];
        }
      }
    } catch {
      // ignore; table may not have created_at or may not exist
    }

    return json({
      kv,
      counts: {
        wordpressPosts: wpCount,
        communityPosts: communityCount,
      },
      newest: {
        wordpress: newestWordpressPost,
        community: newestCommunityPost,
      },
      latestSyncRow,
    });
  });

  // WORDPRESS ADMIN: MANUAL SYNC TRIGGER
  router.post('/api/admin/wordpress/sync', async (req: Request, env: Env) => {
    const { response } = await requireAdmin(req, env);
    if (response) return response;

    try {
      const currentUrl = new URL(req.url);
      currentUrl.pathname = '/api/wordpress/sync/manual';
      currentUrl.search = '';

      const headers = new Headers();
      if (env.WORDPRESS_SYNC_KEY) {
        headers.set('X-Sync-Key', env.WORDPRESS_SYNC_KEY);
      }
      headers.set('X-Scheduler', 'false');

      const res = await fetch(currentUrl.toString(), {
        method: 'POST',
        headers,
      });

      const bodyText = await res.text().catch(() => '');
      const contentType =
        res.headers.get('content-type') || 'application/json';

      return new Response(bodyText, {
        status: res.status,
        headers: {
          'Content-Type': contentType,
        },
      });
    } catch {
      return json({ error: 'Failed to trigger WordPress sync' }, { status: 500 });
    }
  });

  // WORDPRESS ADMIN: TOGGLE SYNC ENABLED/DISABLED
  router.post('/api/admin/wordpress/toggle', async (req: Request, env: Env) => {
    const { response } = await requireAdmin(req, env);
    if (response) return response;

    let body: any;
    try {
      body = (await (req as any).json?.().catch(() => ({}))) || {};
    } catch {
      body = {};
    }

    const enabled = Boolean(body.enabled);

    try {
      await updateSiteSetting(env, 'wordpress_sync_enabled', enabled ? 'true' : 'false');

      return json({ enabled });
    } catch {
      return json({ error: 'Failed to update WordPress sync setting' }, { status: 500 });
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