/**
 * WordPress → database sync, shared by the admin endpoints and the in-process
 * scheduler. Replaces the Cloudflare Worker cron that used to run this.
 *
 * - New WordPress posts are inserted.
 * - Existing posts (matched by wordpressId, then slug) get title/content/excerpt
 *   refreshed when WordPress reports a newer `modified` time.
 * - Each run is recorded in activity_logs (action = 'wordpress_sync').
 * - Enabled/disabled state lives in site_settings ('wordpress_sync_enabled').
 */
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db';
import { activityLogs, posts, siteSettings, users } from '@shared/schema';

interface WordPressPost {
  id: number;
  slug: string;
  modified: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  categories?: number[];
  tags?: number[];
  featured_media?: number;
}

export interface SyncResult {
  success: boolean;
  created: number;
  updated: number;
  unchanged: number;
  /** Stories hidden because they were deleted/unpublished in WordPress. */
  removed: number;
  total: number;
  errors: string[];
  durationMs: number;
}

const SYNC_ACTION = 'wordpress_sync';
const ENABLED_KEY = 'wordpress_sync_enabled';
const DEFAULT_INTERVAL_MS = 30 * 60 * 1000;
const SYNC_USER_EMAILS = ['wordpress_import@local', 'wordpress-sync@bubblescafe.space', 'wordpress@bubblescafe.space'];

let running = false;
let timer: NodeJS.Timeout | null = null;
let lastRunAt: Date | null = null;
let nextRunAt: Date | null = null;

function wordpressApiBase(): string {
  const raw =
    process.env.WORDPRESS_API ||
    'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';
  return raw.split('?')[0];
}

export function syncIntervalMs(): number {
  const minutes = Number(process.env.WORDPRESS_SYNC_INTERVAL_MINUTES || 0);
  return minutes > 0 ? minutes * 60 * 1000 : DEFAULT_INTERVAL_MS;
}

function decodeEntities(input: string): string {
  return input
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8216;|&lsquo;/g, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

const plain = (html: string) => decodeEntities(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

function readingMinutes(html: string): number {
  const words = plain(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function getSyncUserId(): Promise<number> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.email, SYNC_USER_EMAILS))
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(users)
    .values({
      email: SYNC_USER_EMAILS[0],
      username: 'wordpress',
      password_hash: 'sync-not-a-login',
      isAdmin: false,
      metadata: { system: true, source: 'wordpress', displayName: 'WordPress Sync' },
    })
    .returning({ id: users.id });
  return created.id;
}

async function fetchAllWordPressPosts(): Promise<WordPressPost[]> {
  const fields = 'id,slug,modified,title,content,excerpt,categories,tags,featured_media';
  const all: WordPressPost[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`${wordpressApiBase()}?per_page=100&page=${page}&_fields=${fields}`, {
      signal: AbortSignal.timeout(20_000),
    });
    // WordPress returns 400 when asking past the last page.
    if (res.status === 400 && page > 1) break;
    if (!res.ok) throw new Error(`WordPress API responded ${res.status}`);
    const batch = (await res.json()) as WordPressPost[];
    all.push(...batch);
    const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    if (page >= totalPages || batch.length < 100) break;
  }
  return all;
}

