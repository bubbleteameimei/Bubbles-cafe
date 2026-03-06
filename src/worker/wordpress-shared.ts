import { callSupabaseRpc, type SupabaseEnv } from './shared';

export type WordPressSyncInfo = {
  success: boolean;
  postsProcessed: number;
  startedAt: Date;
  finishedAt: Date;
  error?: string | null;
  triggeredBy?: string | null;
  isScheduler?: boolean;
  failedPostIds?: number[];
};

export async function updateSiteSetting(
  env: SupabaseEnv,
  key: string,
  value: string,
): Promise<void> {
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

export async function logWordPressSyncActivity(env: SupabaseEnv, info: WordPressSyncInfo): Promise<void> {
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

export async function updateWordPressSyncMetadata(env: SupabaseEnv, info: WordPressSyncInfo): Promise<void> {
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
