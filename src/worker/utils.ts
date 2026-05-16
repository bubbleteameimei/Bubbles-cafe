// Shared Worker utilities for Bubble's Cafe Cloudflare Worker.

/** Normalize Supabase project URL (no trailing slash). */
export function normalizeSupabaseUrl(url: string): string {
  return (url || '').trim().replace(/\/+$/, '');
}

/** Keys safe to expose to the browser via /api/config/public. */
export function isPublicSupabaseAnonKey(key: string): boolean {
  const k = (key || '').trim();
  return k.startsWith('eyJ') || k.startsWith('sb_publishable_');
}

export function getPublicSupabaseConfig(env: Pick<Env, 'SUPABASE_URL' | 'SUPABASE_ANON_KEY'>) {
  const url = env.SUPABASE_URL ? normalizeSupabaseUrl(env.SUPABASE_URL) : '';
  const rawKey = (env.SUPABASE_ANON_KEY || '').trim();
  const anonKey = rawKey && isPublicSupabaseAnonKey(rawKey) ? rawKey : null;
  return {
    url: url || null,
    anonKey,
    configured: Boolean(url && rawKey),
    clientReady: Boolean(url && anonKey),
  };
}

export interface Env {
  // KV namespaces
  IDEMPOTENCY_KV: KVNamespace;
  USER_CACHE_KV: KVNamespace;
  SYNC_METADATA_KV: KVNamespace;
  ANALYTICS_KV: KVNamespace;
  CACHE_KV: KVNamespace;

  // Optional CORS allowlist (comma-separated origins)
  ADDITIONAL_CORS_ORIGINS?: string;

  // Durable Objects
  LOCKS_DO: DurableObjectNamespace;
  RATE_LIMIT_DO: DurableObjectNamespace;
  IDEMPOTENCY_DO: DurableObjectNamespace;

  // Supabase / database
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // Optional: helps /api/health/supabase detect config mismatches
  EXPECTED_SUPABASE_URL?: string;
  SUPABASE_POOLER_URL?: string;
  DATABASE_URL?: string;

  // WordPress / sync
  WORDPRESS_API: string;
  WORDPRESS_SYNC_KEY: string;

  // Security / auth
  CSRF_SECRET: string;
  STRIPE_WEBHOOK_SECRET: string;

  // Payments
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  PAYSTACK_BASE_URL?: string;
  PAYSTACK_LINK?: string;

  // Email
  EMAIL_PROVIDER_API_KEY: string;
  GMAIL_APP_PASSWORD: string;
  GMAIL_ADMIN_EMAIL: string;

  // Brevo (Sendinblue) HTTP email provider
  BREVO_API_KEY?: string;
  BREVO_FROM_EMAIL?: string;
  BREVO_FROM_NAME?: string;

  // OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_REDIRECT_URI?: string;

  // App URLs / environment
  FRONTEND_URL: string;
  BACKEND_BASE_URL?: string;
  NODE_ENV: string;
  ENABLE_WORDPRESS_SCHEDULER?: string;
}

// Minimal JSON helper (mirrors src/index.ts)
export const json = (data: any, init?: ResponseInit): Response =>
  new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    status: init?.status || 200,
  });

/**
 * Extract Bearer token from Authorization header (case-insensitive).
 * Duplicated from src/index.ts to avoid circular imports.
 */
export function getBearerToken(req: Request): string | null {
  try {
    const header = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    if (!header.toLowerCase().startsWith('bearer ')) {
      return null;
    }
    return header.slice(7).trim();
  } catch {
    return null;
  }
}

export {
  callSupabaseRpc,
  callSupabaseRpcAsAnon,
  callSupabaseRpcAsServiceRole,
  mapDbUserRowToApiUser,
} from './shared';

/**
 * Resolve numeric user id from Supabase JWT via the users table.
 * RLS on users ensures we only see the current user row.
 * Duplicated from src/index.ts for modular route files.
 */