export async function runWordPressSync(trigger: 'manual' | 'scheduled' = 'manual'): Promise<SyncResult> {
  if (running) {
    return { success: false, created: 0, updated: 0, unchanged: 0, removed: 0, total: 0, errors: ['A sync is already running'], durationMs: 0 };
  }
  running = true;
  const started = Date.now();
  const result: SyncResult = { success: true, created: 0, updated: 0, unchanged: 0, removed: 0, total: 0, errors: [], durationMs: 0 };

  try {
    const [wpPosts, authorId, deletedIds] = await Promise.all([fetchAllWordPressPosts(), getSyncUserId(), getDeletedWordPressIds()]);
    result.total = wpPosts.length;

    const existingRows = await db.select({ id: posts.id, slug: posts.slug, metadata: posts.metadata }).from(posts);
    const byWpId = new Map<number, any>();
    const bySlug = new Map<string, any>();
    for (const row of existingRows as any[]) {
      const wpId = Number((row.metadata as any)?.wordpressId);
      if (wpId) byWpId.set(wpId, row);
      bySlug.set(row.slug, row);
    }

    for (const wp of wpPosts) {
      try {
        const title = plain(wp.title?.rendered || '') || 'Untitled';
        const content = wp.content?.rendered || '';
        const excerpt = plain(wp.excerpt?.rendered || '').slice(0, 500);
        const slug = wp.slug || `wordpress-post-${wp.id}`;
        const wpMeta = {
          wordpressId: wp.id,
          source: 'wordpress_api',
          wpModified: wp.modified,
          categories: wp.categories ?? [],
          tags: wp.tags ?? [],
          featured_media: wp.featured_media ?? null,
        };

        const existing = byWpId.get(wp.id) ?? bySlug.get(slug);
        if (!existing && deletedIds.has(wp.id)) {
          result.unchanged++; // deleted here by an admin; leave it deleted
          continue;
        }
        if (!existing) {
          await db.insert(posts).values({
            title,
            content,
            excerpt,
            slug,
            authorId,
            isSecret: false,
            isAdminPost: true, // site story, not a community submission
            matureContent: false,
            readingTimeMinutes: readingMinutes(content),
            metadata: { ...wpMeta, syncedAt: new Date().toISOString() },
          });
          result.created++;
          continue;
        }

        const existingMeta = (existing.metadata ?? {}) as Record<string, any>;
        const wasRemoved = existingMeta.removedFromWordPress === true;
        const prevModified = existingMeta.wpModified;
        if (prevModified && prevModified === wp.modified && !wasRemoved) {
          result.unchanged++;
          continue;
        }

        await db
          .update(posts)
          .set({
            title,
            content,
            excerpt,
            readingTimeMinutes: readingMinutes(content),
            metadata: {
              ...existingMeta,
              ...wpMeta,
              // Republished in WordPress: make it visible again.
              ...(wasRemoved ? { status: 'publish', removedFromWordPress: false } : {}),
              syncedAt: new Date().toISOString(),
            },
          })
          .where(eq(posts.id, existing.id));
        result.updated++;
      } catch (error) {
        result.errors.push(`Post ${wp.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Stories deleted or unpublished in WordPress: hide them here too. Hidden rather than
    // deleted so their likes/comments survive if the story is republished. Only runs after
    // a complete, non-empty fetch so a WordPress outage can't hide the whole catalogue.
    if (wpPosts.length > 0) {
      const liveIds = new Set(wpPosts.map((wp) => wp.id));
      for (const row of existingRows as any[]) {
        const meta = (row.metadata ?? {}) as Record<string, any>;
        const wpId = Number(meta.wordpressId);
        if (!wpId || liveIds.has(wpId) || meta.removedFromWordPress === true) continue;
        try {
          await db
            .update(posts)
            .set({ metadata: { ...meta, status: 'hidden', removedFromWordPress: true, removedAt: new Date().toISOString() } })
            .where(eq(posts.id, row.id));
          result.removed++;
        } catch (error) {
          result.errors.push(`Hide post ${row.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : String(error));
  } finally {
    running = false;
    lastRunAt = new Date();
    result.durationMs = Date.now() - started;
  }

  try {
    await db.insert(activityLogs).values({
      action: SYNC_ACTION,
      details: { trigger, ...result, errors: result.errors.slice(0, 20) },
    });
  } catch (error) {
    console.error('Failed to record WordPress sync log:', error);
  }

  const summary = `${result.created} created, ${result.updated} updated, ${result.unchanged} unchanged, ${result.removed} hidden (deleted in WordPress) of ${result.total}`;
  if (result.success) console.log(`[wordpress-sync] ${trigger}: ${summary} in ${result.durationMs}ms`);
  else console.error(`[wordpress-sync] ${trigger} failed: ${result.errors[0]}`);
  return result;
}

// Stories an admin deleted here on purpose. Remembered by WordPress id so the next sync
// doesn't quietly bring them back.
const DELETED_KEY = 'wordpress_deleted_ids';

async function getDeletedWordPressIds(): Promise<Set<number>> {
  try {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, DELETED_KEY)).limit(1);
    const ids = row ? JSON.parse(row.value) : [];
    return new Set(Array.isArray(ids) ? ids.map(Number).filter(Boolean) : []);
  } catch {
    return new Set();
  }
}

/** Call before deleting posts: any that came from WordPress won't be re-imported. */
export async function rememberDeletedWordPressPosts(postIds: number[]): Promise<void> {
  if (!postIds.length) return;
  try {
    const rows = await db.select({ metadata: posts.metadata }).from(posts).where(inArray(posts.id, postIds));
    const wpIds = rows.map((r: any) => Number(r.metadata?.wordpressId)).filter(Boolean);
    if (!wpIds.length) return;
    const all = await getDeletedWordPressIds();
    wpIds.forEach((id: number) => all.add(id));
    const value = JSON.stringify([...all]);
    await db
      .insert(siteSettings)
      .values({ key: DELETED_KEY, value, category: 'wordpress', description: 'WordPress stories deleted by an admin (not re-imported)' })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  } catch (error) {
    console.error('[wordpress-sync] could not record deleted posts:', error);
  }
}

export async function isSyncEnabled(): Promise<boolean> {
  try {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, ENABLED_KEY)).limit(1);
    if (row) return row.value === 'true';
  } catch {
    // fall through to env default
  }
  return process.env.ENABLE_WORDPRESS_SCHEDULER !== 'false';
}

export async function setSyncEnabled(enabled: boolean): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key: ENABLED_KEY, value: String(enabled), category: 'wordpress', description: 'Automatic WordPress sync' })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: String(enabled), updatedAt: new Date() } });
}

export async function getSyncLogs(limit = 20) {
  const rows = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.action, SYNC_ACTION))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
  return rows.map((row: any) => {
    const d = (row.details ?? {}) as Record<string, any>;
    return {
      id: String(row.id),
      timestamp: row.createdAt,
      status: d.success === false ? 'error' : 'success',
      message:
        d.success === false
          ? (d.errors?.[0] ?? 'Sync failed')
          : `${d.trigger ?? 'manual'} sync: ${d.created ?? 0} created, ${d.updated ?? 0} updated`,
      postsProcessed: Number(d.created ?? 0) + Number(d.updated ?? 0),
      duration: Number(d.durationMs ?? 0),
    };
  });
}

export async function getSyncStatus() {
  const [logs, enabled, countRow] = await Promise.all([
    getSyncLogs(10),
    isSyncEnabled(),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(sql`${posts.metadata}->>'source' = 'wordpress_api'`),
  ]);
  const last = logs[0];
  return {
    isRunning: running,
    enabled,
    lastSync: (lastRunAt ?? last?.timestamp ?? null) as Date | string | null,
    nextSync: enabled && nextRunAt ? nextRunAt.toISOString() : null,
    postsCount: Number(countRow[0]?.count ?? 0),
    totalProcessed: logs.reduce((sum: number, l: { postsProcessed: number }) => sum + l.postsProcessed, 0),
    syncInterval: syncIntervalMs(),
    errors: logs.filter((l: { status: string }) => l.status === 'error').slice(0, 5).map((l: any) => ({
      id: l.id,
      timestamp: l.timestamp,
      message: l.message,
    })),
  };
}

/** Starts the periodic sync. Safe to call once at boot; checks the enabled flag each tick. */
export function startWordPressScheduler(): void {
  if (timer || process.env.NODE_ENV === 'test') return;
  const interval = syncIntervalMs();
  const tick = async () => {
    nextRunAt = new Date(Date.now() + interval);
    try {
      if (await isSyncEnabled()) await runWordPressSync('scheduled');
    } catch (error) {
      console.error('[wordpress-sync] scheduled run failed:', error);
    }
  };
  // First run shortly after boot (lets the DB connection settle), then on the interval.
  nextRunAt = new Date(Date.now() + 60_000);
  setTimeout(tick, 60_000).unref();
  timer = setInterval(tick, interval);
  timer.unref();
}