export async function getSupabaseUserIdFromJwt(env: Env, token: string): Promise<number | null> {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return null;
    }
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    const url = `${baseUrl}/rest/v1/users?select=id&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      return null;
    }
    const rows = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(rows) || rows.length === 0 || rows[0]?.id == null) {
      return null;
    }
    const id = Number(rows[0].id);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

/**
 * Resolve current Supabase-authenticated user (id/email/username/isAdmin) from JWT.
 * Uses RLS on users table to restrict to the current row.
 * Duplicated from src/index.ts for modular route files.
 */
export async function getSupabaseCurrentUser(
  env: Env,
  token: string,
): Promise<{
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  fullName?: string | null;
  bio?: string | null;
  avatar?: string | null;
} | null> {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return null;
    }
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    const url = new URL(`${baseUrl}/rest/v1/users`);
    url.searchParams.set('select', 'id,email,username,is_admin,metadata');
    url.searchParams.set('limit', '1');

    const res = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      return null;
    }
    const rows = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }
    return mapDbUserRowToApiUser(rows[0]);
  } catch {
    return null;
  }
}

/**
 * Resolve a local posts.id from an external WordPress or numeric post ID.
 * Duplicated from src/index.ts to allow reuse in modular route files.
 */
export async function resolveLocalPostIdFromExternal(
  env: Env,
  externalId: number,
): Promise<number | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return null;
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
  const serviceHeaders: Record<string, string> = {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  // 1) Direct posts.id
  try {
    const byIdUrl = new URL(`${baseUrl}/rest/v1/posts`);
    byIdUrl.searchParams.set('select', 'id');
    byIdUrl.searchParams.set('id', `eq.${externalId}`);
    byIdUrl.searchParams.set('limit', '1');

    const res = await fetch(byIdUrl.toString(), { headers: serviceHeaders });
    if (res.ok) {
      const rows = (await res.json().catch(() => [])) as any[];
      if (Array.isArray(rows) && rows.length > 0 && rows[0]?.id != null) {
        const id = Number(rows[0].id);
        if (Number.isFinite(id)) {
          return id;
        }
      }
    }
  } catch {
    // ignore and continue
  }

  // 2) metadata.wordpressId mapping
  try {
    const byWpUrl = new URL(`${baseUrl}/rest/v1/posts`);
    byWpUrl.searchParams.set('select', 'id,metadata,slug');
    byWpUrl.searchParams.set('metadata->>wordpressId', `eq.${externalId}`);
    byWpUrl.searchParams.set('limit', '1');

    const res = await fetch(byWpUrl.toString(), { headers: serviceHeaders });
    if (res.ok) {
      const rows = (await res.json().catch(() => [])) as any[];
      if (Array.isArray(rows) && rows.length > 0 && rows[0]?.id != null) {
        const id = Number(rows[0].id);
        if (Number.isFinite(id)) {
          return id;
        }
      }
    }
  } catch {
    // ignore and continue
  }

  // 3) Fetch from WordPress API, upsert via RPC, then lookup by slug
  try {
    const wpBase =
      env.WORDPRESS_API ||
      'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';
    const wpSingleBase = wpBase.replace(/\/posts$/, '');
    const wpUrl = `${wpSingleBase}/posts/${externalId}`;

    const wpRes = await fetch(wpUrl);
    if (wpRes.ok) {
      const post = (await wpRes.json().catch(() => null)) as any;
      if (post && post.id != null) {
        const slug =
          typeof post.slug === 'string' && post.slug.trim()
            ? post.slug.trim()
            : `wordpress-post-${externalId}`;
        try {
          await callSupabaseRpc(env, 'upsert_wordpress_post', {
            post_id: externalId,
            title: post.title?.rendered ?? '',
            content: post.content?.rendered ?? '',
            excerpt: post.excerpt?.rendered ?? '',
            slug,
            date: post.date || new Date().toISOString(),
          });
        } catch {
          // ignore RPC errors; we'll still attempt lookup
        }

        try {
          const bySlugUrl = new URL(`${baseUrl}/rest/v1/posts`);
          bySlugUrl.searchParams.set('select', 'id');
          bySlugUrl.searchParams.set('slug', `eq.${slug}`);
          bySlugUrl.searchParams.set('limit', '1');

          const slugRes = await fetch(bySlugUrl.toString(), {
            headers: serviceHeaders,
          });
          if (slugRes.ok) {
            const rows = (await slugRes.json().catch(() => [])) as any[];
            if (Array.isArray(rows) && rows.length > 0 && rows[0]?.id != null) {
              const id = Number(rows[0].id);
              if (Number.isFinite(id)) {
                return id;
              }
            }
          }
        } catch {
          // ignore slug lookup errors
        }
      }
    }
  } catch {
    // ignore and fall through
  }

  return null;
}

/**
 * Build post summaries (basic fields + reactions + analytics) using Supabase REST.
 * Returns summaries keyed by the raw external IDs provided (which may be local IDs or WordPress IDs).
 * Duplicated from src/index.ts to allow reuse from modular route files.
 */
export async function buildPostSummaries(env: Env, rawIds: number[]): Promise<any[]> {
  try {
    const ids = Array.from(
      new Set(rawIds.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0)),
    ).slice(0, 50); // Cap to 50 IDs per call to avoid excessive fan-out

    if (!ids.length) {
      return [];
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return [];
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    const serviceHeaders: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    };

    // 1) Fetch direct local posts by id
    const directUrl = new URL(`${baseUrl}/rest/v1/posts`);
    directUrl.searchParams.set(
      'select',
      'id,title,slug,excerpt,created_at,baseline_likes,baseline_dislikes,likes_count,dislikes_count,metadata',
    );
    directUrl.searchParams.set('id', `in.(${ids.join(',')})`);

    let directRows: any[] = [];
    try {
      const res = await fetch(directUrl.toString(), {
        headers: serviceHeaders,
      });
      if (res.ok) {
        const rows = (await res.json().catch(() => [])) as any[];
        if (Array.isArray(rows)) {
          directRows = rows;
        }
      }
    } catch {
      // ignore; fallback mapping still works
    }

    const directMap = new Map<number, any>();
    const allRowsByLocalId = new Map<number, any>();

    for (const row of directRows) {
      const localId = Number(row.id);
      if (!Number.isFinite(localId)) continue;
      directMap.set(localId, row);
      allRowsByLocalId.set(localId, row);
    }

    // 2) Resolve external -> local ids for any ids not directly found
    const externalToLocal = new Map<number, number>();
    for (const rawId of ids) {
      if (directMap.has(rawId)) {
        externalToLocal.set(rawId, rawId);
        continue;
      }
      const localId = await resolveLocalPostIdFromExternal(env, rawId);
      if (localId && Number.isFinite(localId)) {
        externalToLocal.set(rawId, Number(localId));
      }
    }

    // 3) Fetch missing local rows
    const neededLocalIds: number[] = [];
    for (const localId of externalToLocal.values()) {
      if (!allRowsByLocalId.has(localId)) {
        neededLocalIds.push(localId);
      }
    }

    if (neededLocalIds.length) {
      const moreUrl = new URL(`${baseUrl}/rest/v1/posts`);
      moreUrl.searchParams.set(
        'select',
        'id,title,slug,excerpt,created_at,baseline_likes,baseline_dislikes,likes_count,dislikes_count,metadata',
      );
      moreUrl.searchParams.set('id', `in.(${neededLocalIds.join(',')})`);

      try {
        const res = await fetch(moreUrl.toString(), {
          headers: serviceHeaders,
        });
        if (res.ok) {
          const rows = (await res.json().catch(() => [])) as any[];
          if (Array.isArray(rows)) {
            for (const row of rows) {
              const localId = Number(row.id);
              if (!Number.isFinite(localId)) continue;
              allRowsByLocalId.set(localId, row);
            }
          }
        }
      } catch {
        // ignore; partial results still fine
      }
    }

    // 4) Fetch analytics (best-effort, may be disabled by RLS)
    const localPostIds = Array.from(new Set(Array.from(allRowsByLocalId.keys())));
    const analyticsMap = new Map<number, any>();

    if (localPostIds.length) {
      const analyticsUrl = new URL(`${baseUrl}/rest/v1/analytics`);
      analyticsUrl.searchParams.set(
        'select',
        'post_id,page_views,unique_visitors,average_read_time,bounce_rate,updated_at',
      );
      analyticsUrl.searchParams.set('post_id', `in.(${localPostIds.join(',')})`);

      try {
        const res = await fetch(analyticsUrl.toString(), {
          headers: serviceHeaders,
        });
        if (res.ok) {
          const rows = (await res.json().catch(() => [])) as any[];
          if (Array.isArray(rows)) {
            for (const row of rows) {
              const pid = Number(row.post_id ?? row.postId);
              if (!Number.isFinite(pid)) continue;
              analyticsMap.set(pid, row);
            }
          }
        }
      } catch {
        // analytics are optional; continue with reactions only
      }
    }

    // 5) Build ordered summaries keyed by raw external ids
    const results: any[] = [];

    for (const rawId of ids) {
      const localId = externalToLocal.get(rawId);
      if (!localId) continue;
      const row = allRowsByLocalId.get(localId);
      if (!row) continue;

      const baselineLikes = Number((row as any).baseline_likes ?? (row as any).baselineLikes ?? 0);
      const baselineDislikes = Number(
        (row as any).baseline_dislikes ?? (row as any).baselineDislikes ?? 0,
      );
      const likesCount = Number((row as any).likes_count ?? (row as any).likesCount ?? 0);
      const dislikesCount = Number((row as any).dislikes_count ?? (row as any).dislikesCount ?? 0);

      const metadata = (row as any).metadata;
      let wordpressId: number | undefined;
      try {
        const wpIdRaw =
          metadata && typeof metadata === 'object' ? (metadata as any).wordpressId : undefined;
        const wpIdNum = Number(wpIdRaw);
        if (Number.isFinite(wpIdNum) && wpIdNum > 0) {
          wordpressId = wpIdNum;
        }
      } catch {
        // ignore metadata parse issues
      }

      const a = analyticsMap.get(localId);
      const analytics =
        a && typeof a === 'object'
          ? {
              pageViews: Number((a as any).page_views ?? (a as any).pageViews ?? 0),
              uniqueVisitors: Number(
                (a as any).unique_visitors ?? (a as any).uniqueVisitors ?? 0,
              ),
              averageReadTime: Number(
                (a as any).average_read_time ?? (a as any).averageReadTime ?? 0,
              ),
              bounceRate: Number((a as any).bounce_rate ?? (a as any).bounceRate ?? 0),
              updatedAt: (a as any).updated_at ?? (a as any).updatedAt ?? null,
            }
          : null;

      results.push({
        id: Number(rawId),
        localPostId: localId,
        wordpressId,
        title: (row as any).title ?? '',
        slug: (row as any).slug ?? '',
        excerpt: (row as any).excerpt ?? '',
        createdAt: (row as any).created_at ?? (row as any).createdAt ?? new Date().toISOString(),
        reactions: {
          baselineLikes,
          baselineDislikes,
          likesCount,
          dislikesCount,
          totals: {
            likes: baselineLikes + likesCount,
            dislikes: baselineDislikes + dislikesCount,
          },
        },
        analytics,
      });
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Get a JSON value from CACHE_KV; returns null on missing/parse errors.
 */
export async function getJsonFromCache<T = any>(env: Env, key: string): Promise<T | null> {
  try {
    const cached = await env.CACHE_KV.get(key);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

/**
 * Put a JSON value into CACHE_KV with a TTL, ignoring write errors.
 */
export async function setJsonCache(
  env: Env,
  key: string,
  value: any,
  ttlSeconds: number,
): Promise<void> {
  try {
    await env.CACHE_KV.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
  } catch {
    // best-effort; cache failures should not break responses
  }
}

/**
 * Internal fallback handler.
 *
 * Mirrors src/index.ts proxyToBackend behavior but is exported so that
 * modular route files can reuse the same semantics.
 */
export async function proxyToBackend(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const hasSupabase = !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
  const token = getBearerToken(req);

  // Non-Supabase environments: respond explicitly or with safe defaults
  if (!hasSupabase) {
    // User-facing feedback pages should continue to work gracefully even
    // if Supabase is not configured; return empty data instead of errors.
    if (path.startsWith('/api/user/feedback/stats')) {
      return json({
        stats: {
          total: 0,
          pending: 0,
          reviewed: 0,
          resolved: 0,
          rejected: 0,
          responseRate: 0,
        },
        isAuthenticated: false,
      });
    }

    if (path.startsWith('/api/user/feedback')) {
      return json({ feedback: [], isAuthenticated: false });
    }

    if (path.startsWith('/api/bookmarks/migrate')) {
      return json({ success: false, message: 'Supabase not configured' }, { status: 500 });
    }

    // For all other API routes, surface the configuration issue
    return json({ error: 'Supabase not configured' }, { status: 500 });
  }

  // Supabase is configured but we reached the fallback: likely auth or runtime error

  // User/authenticated routes where missing JWT should be a 401
  if (
    path.startsWith('/api/bookmarks') ||
    path.startsWith('/api/notifications') ||
    path.startsWith('/api/reading-progress') ||
    path.startsWith('/api/tips') ||
    path.startsWith('/api/feedback')
  ) {
    if (!token) {
      const isAdminFeedback = path.startsWith('/api/feedback');
      return json(
        {
          error: isAdminFeedback ? 'Admin authentication required' : 'Authentication required',
        },
        { status: 401 },
      );
    }
  }

  // Generic fallback: internal error rather than proxying to legacy backend
  return json({ error: 'Service unavailable' }, { status: 500 });
}

/**
 * Send an email using Brevo (Sendinblue) HTTP API.
 * Returns true on accepted, false on error.
 */
export async function sendBrevoEmail(
  env: Env,
  options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    fromEmailOverride?: string;
    fromNameOverride?: string;
  },
): Promise<boolean> {
  const apiKey = env.BREVO_API_KEY;
  const fromEmail = options.fromEmailOverride || env.BREVO_FROM_EMAIL || env.GMAIL_ADMIN_EMAIL;
  const fromName =
    options.fromNameOverride ||
    env.BREVO_FROM_NAME ||
    'Bubble\'s Cafe';

  if (!apiKey || !fromEmail) {
    return false;
  }

  const htmlContent =
    options.html ||
    `<p>${options.text || ''}</p>`;
  const textContent =
    options.text ||
    options.html?.replace(/<[^>]*>/g, ' ') ||
    '';

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          email: fromEmail,
          name: fromName,
        },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent,
        textContent,
      }),
    });

    return res.ok;
  } catch {
    return false;
  }
}