// src/index.ts
import { Router } from "itty-router";

// Minimal JSON helper to avoid extras dependency
const json = (data: any, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    status: init?.status || 200,
  });

const router = Router();

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Env {
  IDEMPOTENCY_KV: KVNamespace;
  USER_CACHE_KV: KVNamespace;
  SYNC_METADATA_KV: KVNamespace;
  ANALYTICS_KV: KVNamespace;
  CACHE_KV: KVNamespace;

  LOCKS_DO: DurableObjectNamespace;
  RATE_LIMIT_DO: DurableObjectNamespace;
  IDEMPOTENCY_DO: DurableObjectNamespace;

  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_POOLER_URL?: string;
  DATABASE_URL?: string;
  WORDPRESS_API: string;
  WORDPRESS_SYNC_KEY: string;
  CSRF_SECRET: string;
  STRIPE_WEBHOOK_SECRET: string;
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  EMAIL_PROVIDER_API_KEY: string;
  GMAIL_APP_PASSWORD: string;
  GMAIL_ADMIN_EMAIL: string;

  GOOGLE_CLIENT_ID?: string;
  GOOGLE_REDIRECT_URI?: string;

  BACKEND_BASE_URL: string;
  FRONTEND_URL: string;
  NODE_ENV: string;
  ENABLE_WORDPRESS_SCHEDULER: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function callSupabaseRpc(
  env: Env,
  functionName: string,
  payload: Record<string, any>
): Promise<Response> {
  const url = `${env.SUPABASE_URL}/rest/v1/rpc/${functionName}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      "X-Client-Info": "bubbles-worker",
    },
    body: JSON.stringify(payload),
  });
}

async function verifySupabaseJwt(token: string, env: Env): Promise<boolean> {
  try {
    const url = `${env.SUPABASE_URL}/auth/v1/user`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface SupabaseAuthUser {
  id: string;
  email: string | null;
  user_metadata?: any;
  app_metadata?: any;
  [key: string]: any;
}

async function getSupabaseAuthUser(
  env: Env,
  token: string
): Promise<SupabaseAuthUser | null> {
  if (!env.SUPABASE_URL || !token) return null;
  try {
    const base = env.SUPABASE_URL.replace(/\/+$/, "");
    const res = await fetch(`${base}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const parsed = (await res.json().catch(() => null)) as any;
    if (!parsed || !parsed.id) return null;
    return {
      id: String(parsed.id),
      email:
        typeof parsed.email === "string"
          ? parsed.email.toLowerCase()
          : null,
      user_metadata: parsed.user_metadata ?? {},
      app_metadata: parsed.app_metadata ?? {},
      ...parsed,
    } as SupabaseAuthUser;
  } catch {
    return null;
  }
}

function mapDbUserRowToApiUser(row: any): {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  fullName?: string | null;
  bio?: string | null;
  avatar?: string | null;
} {
  const meta =
    row && typeof row.metadata === "object" && row.metadata !== null
      ? (row.metadata as any)
      : {};
  const fullName =
    meta.fullName ??
    meta.displayName ??
    null;
  const avatar =
    meta.avatar ??
    meta.photoURL ??
    null;
  const bio = meta.bio ?? null;
  return {
    id: Number(row.id),
    email: String(row.email || ""),
    username: String(row.username || ""),
    isAdmin: row.is_admin === true || row.isAdmin === true,
    fullName,
    bio,
    avatar,
  };
}

async function upsertLocalUserFromSupabaseAuth(
  env: Env,
  authUser: SupabaseAuthUser
): Promise<{
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  fullName?: string | null;
  bio?: string | null;
  avatar?: string | null;
} | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const headers: Record<string, string> = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const email =
    (authUser.email && authUser.email.toLowerCase().trim()) || null;
  const supabaseUserId = String(authUser.id || "");
  const userMeta = (authUser.user_metadata || {}) as any;
  const appMeta = (authUser.app_metadata || {}) as any;
  const provider =
    appMeta.provider ||
    appMeta.provider_id ||
    "supabase";
  const displayName =
    userMeta.full_name ||
    userMeta.name ||
    userMeta.displayName ||
    null;
  const photoURL =
    userMeta.avatar_url ||
    userMeta.picture ||
    null;

  // Try lookup by supabaseUserId in metadata
  let row: any | null = null;
  try {
    const byIdUrl = new URL(`${baseUrl}/rest/v1/users`);
    byIdUrl.searchParams.set("select", "id,email,username,is_admin,metadata");
    byIdUrl.searchParams.set(
      "metadata->>supabaseUserId",
      `eq.${supabaseUserId}`
    );
    byIdUrl.searchParams.set("limit", "1");
    const res = await fetch(byIdUrl.toString(), { headers });
    if (res.ok) {
      const rows = (await res.json().catch(() => [])) as any[];
      if (Array.isArray(rows) && rows.length > 0) {
        row = rows[0];
      }
    }
  } catch {
    // ignore lookup errors
  }

  // Fallback: lookup by email
  if (!row && email) {
    try {
      const byEmailUrl = new URL(`${baseUrl}/rest/v1/users`);
      byEmailUrl.searchParams.set(
        "select",
        "id,email,username,is_admin,metadata"
      );
      byEmailUrl.searchParams.set("email", `eq.${email}`);
      byEmailUrl.searchParams.set("limit", "1");
      const res = await fetch(byEmailUrl.toString(), { headers });
      if (res.ok) {
        const rows = (await res.json().catch(() => [])) as any[];
        if (Array.isArray(rows) && rows.length > 0) {
          row = rows[0];
        }
      }
    } catch {
      // ignore
    }
  }

  const nowIso = new Date().toISOString();

  if (row) {
    let meta =
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as any)
        : {};
    meta = {
      ...meta,
      supabaseUserId,
      provider,
      lastLogin: nowIso,
      displayName: meta.displayName ?? displayName ?? null,
      fullName: meta.fullName ?? displayName ?? null,
      photoURL: meta.photoURL ?? photoURL ?? null,
      avatar: meta.avatar ?? photoURL ?? null,
      email: meta.email ?? email ?? meta.email ?? null,
    };

    try {
      const patchUrl = new URL(`${baseUrl}/rest/v1/users`);
      patchUrl.searchParams.set("id", `eq.${row.id}`);
      const patchRes = await fetch(patchUrl.toString(), {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify({ metadata: meta }),
      });
      if (patchRes.ok) {
        const rows = (await patchRes.json().catch(() => [])) as any[];
        if (Array.isArray(rows) && rows.length > 0) {
          row = rows[0];
        } else {
          row.metadata = meta;
        }
      } else {
        row.metadata = meta;
      }
    } catch {
      row.metadata = meta;
    }

    return mapDbUserRowToApiUser(row);
  }

  if (!email) {
    return null;
  }

  // Create new local user
  const usernameBase =
    (userMeta.username as string) ||
    (email ? email.split("@")[0] : "user");
  const username = usernameBase.trim() || "user";
  const passwordHashPlaceholder = "supabase-auth-only";

  const insertPayload = {
    email,
    username,
    password_hash: passwordHashPlaceholder,
    is_admin: false,
    metadata: {
      email,
      supabaseUserId,
      provider,
      lastLogin: nowIso,
      displayName,
      fullName: displayName,
      photoURL,
      avatar: photoURL,
    },
  };

  try {
    const insertRes = await fetch(`${baseUrl}/rest/v1/users`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(insertPayload),
    });
    if (!insertRes.ok) {
      return null;
    }
    const rows = (await insertRes.json().catch(() => [])) as any[];
    if (!Array.isArray(rows) || !rows.length) {
      return null;
    }
    return mapDbUserRowToApiUser(rows[0]);
  } catch {
    return null;
  }
}

async function checkRateLimit(
  env: Env,
  key: string,
  limit: number,
  window: number
): Promise<boolean> {
  const id = env.RATE_LIMIT_DO.idFromName(key);
  const obj = env.RATE_LIMIT_DO.get(id);
  const response = await obj.fetch(
    new Request("https://worker", {
      method: "POST",
      body: JSON.stringify({ key, limit, window }),
    })
  );
  const result = (await response.json()) as any;
  return result.allowed !== false;
}

async function getOrCheckIdempotency(
  env: Env,
  key: string,
  ttl: number
): Promise<{ isNew: boolean; cached?: any }> {
  const id = env.IDEMPOTENCY_DO.idFromName(key);
  const obj = env.IDEMPOTENCY_DO.get(id);
  const response = await obj.fetch(
    new Request("https://worker", {
      method: "POST",
      body: JSON.stringify({ key, ttl }),
    })
  );
  const result = (await response.json()) as any;
  return { isNew: !result.cached, cached: result.cached };
}

/**
 * Extract Bearer token from Authorization header (case-insensitive).
 */
function getBearerToken(req: Request): string | null {
  try {
    const header =
      req.headers.get("Authorization") ||
      req.headers.get("authorization") ||
      "";
    if (!header.toLowerCase().startsWith("bearer ")) {
      return null;
    }
    return header.slice(7).trim();
  } catch {
    return null;
  }
}

/**
 * Resolve numeric user id from Supabase JWT via the users table.
 * RLS on users ensures we only see the current user row.
 */
async function getSupabaseUserIdFromJwt(
  env: Env,
  token: string
): Promise<number | null> {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return null;
    }
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = `${baseUrl}/rest/v1/users?select=id&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
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
 */
async function getSupabaseCurrentUser(
  env: Env,
  token: string
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
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/users`);
    url.searchParams.set("select", "id,email,username,is_admin,metadata");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
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
 * Resolve a local posts.id from an external WordPress post ID.
 * Strategy:
 *   1) Try direct posts.id match
 *   2) Try metadata.wordpressId mapping
 *   3) Fetch the WordPress post, upsert via RPC, then resolve by slug
 */
async function resolveLocalPostIdFromExternal(
  env: Env,
  externalId: number
): Promise<number | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return null;
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
  const serviceHeaders: Record<string, string> = {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  // 1) Direct posts.id
  try {
    const byIdUrl = new URL(`${baseUrl}/rest/v1/posts`);
    byIdUrl.searchParams.set("select", "id");
    byIdUrl.searchParams.set("id", `eq.${externalId}`);
    byIdUrl.searchParams.set("limit", "1");

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
    byWpUrl.searchParams.set("select", "id,metadata,slug");
    byWpUrl.searchParams.set("metadata->>wordpressId", `eq.${externalId}`);
    byWpUrl.searchParams.set("limit", "1");

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
      "https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts";
    const wpSingleBase = wpBase.replace(/\/posts$/, "");
    const wpUrl = `${wpSingleBase}/posts/${externalId}`;

    const wpRes = await fetch(wpUrl);
    if (wpRes.ok) {
      const post = (await wpRes.json().catch(() => null)) as any;
      if (post && post.id != null) {
        const slug =
          typeof post.slug === "string" && post.slug.trim()
            ? post.slug.trim()
            : `wordpress-post-${externalId}`;
        try {
          await callSupabaseRpc(env, "upsert_wordpress_post", {
            post_id: externalId,
            title: post.title?.rendered ?? "",
            content: post.content?.rendered ?? "",
            excerpt: post.excerpt?.rendered ?? "",
            slug,
            date: post.date || new Date().toISOString(),
          });
        } catch {
          // ignore RPC errors; we'll still attempt lookup
        }

        try {
          const bySlugUrl = new URL(`${baseUrl}/rest/v1/posts`);
          bySlugUrl.searchParams.set("select", "id");
          bySlugUrl.searchParams.set("slug", `eq.${slug}`);
          bySlugUrl.searchParams.set("limit", "1");

          const slugRes = await fetch(bySlugUrl.toString(), {
            headers: serviceHeaders,
          });
          if (slugRes.ok) {
            const rows = (await slugRes.json().catch(() => [])) as any[];
            if (
              Array.isArray(rows) &&
              rows.length > 0 &&
              rows[0]?.id != null
            ) {
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

// Simple HTML stripper for safe text rendering in search/trending responses
function stripHtml(value: any): string {
  try {
    const str = String(value ?? "");
    return str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

/**
 * Best-effort upsert of a text-based site setting in Supabase.
 * Uses service role key when available but falls back to anon key.
 */
async function updateSiteSetting(env: Env, key: string, value: string): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return;
  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

  const url = new URL(`${baseUrl}/rest/v1/site_settings`);
  url.searchParams.set("on_conflict", "key");

  try {
    await fetch(url.toString(), {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        key,
        value,
        category: "wordpress",
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
  }
): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
  const url = new URL(`${baseUrl}/rest/v1/activity_logs`);

  const durationMs = info.finishedAt.getTime() - info.startedAt.getTime();

  const details = {
    type: "wordpress_sync",
    status: info.success ? "success" : "error",
    postsProcessed: info.postsProcessed,
    startedAt: info.startedAt.toISOString(),
    finishedAt: info.finishedAt.toISOString(),
    durationMs,
    error: info.error || null,
    triggeredBy: info.triggeredBy || null,
    isScheduler: info.isScheduler === true,
  };

  try {
    await fetch(url.toString(), {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_id: null,
        action: "wordpress_sync",
        details,
        ip_address: null,
        user_agent: "worker",
      }),
    });
  } catch {
    // Best-effort logging only
  }
}

/**
 * Update both site settings and activity logs after a WordPress sync run.
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
  }
): Promise<void> {
  try {
    await updateSiteSetting(env, "last_wordpress_sync", String(info.finishedAt.getTime()));
  } catch {
    // ignore
  }

  try {
    await logWordPressSyncActivity(env, info);
  } catch {
    // ignore
  }
}

// In-memory cache and trending tracker for search (ephemeral per Worker isolate)
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const searchCache = new Map<string, { ts: number; data: any }>();
const trendingQueries = new Map<string, number>();

function makeSearchCacheKey(params: Record<string, unknown>): string {
  return JSON.stringify(params);
}

function recordTrendingQuery(query: string): void {
  try {
    const key = query.trim().toLowerCase().slice(0, 80);
    if (!key) return;
    trendingQueries.set(key, (trendingQueries.get(key) || 0) + 1);
  } catch {
    // ignore
  }
}

/**
 * Internal fallback handler.
 *
 * Previously, this forwarded requests to an Express/Render backend using
 * BACKEND_BASE_URL. That backend is now retired; this function now returns
 * explicit JSON responses (401/500 or safe defaults) instead of proxying.
 */
async function proxyToBackend(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const hasSupabase = !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
  const token = getBearerToken(req);

  // Non-Supabase environments: respond explicitly or with safe defaults
  if (!hasSupabase) {
    // User-facing feedback pages should continue to work gracefully even
    // if Supabase is not configured; return empty data instead of errors.
    if (path.startsWith("/api/user/feedback/stats")) {
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

    if (path.startsWith("/api/user/feedback")) {
      return json({ feedback: [], isAuthenticated: false });
    }

    if (path.startsWith("/api/bookmarks/migrate")) {
      return json(
        { success: false, message: "Supabase not configured" },
        { status: 500 },
      );
    }

    // For all other API routes, surface the configuration issue
    return json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  // Supabase is configured but we reached the fallback: likely auth or runtime error

  // User/authenticated routes where missing JWT should be a 401
  if (
    path.startsWith("/api/bookmarks") ||
    path.startsWith("/api/notifications") ||
    path.startsWith("/api/reading-progress") ||
    path.startsWith("/api/tips") ||
    path.startsWith("/api/feedback")
  ) {
    if (!token) {
      const isAdminFeedback = path.startsWith("/api/feedback");
      return json(
        {
          error: isAdminFeedback
            ? "Admin authentication required"
            : "Authentication required",
        },
        { status: 401 },
      );
    }
  }

  // Generic fallback: internal error rather than proxying to legacy backend
  return json(
    { error: "Service unavailable" },
    { status: 500 },
  );
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

// HEALTH
router.get("/api/health", async (_req: Request, _env: Env) => {
  try {
    const started = Date.now();
    const healthRes = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: 0, // Workers runtime has no process.uptime
      latency: Date.now() - started,
    };

    return json(healthRes, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return json({ status: "error", message: String(error) }, { status: 500 });
  }
});

router.get("/health", async () => {
  return json({ status: "ok" });
});

// CSRF TOKEN: compatibility endpoint for legacy clients
// Note: Worker APIs are JWT-based and do not require CSRF protection.
// This endpoint returns a stateless token so clients expecting /api/csrf-token
// can continue to function without relying on the legacy Express backend.
router.get("/api/csrf-token", async (_req: Request) => {
  try {
    const token = crypto.randomUUID();
    const headers: Record<string, string> = {
      "Cache-Control": "no-store, max-age=0",
    };
    try {
      headers["Set-Cookie"] =
        `XSRF-TOKEN=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Secure`;
    } catch {
      // Ignore cookie errors (non-browser contexts)
    }
    return json({ csrfToken: token }, { headers });
  } catch {
    return json({ csrfToken: null }, { status: 200 });
  }
});

// CONFIG: Public client bootstrap (Supabase, URLs, Google OAuth)
router.get("/api/config/public", async (req: Request, env: Env) => {
  try {
    const url = new URL(req.url);
    const protocol = url.protocol; // e.g. "https:"
    const host = url.host.toLowerCase();

    const apiBase = (() => {
      try {
        if (host.startsWith("api.")) return `${protocol}//${host}`;
        const cleanHost = host.startsWith("www.") ? host.slice(4) : host;
        return `${protocol}//api.${cleanHost}`;
      } catch {
        return "https://api.bubblescafe.space";
      }
    })();

    const frontendBase = (env.FRONTEND_URL || "https://bubblescafe.space").replace(/\/+$/, "");

    const supabaseUrl = env.SUPABASE_URL || "";
    const supabaseAnonKey = env.SUPABASE_ANON_KEY || "";

    const googleClientId = env.GOOGLE_CLIENT_ID || null;
    const googleRedirectUri =
      env.GOOGLE_REDIRECT_URI || `${apiBase}/api/auth/callback`;

    const payload = {
      apiBase,
      frontendUrl: frontendBase,
      supabase: {
        url: supabaseUrl || null,
        anonKey: supabaseAnonKey || null,
      },
      googleOAuth: {
        clientId: googleClientId,
        redirectUri: googleRedirectUri,
      },
    };

    return json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e) {
    return json(
      { error: "Failed to load public configuration" },
      { status: 500 }
    );
  }
});

// AUTH: Supabase JWT login -> local user profile
router.post(
  "/api/auth/supabase/login",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      let token: string | null = null;
      const header =
        req.headers.get("Authorization") ||
        req.headers.get("authorization") ||
        "";
      if (header.toLowerCase().startsWith("bearer ")) {
        token = header.slice(7).trim();
      }

      if (!token) {
        const body = (await (req as any).json?.().catch(() => ({}))) || {};
        if (
          body &&
          typeof body.access_token === "string" &&
          body.access_token.trim()
        ) {
          token = body.access_token.trim();
        }
      }

      if (!token) {
        return json(
          { error: "Missing access_token (Bearer or body)" },
          { status: 400 }
        );
      }

      const authUser = await getSupabaseAuthUser(env, token);
      if (!authUser || !authUser.id) {
        return json(
          { error: "Invalid Supabase token" },
          { status: 401 }
        );
      }

      const localUser = await upsertLocalUserFromSupabaseAuth(
        env,
        authUser
      );

      if (localUser) {
        return json({ success: true, user: localUser });
      }

      const fallbackEmail =
        authUser.email && authUser.email.trim()
          ? authUser.email.trim()
          : "";
      const fallbackUsername =
        (authUser.user_metadata &&
          typeof authUser.user_metadata.username === "string" &&
          authUser.user_metadata.username.trim()) ||
        (fallbackEmail
          ? fallbackEmail.split("@")[0]
          : "user");

      const fallbackUser = {
        id: -1,
        email: fallbackEmail,
        username: fallbackUsername,
        isAdmin: false,
        fullName:
          (authUser.user_metadata &&
            (authUser.user_metadata.full_name ||
              authUser.user_metadata.name ||
              authUser.user_metadata.displayName)) ||
          null,
        bio: null,
        avatar:
          (authUser.user_metadata &&
            (authUser.user_metadata.avatar_url ||
              authUser.user_metadata.picture)) ||
          null,
      };

      return json({ success: true, user: fallbackUser });
    } catch {
      return json(
        { error: "Failed to process Supabase login" },
        { status: 500 }
      );
    }
  }
);

// AUTH STATUS: simple check based on Supabase JWT
router.get(
  "/api/auth/status",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const header =
        req.headers.get("Authorization") ||
        req.headers.get("authorization") ||
        "";
      if (!header.toLowerCase().startsWith("bearer ")) {
        return json({
          isAuthenticated: false,
          authenticated: false,
          user: null,
        });
      }
      const token = header.slice(7).trim();
      if (!token) {
        return json({
          isAuthenticated: false,
          authenticated: false,
          user: null,
        });
      }

      const authUser = await getSupabaseAuthUser(env, token);
      if (!authUser || !authUser.id) {
        return json({
          isAuthenticated: false,
          authenticated: false,
          user: null,
        });
      }

      const localUser = await upsertLocalUserFromSupabaseAuth(
        env,
        authUser
      );

      if (localUser) {
        return json({
          isAuthenticated: true,
          authenticated: true,
          user: localUser,
        });
      }

      const email =
        authUser.email && authUser.email.trim()
          ? authUser.email.trim()
          : "";
      const username =
        (authUser.user_metadata &&
          typeof authUser.user_metadata.username === "string" &&
          authUser.user_metadata.username.trim()) ||
        (email ? email.split("@")[0] : "user");

      const user = {
        id: -1,
        email,
        username,
        isAdmin: false,
        fullName:
          (authUser.user_metadata &&
            (authUser.user_metadata.full_name ||
              authUser.user_metadata.name ||
              authUser.user_metadata.displayName)) ||
          null,
        bio: null,
        avatar:
          (authUser.user_metadata &&
            (authUser.user_metadata.avatar_url ||
              authUser.user_metadata.picture)) ||
          null,
      };

      return json({
        isAuthenticated: true,
        authenticated: true,
        user,
      });
    } catch {
      return json({
        isAuthenticated: false,
        authenticated: false,
        user: null,
      });
    }
  }
);

// ERROR REPORTING endpoint used by client metrics logger
router.post("/api/errors", async (req: Request) => {
  try {
    const body = await req.json().catch(() => ({}));
    const id = (body as any)?.id;
    const message = (body as any)?.message;
    const extra = (body as any)?.extra;

    // Log to Worker logs for observability
    console.warn("[ClientError]", { id, message, extra });

    return new Response(null, { status: 204 });
  } catch {
    // Even on parse errors, respond 204 to avoid impacting client UX
    return new Response(null, { status: 204 });
  }
});

// ANALYTICS: helpers and write to KV queue

async function getAnalyticsSummaryFromSupabase(env: Env): Promise<{
  totalViews: number;
  uniqueVisitors: number;
  avgReadTime: number;
  bounceRate: number;
}> {
  const defaults = {
    totalViews: 0,
    uniqueVisitors: 0,
    avgReadTime: 0,
    bounceRate: 0,
  };

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return defaults;
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/analytics`);
    url.searchParams.set(
      "select",
      "page_views,unique_visitors,average_read_time,bounce_rate"
    );
    url.searchParams.set("limit", "10000");

    const res = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return defaults;
    }

    const rows = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return defaults;
    }

    let totalViews = 0;
    let uniqueVisitors = 0;
    let totalReadTime = 0;
    let readTimeCount = 0;
    let totalBounce = 0;
    let bounceCount = 0;

    for (const row of rows) {
      const views = Number(row.page_views ?? row.pageViews ?? 0);
      const visitors = Number(row.unique_visitors ?? row.uniqueVisitors ?? 0);
      const avgRead = Number(
        row.average_read_time ?? row.averageReadTime ?? 0
      );
      const bounce = Number(row.bounce_rate ?? row.bounceRate ?? 0);

      if (Number.isFinite(views)) totalViews += views;
      if (Number.isFinite(visitors)) uniqueVisitors += visitors;
      if (Number.isFinite(avgRead) && avgRead > 0) {
        totalReadTime += avgRead;
        readTimeCount += 1;
      }
      if (Number.isFinite(bounce)) {
        totalBounce += bounce;
        bounceCount += 1;
      }
    }

    const avgReadTime =
      readTimeCount > 0 ? totalReadTime / readTimeCount : 0;
    const bounceRate = bounceCount > 0 ? totalBounce / bounceCount : 0;

    return {
      totalViews,
      uniqueVisitors,
      avgReadTime,
      bounceRate,
    };
  } catch {
    return defaults;
  }
}

async function getDeviceDistributionFromSupabase(env: Env): Promise<{
  desktop: number;
  mobile: number;
  tablet: number;
}> {
  const defaults = {
    desktop: 0.7,
    mobile: 0.25,
    tablet: 0.05,
  };

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return defaults;
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/analytics`);
    url.searchParams.set("select", "device_stats");

    const res = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return defaults;
    }

    const rows = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return defaults;
    }

    let desktop = 0;
    let mobile = 0;
    let tablet = 0;

    for (const row of rows) {
      const stats = row.device_stats as any;
      if (!stats || typeof stats !== "object") continue;
      desktop += Number(stats.desktop ?? 0);
      mobile += Number(stats.mobile ?? 0);
      tablet += Number(stats.tablet ?? 0);
    }

    const total = desktop + mobile + tablet;
    if (!Number.isFinite(total) || total <= 0) {
      return defaults;
    }

    return {
      desktop: desktop / total,
      mobile: mobile / total,
      tablet: tablet / total,
    };
  } catch {
    return defaults;
  }
}

async function buildReadingTimeAnalytics(env: Env): Promise<any> {
  const summary = await getAnalyticsSummaryFromSupabase(env);
  const avgReadTime =
    Number.isFinite(summary.avgReadTime) && summary.avgReadTime > 0
      ? summary.avgReadTime
      : 180;
  const totalViewsBase =
    Number.isFinite(summary.totalViews) && summary.totalViews > 0
      ? summary.totalViews
      : 1000;

  const baseStats = {
    avgReadingTime: avgReadTime,
    totalViews: totalViewsBase,
    bounceRate:
      Number.isFinite(summary.bounceRate) && summary.bounceRate > 0
        ? summary.bounceRate
        : 0,
    changeFromLastPeriod: {
      readingTime: { value: 5.2, trend: "up" as const },
      views: { value: 12.7, trend: "up" as const },
    },
    averageScrollDepth: 68.5,
  };

  // Top stories
  let topStories: any[] = [];
  try {
    const posts = await fetchSupabasePosts(env);
    const selected = posts.slice(0, 5);
    topStories = selected.map((story: any) => {
      const avgReadingTime = Math.max(60, avgReadTime);
      const id = Number(story.id) || 0;
      const views =
        id > 0
          ? id * 50 + Math.floor(Math.random() * 200)
          : 100 + Math.floor(Math.random() * 300);

      return {
        id,
        title: story.title ?? "Untitled story",
        slug: story.slug || String(id || ""),
        avgReadingTime,
        views,
      };
    });
  } catch {
    topStories = [];
  }

  // Time series data
  const now = new Date();
  const dailyData: any[] = [];
  const weeklyData: any[] = [];
  const monthlyData: any[] = [];

  // Daily data (last 30 days)
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const dayValue = date.getDate();
    const monthValue = date.getMonth() + 1;
    const factor = ((dayValue + monthValue) % 5) + 0.5;

    dailyData.push({
      date: date.toISOString().split("T")[0],
      avgTime: Math.round(
        baseStats.avgReadingTime * (0.75 + factor * 0.1)
      ),
      storyViews: Math.round(
        baseStats.totalViews / 30 * (0.8 + factor * 0.1)
      ),
      scrollDepth: Math.min(
        100,
        Math.round(
          baseStats.averageScrollDepth * (0.9 + factor * 0.05)
        )
      ),
    });
  }

  // Weekly data (last 12 weeks)
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i * 7);

    const weekNum = Math.floor(date.getDate() / 7) + 1;
    const monthValue = date.getMonth() + 1;
    const factor = ((weekNum + monthValue) % 4) + 0.7;

    weeklyData.push({
      date: date.toISOString().split("T")[0],
      avgTime: Math.round(
        baseStats.avgReadingTime * (0.8 + factor * 0.1)
      ),
      storyViews: Math.round(
        baseStats.totalViews / 12 * (0.85 + factor * 0.1)
      ),
      scrollDepth: Math.min(
        100,
        Math.round(
          baseStats.averageScrollDepth * (0.95 + factor * 0.05)
        )
      ),
    });
  }

  // Monthly data (last 6 months)
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);

    const monthValue = date.getMonth() + 1;
    const factor = (monthValue % 3) + 0.8;

    monthlyData.push({
      date: date.toISOString().split("T")[0],
      avgTime: Math.round(
        baseStats.avgReadingTime * (0.9 + factor * 0.05)
      ),
      storyViews: Math.round(
        baseStats.totalViews / 6 * (0.9 + factor * 0.05)
      ),
      scrollDepth: Math.min(
        100,
        Math.round(
          baseStats.averageScrollDepth * (0.97 + factor * 0.03)
        )
      ),
    });
  }

  return {
    overallStats: baseStats,
    dailyData,
    weeklyData,
    monthlyData,
    topStories,
  };
}

router.post("/api/analytics/vitals", async (req: Request, env: Env) => {
  try {
    const body = (await (req as any).json?.()) || {};

    // Check rate limit: 100 requests per 60s per IP
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const allowed = await checkRateLimit(env, `analytics-${ip}`, 100, 60);
    if (!allowed) {
      return json({ error: "Rate limited" }, { status: 429 });
    }

    const eventId = crypto.randomUUID();
    await env.ANALYTICS_KV.put(`vitals-${eventId}`, JSON.stringify(body), {
      expirationTtl: 86400,
    });

    return json({ success: true, eventId });
  } catch (error) {
    return json({ error: String(error) }, { status: 400 });
  }
});

router.post("/api/analytics/pageview", async (req: Request, env: Env) => {
  try {
    const body = (await (req as any).json?.()) || {};
    const eventId = crypto.randomUUID();
    await env.ANALYTICS_KV.put(`pageview-${eventId}`, JSON.stringify(body), {
      expirationTtl: 86400,
    });
    return json({ success: true, eventId });
  } catch (error) {
    return json({ error: String(error) }, { status: 400 });
  }
});

router.post("/api/analytics/interaction", async (req: Request, env: Env) => {
  try {
    const body = (await (req as any).json?.()) || {};
    const eventId = crypto.randomUUID();
    await env.ANALYTICS_KV.put(`interaction-${eventId}`, JSON.stringify(body), {
      expirationTtl: 86400,
    });
    return json({ success: true, eventId });
  } catch (error) {
    return json({ error: String(error) }, { status: 400 });
  }
});

router.post("/api/analytics/performance", async (req: Request, env: Env) => {
  try {
    const body = (await (req as any).json?.()) || {};
    const eventId = crypto.randomUUID();
    await env.ANALYTICS_KV.put(
      `performance-${eventId}`,
      JSON.stringify(body),
      {
        expirationTtl: 86400,
      }
    );
    return json({ success: true, eventId });
  } catch (error) {
    return json({ error: String(error) }, { status: 400 });
  }
});

// Site summary used by potential consumers
router.get("/api/analytics/site", async (_req: Request, env: Env) => {
  try {
    const cached = await env.CACHE_KV.get("analytics-site-summary");
    if (cached) {
      return json(JSON.parse(cached), {
        headers: {
          "Cache-Control": "max-age=300, stale-while-revalidate=600",
        },
      });
    }

    const summary = await getAnalyticsSummaryFromSupabase(env);
    const payload = {
      totalViews: summary.totalViews,
      uniqueVisitors: summary.uniqueVisitors,
      avgReadTime: summary.avgReadTime,
      bounceRate: summary.bounceRate,
    };

    // Best-effort cache
    await env.CACHE_KV.put(
      "analytics-site-summary",
      JSON.stringify(payload),
      { expirationTtl: 300 }
    ).catch(() => {});

    return json(payload, {
      headers: {
        "Cache-Control": "max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
});

// Reading time analytics (used by home page and dashboard)
router.get(
  "/api/analytics/reading-time",
  async (_req: Request, env: Env) => {
    try {
      const data = await buildReadingTimeAnalytics(env);
      return json(data);
    } catch (error) {
      return json(
        { message: "Failed to fetch reading time analytics" },
        { status: 500 }
      );
    }
  }
);

// Test endpoint used by admin dashboard charts
router.get(
  "/api/analytics/reading-time-test",
  async (_req: Request, env: Env) => {
    try {
      const data = await buildReadingTimeAnalytics(env);
      return json(data);
    } catch (error) {
      return json(
        { message: "Failed to fetch reading time analytics" },
        { status: 500 }
      );
    }
  }
);

// Device distribution (fractional) used by generic consumers
router.get("/api/analytics/devices", async (_req: Request, env: Env) => {
  try {
    const distribution = await getDeviceDistributionFromSupabase(env);
    return json(distribution);
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
});

// Device analytics test endpoint (time series) used by dashboard
router.get("/api/analytics/devices-test", async (_req: Request, env: Env) => {
  try {
    const analytics = await getAnalyticsSummaryFromSupabase(env);

    // Default distribution (approximate 2024 web averages)
    const distribution = {
      desktop: 0.53,
      mobile: 0.42,
      tablet: 0.05,
    };

    const totalSessions =
      Number.isFinite(analytics.totalViews) && analytics.totalViews > 0
        ? analytics.totalViews
        : 1281;

    const baseTotals = {
      desktop: Math.round(totalSessions * distribution.desktop),
      mobile: Math.round(totalSessions * distribution.mobile),
      tablet: Math.round(totalSessions * distribution.tablet),
    };

    const now = new Date();
    const dailyData: any[] = [];
    const weeklyData: any[] = [];
    const monthlyData: any[] = [];

    // Daily data (last 30 days)
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const dailyTotal = Math.round(
        totalSessions / 30 * (0.7 + Math.random() * 0.6)
      );

      const dayFactor = isWeekend
        ? { desktop: 0.45, mobile: 0.48, tablet: 0.07 }
        : { desktop: 0.58, mobile: 0.38, tablet: 0.04 };

      dailyData.push({
        date: date.toISOString().split("T")[0],
        desktop: Math.round(dailyTotal * dayFactor.desktop),
        mobile: Math.round(dailyTotal * dayFactor.mobile),
        tablet: Math.round(dailyTotal * dayFactor.tablet),
      });
    }

    // Weekly data (last 12 weeks)
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i * 7);

      const mobileTrend = 0.38 + 0.008 * (12 - i);
      const desktopTrend = 0.57 - 0.007 * (12 - i);
      const tabletTrend = 0.05 - 0.001 * (12 - i);

      const weeklyTotal = Math.round(
        totalSessions / 12 * (0.8 + Math.random() * 0.4)
      );

      weeklyData.push({
        date: date.toISOString().split("T")[0],
        desktop: Math.round(weeklyTotal * desktopTrend),
        mobile: Math.round(weeklyTotal * mobileTrend),
        tablet: Math.round(weeklyTotal * tabletTrend),
      });
    }

    // Monthly data (last 6 months)
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);

      const month = date.getMonth();
      const isSummer = month >= 5 && month <= 7;

      const monthFactor = isSummer
        ? { desktop: 0.48, mobile: 0.47, tablet: 0.05 }
        : { desktop: 0.55, mobile: 0.40, tablet: 0.05 };

      const monthlyTotal = Math.round(
        totalSessions / 6 * (0.85 + Math.random() * 0.3)
      );

      monthlyData.push({
        date: date.toISOString().split("T")[0],
        desktop: Math.round(monthlyTotal * monthFactor.desktop),
        mobile: Math.round(monthlyTotal * monthFactor.mobile),
        tablet: Math.round(monthlyTotal * monthFactor.tablet),
      });
    }

    const percentageChange = {
      desktop: 3.2,
      mobile: 5.8,
      tablet: -1.5,
    };

    return json({
      dailyData,
      weeklyData,
      monthlyData,
      totals: baseTotals,
      percentageChange,
    });
  } catch (error) {
    return json(
      { message: "Failed to fetch device analytics" },
      { status: 500 }
    );
  }
});

// Engagement metrics test endpoint used by dashboard
router.get(
  "/api/analytics/engagement-test",
  async (_req: Request, env: Env) => {
    try {
      const analyticsSummary = await getAnalyticsSummaryFromSupabase(env);
      const avgReadTime =
        Number.isFinite(analyticsSummary.avgReadTime) &&
        analyticsSummary.avgReadTime > 0
          ? analyticsSummary.avgReadTime
          : 180;
      const totalViewsBase =
        Number.isFinite(analyticsSummary.totalViews) &&
        analyticsSummary.totalViews > 0
          ? analyticsSummary.totalViews
          : 1000;

      const engagementMetrics = {
        totalReadingTime: Math.round(
          avgReadTime * totalViewsBase * 0.7
        ),
        averageSessionDuration: avgReadTime,
        totalUsers: Math.round(totalViewsBase * 0.6),
        activeUsers: Math.round(totalViewsBase * 0.3),
        interactions: Math.round(totalViewsBase * 2.5),
        pageViews: totalViewsBase,
        returning: Math.round(totalViewsBase * 0.4),
      };

      return json(engagementMetrics);
    } catch (error) {
      return json(
        { message: "Failed to create engagement metrics" },
        { status: 500 }
      );
    }
  }
);

// Engagement metrics endpoint used by home page (approximate)
router.get("/api/analytics/engagement", async (_req: Request, env: Env) => {
  try {
    const analyticsSummary = await getAnalyticsSummaryFromSupabase(env);
    const avgReadTime =
      Number.isFinite(analyticsSummary.avgReadTime) &&
      analyticsSummary.avgReadTime > 0
        ? analyticsSummary.avgReadTime
        : 180;
    const totalViewsBase =
      Number.isFinite(analyticsSummary.totalViews) &&
      analyticsSummary.totalViews > 0
        ? analyticsSummary.totalViews
        : 1000;

    const engagementMetrics = {
      totalReadingTime: Math.round(avgReadTime * totalViewsBase * 0.7),
      averageSessionDuration: avgReadTime,
      totalUsers: Math.round(totalViewsBase * 0.6),
      activeUsers: Math.round(totalViewsBase * 0.3),
      interactions: Math.round(totalViewsBase * 2.5),
      pageViews: totalViewsBase,
      returning: Math.round(totalViewsBase * 0.4),
    };

    return json(engagementMetrics);
  } catch (error) {
    return json(
      { message: "Failed to fetch engagement metrics" },
      { status: 500 }
    );
  }
});

// Site analytics test endpoint for dashboard
router.get("/api/analytics/site-test", async (_req: Request, env: Env) => {
  try {
    const analyticsSummary = await getAnalyticsSummaryFromSupabase(env);
    const totalViewsBase =
      Number.isFinite(analyticsSummary.totalViews) &&
      analyticsSummary.totalViews > 0
        ? analyticsSummary.totalViews
        : 1281;

    const siteAnalytics = {
      totalViews: totalViewsBase,
      uniqueVisitors: Math.round(totalViewsBase * 0.49),
      avgReadTime:
        Number.isFinite(analyticsSummary.avgReadTime) &&
        analyticsSummary.avgReadTime > 0
          ? analyticsSummary.avgReadTime
          : 171,
      bounceRate: 38.5,
    };

    return json(siteAnalytics);
  } catch (error) {
    return json(
      { message: "Failed to create site analytics" },
      { status: 500 }
    );
  }
});

// Device distribution test endpoint for dashboard
router.get(
  "/api/analytics/device-distribution-test",
  async (_req: Request, env: Env) => {
    try {
      await getAnalyticsSummaryFromSupabase(env); // best-effort, ignored if fails
      const deviceDistribution = {
        desktop: 53,
        mobile: 42,
        tablet: 5,
      };
      return json(deviceDistribution);
    } catch (error) {
      return json(
        { message: "Failed to create device distribution" },
        { status: 500 }
      );
    }
  }
);

// BOOKMARKS: Worker-native (Supabase-backed) with legacy proxy fallback for non-JWT clients

// GET /api/bookmarks - list all bookmarks for current user with post details
router.get("/api/bookmarks", async (req: Request, env: Env) => {
  const token = getBearerToken(req);
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const userHeaders: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    const bookmarksUrl = `${baseUrl}/rest/v1/bookmarks?select=id,user_id,post_id,created_at,notes,tags,last_position&order=created_at.desc&limit=500`;
    const res = await fetch(bookmarksUrl, { headers: userHeaders });

    if (res.status === 401 || res.status === 403) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    if (!res.ok) {
      return json({ error: "Failed to fetch bookmarks" }, { status: 500 });
    }

    const raw = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(raw) || raw.length === 0) {
      return json([]);
    }

    const postIds = Array.from(
      new Set(
        raw
          .map((b: any) => Number(b.post_id))
          .filter((n: number) => Number.isFinite(n))
      )
    );
    const postsMap = new Map<number, any>();

    if (postIds.length > 0) {
      const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
      postsUrl.searchParams.set("select", "id,title,slug,excerpt,created_at");
      postsUrl.searchParams.set("id", `in.(${postIds.join(",")})`);

      const postsRes = await fetch(postsUrl.toString(), {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
      });

      if (postsRes.ok) {
        const postsRows = (await postsRes.json().catch(() => [])) as any[];
        if (Array.isArray(postsRows)) {
          for (const p of postsRows) {
            const id = Number(p.id);
            if (Number.isFinite(id)) {
              postsMap.set(id, {
                id,
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                createdAt: p.created_at,
              });
            }
          }
        }
      }
    }

    const enriched = raw
      .map((b: any) => {
        const postId = Number(b.post_id);
        const post = postsMap.get(postId);
        if (!post) return null;
        return {
          id: b.id,
          userId: typeof b.user_id === "number" ? b.user_id : undefined,
          postId,
          createdAt: b.created_at,
          notes: b.notes ?? null,
          tags: Array.isArray(b.tags) ? b.tags : null,
          lastPosition:
            typeof b.last_position === "string" && b.last_position
              ? b.last_position
              : "0",
          post,
        };
      })
      .filter((b) => b !== null);

    return json(enriched);
  } catch {
    return json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
});

// GET /api/bookmarks/tag/:tag - list bookmarks filtered by tag for current user
router.get(
  "/api/bookmarks/tag/:tag",
  async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const tag = decodeURIComponent(segments[segments.length - 1] || "")
        .trim();
      if (!tag) {
        return json(
          { success: false, message: "Tag is required" },
          { status: 400 }
        );
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const userHeaders: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const bookmarksUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
      bookmarksUrl.searchParams.set(
        "select",
        "id,user_id,post_id,created_at,notes,tags,last_position"
      );
      bookmarksUrl.searchParams.set("tags", `cs.{${tag}}`);
      bookmarksUrl.searchParams.set("order", "created_at.desc");
      bookmarksUrl.searchParams.set("limit", "500");

      const res = await fetch(bookmarksUrl.toString(), {
        headers: userHeaders,
      });

      if (res.status === 401 || res.status === 403) {
        return json({ error: "Authentication required" }, { status: 401 });
      }
      if (!res.ok) {
        return json(
          { success: false, message: "Failed to fetch bookmarks by tag" },
          { status: 500 }
        );
      }

      const raw = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(raw) || raw.length === 0) {
        return json([]);
      }

      const postIds = Array.from(
        new Set(
          raw
            .map((b: any) => Number(b.post_id))
            .filter((n: number) => Number.isFinite(n))
        )
      );
      const postsMap = new Map<number, any>();

      if (postIds.length > 0) {
        const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
        postsUrl.searchParams.set("select", "id,title,slug,excerpt,created_at");
        postsUrl.searchParams.set("id", `in.(${postIds.join(",")})`);

        const postsRes = await fetch(postsUrl.toString(), {
          headers: {
            apikey: env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
            Accept: "application/json",
          },
        });

        if (postsRes.ok) {
          const postsRows = (await postsRes.json().catch(() => [])) as any[];
          if (Array.isArray(postsRows)) {
            for (const p of postsRows) {
              const id = Number(p.id);
              if (Number.isFinite(id)) {
                postsMap.set(id, {
                  id,
                  title: p.title,
                  slug: p.slug,
                  excerpt: p.excerpt,
                  createdAt: p.created_at,
                });
              }
            }
          }
        }
      }

      const enriched = raw
        .map((b: any) => {
          const postId = Number(b.post_id);
          const post = postsMap.get(postId);
          if (!post) return null;
          return {
            id: b.id,
            userId: typeof b.user_id === "number" ? b.user_id : undefined,
            postId,
            createdAt: b.created_at,
            notes: b.notes ?? null,
            tags: Array.isArray(b.tags) ? b.tags : null,
            lastPosition:
              typeof b.last_position === "string" && b.last_position
                ? b.last_position
                : "0",
            post,
          };
        })
        .filter((b) => b !== null);

      return json(enriched);
    } catch {
      return json(
        { success: false, message: "Failed to fetch bookmarks by tag" },
        { status: 500 }
      );
    }
  }
);

// GET /api/bookmarks/:postId - check bookmark status for current user
router.get(
  "/api/bookmarks/:postId",
  async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const rawIdStr = segments[segments.length - 1] || "";
      const rawPostId = parseInt(decodeURIComponent(rawIdStr), 10);
      if (!Number.isFinite(rawPostId)) {
        return json(
          { success: false, message: "Invalid post ID" },
          { status: 400 }
        );
      }

      const postId = await resolveLocalPostIdFromExternal(env, rawPostId);
      if (!Number.isFinite(postId || NaN)) {
        return json(
          { success: false, message: "Post not found" },
          { status: 404 }
        );
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const userHeaders: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const url = new URL(`${baseUrl}/rest/v1/bookmarks`);
      url.searchParams.set(
        "select",
        "id,user_id,post_id,created_at,notes,tags,last_position"
      );
      url.searchParams.set("post_id", `eq.${postId}`);
      url.searchParams.set("limit", "1");

      const res = await fetch(url.toString(), {
        headers: userHeaders,
      });

      if (res.status === 401 || res.status === 403) {
        return json({ success: false, message: "Authentication required" }, { status: 401 });
      }
      if (!res.ok) {
        return json(
          { success: false, message: "Failed to check bookmark status" },
          { status: 500 }
        );
      }

      const rows = (await res.json().catch(() => [])) as any[];
      const bookmarked = Array.isArray(rows) && rows.length > 0;
      const row = bookmarked ? rows[0] : null;

      if (!bookmarked || !row) {
        return json({
          success: true,
          bookmarked: false,
          bookmark: null,
        });
      }

      const bookmark = {
        id: row.id,
        userId: typeof row.user_id === "number" ? row.user_id : undefined,
        postId: Number(row.post_id),
        createdAt: row.created_at,
        notes: row.notes ?? null,
        tags: Array.isArray(row.tags) ? row.tags : null,
        lastPosition:
          typeof row.last_position === "string" && row.last_position
            ? row.last_position
            : "0",
      };

      return json({
        success: true,
        bookmarked: true,
        bookmark,
      });
    } catch {
      return json(
        { success: false, message: "Failed to check bookmark status" },
        { status: 500 }
      );
    }
  }
);

// POST /api/bookmarks/:postId - create or update bookmark with optional notes/tags
router.post(
  "/api/bookmarks/:postId",
  async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const rawIdStr = segments[segments.length - 1] || "";
      const rawPostId = parseInt(decodeURIComponent(rawIdStr), 10);
      if (!Number.isFinite(rawPostId)) {
        return json(
          { success: false, message: "Invalid post ID" },
          { status: 400 }
        );
      }

      const body = (await (req as any).json?.()) || {};
      const notes =
        typeof body.notes === "string" ? body.notes : undefined;
      const tags =
        Array.isArray(body.tags) && body.tags.length
          ? (body.tags as string[])
          : undefined;

      const postId = await resolveLocalPostIdFromExternal(env, rawPostId);
      if (!Number.isFinite(postId || NaN)) {
        return json(
          { success: false, message: "Post not found" },
          { status: 404 }
        );
      }

      const userId = await getSupabaseUserIdFromJwt(env, token);
      if (!Number.isFinite(userId || NaN)) {
        return json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        );
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      // Check for existing bookmark
      const checkUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
      checkUrl.searchParams.set(
        "select",
        "id,user_id,post_id,created_at,notes,tags,last_position"
      );
      checkUrl.searchParams.set("user_id", `eq.${userId}`);
      checkUrl.searchParams.set("post_id", `eq.${postId}`);
      checkUrl.searchParams.set("limit", "1");

      const checkRes = await fetch(checkUrl.toString(), {
        headers,
      });

      if (checkRes.status === 401 || checkRes.status === 403) {
        return json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        );
      }
      if (!checkRes.ok) {
        return json(
          { success: false, message: "Failed to bookmark post" },
          { status: 500 }
        );
      }

      const existingRows = (await checkRes.json().catch(() => [])) as any[];
      const existing = Array.isArray(existingRows) && existingRows.length > 0
        ? existingRows[0]
        : null;

      if (existing) {
        if (notes !== undefined || tags !== undefined) {
          const updateUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
          updateUrl.searchParams.set("user_id", `eq.${userId}`);
          updateUrl.searchParams.set("post_id", `eq.${postId}`);

          const updateBody: Record<string, any> = {};
          if (notes !== undefined) updateBody.notes = notes;
          if (tags !== undefined) updateBody.tags = tags;

          const updRes = await fetch(updateUrl.toString(), {
            method: "PATCH",
            headers: {
              ...headers,
              Prefer: "return=representation",
            },
            body: JSON.stringify(updateBody),
          });

          if (!updRes.ok) {
            return json(
              {
                success: false,
                message: "Failed to update bookmark details",
              },
              { status: 500 }
            );
          }

          const updRows = (await updRes.json().catch(() => [])) as any[];
          const updated = Array.isArray(updRows) && updRows.length > 0
            ? updRows[0]
            : existing;

          return json({
            success: true,
            message: "Post already bookmarked; details updated",
            bookmark: updated,
          });
        }

        return json({
          success: true,
          message: "Post already bookmarked",
          bookmark: existing,
        });
      }

      // Insert new bookmark
      const insertRes = await fetch(
        `${baseUrl}/rest/v1/bookmarks`,
        {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            user_id: userId,
            post_id: postId,
            notes: notes ?? null,
            tags: tags ?? null,
            last_position: "0",
          }),
        }
      );

      if (insertRes.status === 401 || insertRes.status === 403) {
        return json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        );
      }
      if (!insertRes.ok) {
        return json(
          { success: false, message: "Failed to bookmark post" },
          { status: 500 }
        );
      }

      const insRows = (await insertRes.json().catch(() => [])) as any[];
      const inserted =
        Array.isArray(insRows) && insRows.length > 0 ? insRows[0] : null;

      return json(
        {
          success: true,
          message: "Post bookmarked successfully",
          bookmark: inserted,
        },
        { status: 201 }
      );
    } catch {
      return json(
        { success: false, message: "Failed to bookmark post" },
        { status: 500 }
      );
    }
  }
);

// PATCH /api/bookmarks/:postId - update notes/tags/lastPosition for a bookmark
router.patch(
  "/api/bookmarks/:postId",
  async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const rawIdStr = segments[segments.length - 1] || "";
      const rawPostId = parseInt(decodeURIComponent(rawIdStr), 10);
      if (!Number.isFinite(rawPostId)) {
        return json(
          { success: false, message: "Invalid post ID" },
          { status: 400 }
        );
      }

      const body = (await (req as any).json?.()) || {};
      const notes =
        typeof body.notes === "string" ? body.notes : undefined;
      const tags =
        Array.isArray(body.tags) && body.tags.length
          ? (body.tags as string[])
          : undefined;
      const lastPosition =
        typeof body.lastPosition === "string" ? body.lastPosition : undefined;

      const postId = await resolveLocalPostIdFromExternal(env, rawPostId);
      if (!Number.isFinite(postId || NaN)) {
        return json(
          { success: false, message: "Post not found" },
          { status: 404 }
        );
      }

      const userId = await getSupabaseUserIdFromJwt(env, token);
      if (!Number.isFinite(userId || NaN)) {
        return json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        );
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const updateBody: Record<string, any> = {};
      if (notes !== undefined) updateBody.notes = notes;
      if (tags !== undefined) updateBody.tags = tags;
      if (lastPosition !== undefined) updateBody.last_position = lastPosition;

      if (Object.keys(updateBody).length === 0) {
        return json(
          { success: false, message: "No updates provided" },
          { status: 400 }
        );
      }

      const updateUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
      updateUrl.searchParams.set("user_id", `eq.${userId}`);
      updateUrl.searchParams.set("post_id", `eq.${postId}`);

      const updRes = await fetch(updateUrl.toString(), {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify(updateBody),
      });

      if (updRes.status === 401 || updRes.status === 403) {
        return json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        );
      }
      if (!updRes.ok) {
        return json(
          { success: false, message: "Failed to update bookmark" },
          { status: 500 }
        );
      }

      const rows = (await updRes.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json(
          { success: false, message: "Bookmark not found" },
          { status: 404 }
        );
      }

      return json({
        success: true,
        bookmark: rows[0],
      });
    } catch {
      return json(
        { success: false, message: "Failed to update bookmark" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/bookmarks/:postId - remove a bookmark
router.delete(
  "/api/bookmarks/:postId",
  async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const rawIdStr = segments[segments.length - 1] || "";
      const rawPostId = parseInt(decodeURIComponent(rawIdStr), 10);
      if (!Number.isFinite(rawPostId)) {
        return json(
          { success: false, message: "Invalid post ID" },
          { status: 400 }
        );
      }

      const postId = await resolveLocalPostIdFromExternal(env, rawPostId);
      if (!Number.isFinite(postId || NaN)) {
        return json(
          { success: false, message: "Post not found" },
          { status: 404 }
        );
      }

      const userId = await getSupabaseUserIdFromJwt(env, token);
      if (!Number.isFinite(userId || NaN)) {
        return json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        );
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const deleteUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
      deleteUrl.searchParams.set("user_id", `eq.${userId}`);
      deleteUrl.searchParams.set("post_id", `eq.${postId}`);

      const delRes = await fetch(deleteUrl.toString(), {
        method: "DELETE",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
      });

      if (delRes.status === 401 || delRes.status === 403) {
        return json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        );
      }
      if (!delRes.ok) {
        return json(
          { success: false, message: "Failed to remove bookmark" },
          { status: 500 }
        );
      }

      const rows = (await delRes.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json(
          { success: false, message: "Bookmark not found" },
          { status: 404 }
        );
      }

      return json({
        success: true,
        message: "Bookmark removed successfully",
        bookmark: rows[0],
      });
    } catch {
      return json(
        { success: false, message: "Failed to remove bookmark" },
        { status: 500 }
      );
    }
  }
);

// GET /api/bookmarks/migrate - dry-run migratable count (JWT clients use localStorage; return 0)
// Legacy/session clients without JWT still proxy to backend.
router.get("/api/bookmarks/migrate", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }
  const token = getBearerToken(req);
  if (!token) {
    return proxyToBackend(req, env);
  }
  // For Supabase-JWT clients we no longer track anonymous bookmarks on the server.
  // Migration uses client-provided local payload only, so report zero migratable here.
  return json({ success: true, migratable: 0 });
});

// POST /api/bookmarks/migrate - import anonymous/local bookmarks into authenticated account
router.post("/api/bookmarks/migrate", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }
  const token = getBearerToken(req);
  if (!token) {
    return proxyToBackend(req, env);
  }

  try {
    const body = (await (req as any).json?.()) || {};
    const localPayload =
      body &&
      typeof body.local === "object" &&
      body.local !== null
        ? (body.local as Record<string, any>)
        : null;

    const entries = localPayload ? Object.entries(localPayload) : [];
    if (!entries.length) {
      // Nothing to migrate; cleared flag reflects whether client passed local payload or not
      return json({ success: true, migrated: 0, cleared: !!localPayload });
    }

    const userId = await getSupabaseUserIdFromJwt(env, token);
    if (!Number.isFinite(userId || NaN)) {
      return json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    let migrated = 0;

    for (const [rawId, b] of entries as [string, any][]) {
      const wpOrLocalId = Number(rawId);
      if (!Number.isFinite(wpOrLocalId)) continue;

      const postId = await resolveLocalPostIdFromExternal(env, wpOrLocalId);
      if (!Number.isFinite(postId || NaN)) continue;

      // Check if bookmark already exists for this user/post
      try {
        const checkUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
        checkUrl.searchParams.set("select", "id");
        checkUrl.searchParams.set("user_id", `eq.${userId}`);
        checkUrl.searchParams.set("post_id", `eq.${postId}`);
        checkUrl.searchParams.set("limit", "1");

        const checkRes = await fetch(checkUrl.toString(), {
          headers,
        });

        if (!checkRes.ok) {
          // Skip this entry on error; continue with others
          continue;
        }

        const existing = (await checkRes.json().catch(() => [])) as any[];
        if (Array.isArray(existing) && existing.length > 0) {
          // Already bookmarked
          continue;
        }

        const insertBody: Record<string, any> = {
          user_id: userId,
          post_id: postId,
          notes: b?.notes ?? null,
          tags: Array.isArray(b?.tags) ? b.tags : null,
          last_position:
            typeof b?.lastPosition === "string" && b.lastPosition
              ? b.lastPosition
              : "0",
        };

        const insRes = await fetch(`${baseUrl}/rest/v1/bookmarks`, {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "return=representation",
          },
          body: JSON.stringify(insertBody),
        });

        if (insRes.ok) {
          migrated += 1;
        }
      } catch {
        // Ignore individual failures; continue migrating others
        continue;
      }
    }

    return json({ success: true, migrated, cleared: true });
  } catch {
    return json(
      { success: false, message: "Failed to migrate bookmarks" },
      { status: 500 }
    );
  }
});

// NEWSLETTER SUBSCRIBE / UNSUBSCRIBE (Worker-native, Supabase-backed)
async function handleNewsletterSubscribe(req: Request, env: Env): Promise<Response> {
  let email: string | null = null;
  let metadata: Record<string, any> | undefined;

  try {
    const body = (await (req as any).json?.()) || {};
    email = typeof body.email === "string" ? body.email.trim() : "";
    metadata = (body && typeof body.metadata === "object" && body.metadata !== null)
      ? (body.metadata as Record<string, any>)
      : undefined;
  } catch {
    return json(
      { success: false, message: "Invalid subscription data" },
      { status: 400 },
    );
  }

  if (!email) {
    return json(
      { success: false, message: "Please enter a valid email address" },
      { status: 400 },
    );
  }

  const simpleEmailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!simpleEmailRegex.test(email)) {
    return json(
      { success: false, message: "Please enter a valid email address" },
      { status: 400 },
    );
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json(
      { success: false, message: "Newsletter service not configured" },
      { status: 500 },
    );
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
  const headers: Record<string, string> = {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  let existing: any | null = null;
  try {
    const url = new URL(`${baseUrl}/rest/v1/newsletter_subscriptions`);
    url.searchParams.set("select", "id,email,status,metadata,created_at,updated_at");
    url.searchParams.set("email", `eq.${email}`);
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });
    if (!res.ok && res.status !== 406) {
      return json(
        { success: false, message: "An error occurred while subscribing to the newsletter" },
        { status: 500 },
      );
    }
    const rows = (await res.json().catch(() => [])) as any[];
    if (Array.isArray(rows) && rows.length > 0) {
      existing = rows[0];
    }
  } catch {
    // Treat as no existing subscription; we'll still attempt to insert
  }

  let subscription = existing;
  let alreadySubscribed = false;

  try {
    if (existing && existing.status === "active") {
      alreadySubscribed = true;
    } else if (existing) {
      // Reactivate existing subscription
      const patchUrl = new URL(`${baseUrl}/rest/v1/newsletter_subscriptions`);
      patchUrl.searchParams.set("email", `eq.${email}`);

      const res = await fetch(patchUrl.toString(), {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status: "active",
          updated_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        return json(
          { success: false, message: "An error occurred while subscribing to the newsletter" },
          { status: 500 },
        );
      }
      const rows = (await res.json().catch(() => [])) as any[];
      subscription = Array.isArray(rows) && rows.length > 0 ? rows[0] : existing;
    } else {
      // Create new subscription
      const res = await fetch(`${baseUrl}/rest/v1/newsletter_subscriptions`, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          email,
          status: "active",
          metadata: metadata || {},
        }),
      });

      if (!res.ok) {
        return json(
          { success: false, message: "An error occurred while subscribing to the newsletter" },
          { status: 500 },
        );
      }

      const rows = (await res.json().catch(() => [])) as any[];
      subscription = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    }
  } catch {
    return json(
      { success: false, message: "An error occurred while subscribing to the newsletter" },
      { status: 500 },
    );
  }

  // Send a welcome email best-effort; do not fail subscription if this fails
  let emailSent = false;
  let emailMessage =
    "Welcome email could not be sent at this time, but your subscription is active";

  if (!alreadySubscribed && env.EMAIL_PROVIDER_API_KEY && env.GMAIL_ADMIN_EMAIL) {
    try {
      const welcomeRes = await fetch(
        "https://api.sendgrid.com/v3/mail/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: env.GMAIL_ADMIN_EMAIL },
            subject: "Welcome to Bubble's Cafe Newsletter",
            content: [
              {
                type: "text/html",
                value:
                  "<p>Thank you for subscribing to Bubble's Cafe newsletter.</p><p>You'll hear from us soon.</p>",
              },
            ],
          }),
        },
      );

      if (welcomeRes.ok) {
        emailSent = true;
        emailMessage = "Welcome email sent successfully";
      }
    } catch {
      // ignore email failures
    }
  }

  if (alreadySubscribed) {
    return json({
      success: true,
      message: "You are already subscribed to the newsletter",
      data: subscription,
      alreadySubscribed: true,
    });
  }

  return json({
    success: true,
    message: "Successfully subscribed to the newsletter",
    data: subscription,
    email: {
      sent: emailSent,
      message: emailMessage,
    },
  });
}

async function handleNewsletterUnsubscribe(req: Request, env: Env): Promise<Response> {
  let email: string | null = null;

  try {
    const body = (await (req as any).json?.()) || {};
    email = typeof body.email === "string" ? body.email.trim() : "";
  } catch {
    return json(
      { success: false, message: "Invalid email address" },
      { status: 400 },
    );
  }

  if (!email) {
    return json(
      { success: false, message: "Invalid email address" },
      { status: 400 },
    );
  }

  const simpleEmailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!simpleEmailRegex.test(email)) {
    return json(
      { success: false, message: "Invalid email address" },
      { status: 400 },
    );
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json(
      { success: false, message: "An error occurred while unsubscribing from the newsletter" },
      { status: 500 },
    );
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
  const headers: Record<string, string> = {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    const patchUrl = new URL(`${baseUrl}/rest/v1/newsletter_subscriptions`);
    patchUrl.searchParams.set("email", `eq.${email}`);

    const res = await fetch(patchUrl.toString(), {
      method: "PATCH",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: "unsubscribed",
        updated_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      return json(
        { success: false, message: "An error occurred while unsubscribing from the newsletter" },
        { status: 500 },
      );
    }

    const rows = (await res.json().catch(() => [])) as any[];
    const subscription = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    return json({
      success: true,
      message: "Successfully unsubscribed from the newsletter",
      data: subscription,
    });
  } catch {
    return json(
      { success: false, message: "An error occurred while unsubscribing from the newsletter" },
      { status: 500 },
    );
  }
}

router.post(
  "/api/newsletter/subscribe",
  async (req: Request, env: Env) => handleNewsletterSubscribe(req, env),
);

router.post(
  "/api/newsletter-direct/subscribe",
  async (req: Request, env: Env) => handleNewsletterSubscribe(req, env),
);

router.post(
  "/api/newsletter/unsubscribe",
  async (req: Request, env: Env) => handleNewsletterUnsubscribe(req, env),
);

// EMAIL SERVICE
router.post("/api/email-service/send", async (req: Request, env: Env) => {
  try {
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const allowed = await checkRateLimit(env, `email-${ip}`, 10, 3600);
    if (!allowed) {
      return json({ error: "Rate limited" }, { status: 429 });
    }

    const body = (await (req as any).json?.()) || {};

    if (!body.to || !body.subject || !body.html) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: body.to }] }],
        from: { email: env.GMAIL_ADMIN_EMAIL },
        subject: body.subject,
        content: [{ type: "text/html", value: body.html }],
      }),
    });

    if (!emailRes.ok) {
      return json({ error: "Failed to send email" }, { status: 500 });
    }

    return json({ success: true, messageId: crypto.randomUUID() });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
});

// PAYMENTS: Paystack integration (initialize, verify, plans, subscription status, webhook)
router.post("/api/payments/webhook", async (req: Request, env: Env) => {
  // This webhook is designed for Paystack, but we keep idempotency protection
  try {
    const rawBody = await req.text();
    let parsed: any;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return json({ status: false, message: "Invalid JSON payload" }, { status: 400 });
    }

    const eventId = String(parsed?.event || parsed?.event_id || parsed?.reference || parsed?.id || "");
    if (!eventId) {
      return json({ status: false, message: "Missing event identifier" }, { status: 400 });
    }

    const { isNew } = await getOrCheckIdempotency(env, `paystack-webhook-${eventId}`, 86_400_000);
    if (!isNew) {
      return json({ status: true, message: "Duplicate webhook ignored" });
    }

    // For now we simply acknowledge Paystack webhooks and rely on the
    // client-side Paystack dashboard / our tips logging for business logic.
    // You can extend this to call a Supabase RPC for subscription management.
    return json({ status: true, message: "Webhook received" });
  } catch (error) {
    return json(
      {
        status: false,
        message: "Failed to process webhook",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

/**
 * Initialize a Paystack transaction
 * POST /api/payments/initialize
 * Body: { amount: number (lowest currency unit), callbackUrl?: string, reference?: string, metadata?: object }
 */
router.post("/api/payments/initialize", async (req: Request, env: Env) => {
  if (!env.PAYSTACK_SECRET_KEY) {
    return json(
      { status: false, message: "Paystack is not configured on the server" },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const amountRaw = body?.amount;
    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      return json(
        { status: false, message: "Amount must be a positive number in lowest currency unit" },
        { status: 400 },
      );
    }

    const callbackUrl =
      typeof body?.callbackUrl === "string" && body.callbackUrl.length > 0
        ? body.callbackUrl
        : undefined;
    const reference =
      typeof body?.reference === "string" && body.reference.length > 0
        ? body.reference
        : `bcf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const metadataInput =
      body && typeof body.metadata === "object" && body.metadata !== null ? body.metadata : {};

    // Resolve user from Supabase JWT when available to attach email & user metadata
    let customerEmail: string | undefined;
    let userId: number | null = null;
    let username: string | undefined;

    const token = getBearerToken(req);
    if (token && env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      try {
        const authUser = await getSupabaseAuthUser(env, token);
        if (authUser?.email) {
          customerEmail = authUser.email;
        }
        const user = await getSupabaseCurrentUser(env, token).catch(() => null);
        if (user?.id) {
          userId = user.id;
        }
        if (user?.username) {
          username = user.username;
        }
      } catch {
        // Non-fatal: continue without user enrichment
      }
    }

    // As a fallback, allow email to be provided explicitly in the payload
    if (!customerEmail && typeof body?.email === "string" && body.email.length > 3) {
      customerEmail = body.email;
    }

    if (!customerEmail) {
      return json(
        { status: false, message: "User email is required to initialize a payment" },
        { status: 400 },
      );
    }

    const enhancedMetadata = {
      ...(metadataInput || {}),
      userId: userId ?? undefined,
      username: username ?? undefined,
    };

    const baseUrl = env.PAYSTACK_BASE_URL || "https://api.paystack.co";
    const url = `${baseUrl.replace(/\/+$/, "")}/transaction/initialize`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount,
        email: customerEmail,
        reference,
        callback_url: callbackUrl,
        metadata: enhancedMetadata,
      }),
    });

    const data = (await resp.json().catch(() => ({}))) as any;

    if (!resp.ok) {
      return json(
        {
          status: false,
          message: data?.message || "Failed to initialize Paystack transaction",
        },
        { status: resp.status },
      );
    }

    return json(data);
  } catch (error) {
    return json(
      {
        status: false,
        message: "Failed to initialize payment",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

/**
 * Verify a Paystack transaction
 * GET /api/payments/verify/:reference
 */
router.get("/api/payments/verify/:reference", async (req: Request, env: Env) => {
  if (!env.PAYSTACK_SECRET_KEY) {
    return json(
      { status: false, message: "Paystack is not configured on the server" },
      { status: 500 },
    );
  }

  try {
    const urlObj = new URL(req.url);
    const segments = urlObj.pathname.split("/").filter(Boolean);
    const reference = segments[segments.length - 1] || "";
    if (!reference) {
      return json(
        { status: false, message: "Reference is required" },
        { status: 400 },
      );
    }

    const baseUrl = env.PAYSTACK_BASE_URL || "https://api.paystack.co";
    const verifyUrl = `${baseUrl.replace(/\/+$/, "")}/transaction/verify/${encodeURIComponent(
      reference,
    )}`;

    const resp = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        Accept: "application/json",
      },
    });

    const data = (await resp.json().catch(() => ({}))) as any;
    if (!resp.ok) {
      return json(
        {
          status: false,
          message: data?.message || "Failed to verify Paystack transaction",
        },
        { status: resp.status },
      );
    }

    return json(data);
  } catch (error) {
    return json(
      {
        status: false,
        message: "Failed to verify payment",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

/**
 * Get static payment plans, with a lightweight Paystack reachability check
 * GET /api/payments/plans
 */
router.get("/api/payments/plans", async (_req: Request, env: Env) => {
  const plans = [
    {
      id: "monthly_standard",
      name: "Monthly Standard",
      amount: 1000,
      interval: "monthly",
      description: "Standard monthly subscription with premium content access.",
    },
    {
      id: "yearly_premium",
      name: "Yearly Premium",
      amount: 10000,
      interval: "annually",
      description: "Premium yearly subscription with all features and exclusive content.",
    },
  ];

  if (!env.PAYSTACK_SECRET_KEY) {
    return json({ status: true, data: plans, meta: { paystackReachable: false } });
  }

  try {
    const baseUrl = env.PAYSTACK_BASE_URL || "https://api.paystack.co";
    const url = `${baseUrl.replace(/\/+$/, "")}/transaction?perPage=1&page=1`;

    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        Accept: "application/json",
      },
    });

    return json({
      status: true,
      data: plans,
      meta: { paystackReachable: resp.ok },
    });
  } catch {
    return json({
      status: true,
      data: plans,
      meta: { paystackReachable: false },
    });
  }
});

/**
 * Get user subscription status based on recent successful Paystack transactions
 * GET /api/payments/subscription/status
 */
router.get("/api/payments/subscription/status", async (req: Request, env: Env) => {
  if (!env.PAYSTACK_SECRET_KEY) {
    return json(
      { status: false, message: "Paystack is not configured on the server" },
      { status: 500 },
    );
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    // In non-Supabase environments, fall back to the legacy backend
    return proxyToBackend(req, env);
  }

  const token = getBearerToken(req);
  if (!token) {
    return json(
      { status: false, message: "User not authenticated" },
      { status: 401 },
    );
  }

  try {
    const authUser = await getSupabaseAuthUser(env, token);
    const email = authUser?.email;
    if (!email) {
      return json(
        { status: false, message: "User email is required" },
        { status: 400 },
      );
    }

    const baseUrl = env.PAYSTACK_BASE_URL || "https://api.paystack.co";
    const url = new URL(`${baseUrl.replace(/\/+$/, "")}/transaction`);
    url.searchParams.set("perPage", "10");
    url.searchParams.set("page", "1");
    url.searchParams.set("customer", email);
    url.searchParams.set("status", "success");

    const resp = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        Accept: "application/json",
      },
    });

    if (!resp.ok) {
      return json(
        { status: false, message: "Failed to fetch subscription status from Paystack" },
        { status: resp.status },
      );
    }

    const payload = (await resp.json().catch(() => ({}))) as any;
    const txList: any[] = Array.isArray(payload?.data) ? payload.data : [];
    const recent = txList.find(
      (t: any) =>
        t &&
        (t.customer?.email === email || t.customer_email === email) &&
        t.status === "success",
    );

    let hasActiveSubscription = false;
    let nextBillingDate: string | null = null;
    let subscription: any = null;

    if (recent) {
      hasActiveSubscription = true;
      const paidAtRaw = recent.paid_at || recent.paidAt || recent.created_at || recent.createdAt;
      const paidAtDate = paidAtRaw ? new Date(paidAtRaw) : new Date();
      const paidAtIso = paidAtDate.toISOString();
      const nextDate = new Date(paidAtDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      nextBillingDate = nextDate;
      subscription = {
        reference: recent.reference,
        amount: recent.amount,
        channel: recent.channel,
        paidAt: paidAtIso,
      };
    }

    return json({
      status: true,
      data: { hasActiveSubscription, subscription, nextBillingDate },
    });
  } catch (error) {
    return json(
      {
        status: false,
        message: "Failed to fetch subscription status",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

// WORDPRESS SYNC
router.get("/api/wordpress/status", async (_req: Request, env: Env) => {
  try {
    const lastSync = await env.SYNC_METADATA_KV.get("last_sync_timestamp");
    const lastStatus = await env.SYNC_METADATA_KV.get("last_sync_status");

    return json({
      lastSync: lastSync ? new Date(lastSync) : null,
      status: lastStatus || "idle",
      schedulerEnabled: env.ENABLE_WORDPRESS_SCHEDULER === "true",
    });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
});

router.post("/api/wordpress/sync/manual", async (req: Request, env: Env) => {
  const startedAt = new Date();
  let postsProcessed = 0;
  let errorMessage: string | null = null;

  try {
    const key = req.headers.get("X-Sync-Key");
    const isScheduler = req.headers.get("X-Scheduler") === "true";
    if (!isScheduler && env.WORDPRESS_SYNC_KEY && key !== env.WORDPRESS_SYNC_KEY) {
      return json({ error: "Unauthorized" }, { status: 403 });
    }

    const lockId = env.LOCKS_DO.idFromName("wordpress-sync");
    const lock = env.LOCKS_DO.get(lockId);

    const acquired = await lock.fetch(
      new Request("https://worker", {
        method: "POST",
        body: JSON.stringify({ key: "wordpress-sync", action: "acquire" }),
      })
    );

    const lockData = (await acquired.json()) as any;
    if (!lockData.acquired) {
      return json({ error: "Sync already in progress" }, { status: 409 });
    }

    // Mark sync as running in KV so UIs can reflect real-time status
    try {
      await env.SYNC_METADATA_KV.put("last_sync_status", "running");
      await env.SYNC_METADATA_KV.put("last_sync_timestamp", startedAt.toISOString());
    } catch {
      // best-effort
    }

    try {
      const wpRes = await fetch(
        `${env.WORDPRESS_API}?per_page=100&orderby=modified&order=desc`
      );
      if (!wpRes.ok) throw new Error("WordPress API failed");

      const posts = (await wpRes.json()) as any[];
      postsProcessed = Array.isArray(posts) ? posts.length : 0;

      for (const post of posts) {
        await callSupabaseRpc(env, "upsert_wordpress_post", {
          post_id: post.id,
          title: post.title?.rendered,
          content: post.content?.rendered,
          excerpt: post.excerpt?.rendered,
          slug: post.slug,
          date: post.date,
        });
      }

      const finishedAt = new Date();

      try {
        await env.SYNC_METADATA_KV.put("last_sync_timestamp", finishedAt.toISOString());
        await env.SYNC_METADATA_KV.put("last_sync_status", "success");
      } catch {
        // ignore KV failures
      }

      // Update Supabase site settings and activity logs (best-effort)
      await updateWordPressSyncMetadata(env, {
        success: true,
        postsProcessed,
        startedAt,
        finishedAt,
        error: null,
        isScheduler,
        triggeredBy: isScheduler ? "scheduler" : "manual",
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
        await env.SYNC_METADATA_KV.put(
          "last_sync_status",
          `error: ${errorMessage}`
        );
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
        triggeredBy: isScheduler ? "scheduler" : "manual",
      });

      return json({ error: errorMessage }, { status: 500 });
    } finally {
      try {
        await lock.fetch(
          new Request("https://worker", {
            method: "POST",
            body: JSON.stringify({ key: "wordpress-sync", action: "release" }),
          })
        );
      } catch {
        // ignore lock release errors
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    try {
      await env.SYNC_METADATA_KV.put("last_sync_status", `error: ${msg}`);
    } catch {
      // ignore KV failures
    }
    return json({ error: msg }, { status: 500 });
  }
});

// ADMIN WORDPRESS SYNC STATUS
router.get("/api/admin/wordpress/status", async (req: Request, env: Env) => {
  // If Supabase is not configured, fall back to KV-only status
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    try {
      const lastSync = await env.SYNC_METADATA_KV.get("last_sync_timestamp");
      const lastStatus = await env.SYNC_METADATA_KV.get("last_sync_status");
      const isRunning = lastStatus === "running";

      return json({
        isRunning,
        lastSync: lastSync || null,
        nextSync: null,
        postsCount: 0,
        errors:
          lastStatus && lastStatus.startsWith("error:")
            ? [lastStatus]
            : [],
        totalProcessed: 0,
        syncInterval: 300000,
        enabled: env.ENABLE_WORDPRESS_SCHEDULER === "true",
      });
    } catch {
      return json({
        isRunning: false,
        lastSync: null,
        nextSync: null,
        postsCount: 0,
        errors: [],
        totalProcessed: 0,
        syncInterval: 300000,
        enabled: env.ENABLE_WORDPRESS_SCHEDULER === "true",
      });
    }
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: "Admin authentication required" }, { status: 401 });
  }
  const currentUser = await getSupabaseCurrentUser(env, token);
  if (!currentUser || !currentUser.isAdmin) {
    return json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
    };

    // Load site settings
    const settingsUrl = new URL(`${baseUrl}/rest/v1/site_settings`);
    settingsUrl.searchParams.set("select", "key,value,updated_at");
    settingsUrl.searchParams.set("limit", "100");

    const settingsRes = await fetch(settingsUrl.toString(), { headers });
    const settingsRows = settingsRes.ok
      ? ((await settingsRes.json().catch(() => [])) as any[])
      : [];

    const getSetting = (key: string) =>
      settingsRows.find((s) => s && s.key === key);

    const enabledSetting = getSetting("wordpress_sync_enabled");
    const intervalSetting = getSetting("wordpress_sync_interval");
    const lastSyncSetting = getSetting("last_wordpress_sync");

    const enabled =
      enabledSetting?.value === "true" ||
      (enabledSetting == null && env.ENABLE_WORDPRESS_SCHEDULER === "true");

    const intervalMsRaw = intervalSetting?.value
      ? parseInt(intervalSetting.value, 10)
      : NaN;
    const syncInterval =
      Number.isFinite(intervalMsRaw) && intervalMsRaw > 0
        ? intervalMsRaw
        : 5 * 60 * 1000;

    let lastSync: string | null = null;
    let nextSync: string | null = null;

    const lastSyncMs = lastSyncSetting?.value
      ? parseInt(lastSyncSetting.value, 10)
      : NaN;
    if (Number.isFinite(lastSyncMs) && lastSyncMs > 0) {
      const lastDate = new Date(lastSyncMs);
      lastSync = lastDate.toISOString();
      if (enabled) {
        const nextDate = new Date(lastSyncMs + syncInterval);
        nextSync = nextDate.toISOString();
      }
    }

    // KV-based running status
    const kvLastStatus = await env.SYNC_METADATA_KV.get("last_sync_status");
    const kvLastTimestamp = await env.SYNC_METADATA_KV.get(
      "last_sync_timestamp"
    );
    let isRunning = kvLastStatus === "running";

    // Activity-based override (if recent log says running)
    const activityUrl = new URL(`${baseUrl}/rest/v1/activity_logs`);
    activityUrl.searchParams.set(
      "select",
      "id,action,details,created_at"
    );
    activityUrl.searchParams.set("action", "eq.wordpress_sync");
    activityUrl.searchParams.set("order", "created_at.desc");
    activityUrl.searchParams.set("limit", "1");

    const actRes = await fetch(activityUrl.toString(), { headers });
    if (actRes.ok) {
      const actRows = (await actRes.json().catch(() => [])) as any[];
      if (Array.isArray(actRows) && actRows.length > 0) {
        const row = actRows[0];
        const createdAtStr = row.created_at || row.createdAt;
        const createdAt = createdAtStr ? new Date(createdAtStr) : null;
        let details = row.details;
        if (details && typeof details === "string") {
          try {
            details = JSON.parse(details);
          } catch {
            details = {};
          }
        }
        const status = details?.status;
        if (
          status === "running" &&
          createdAt &&
          Date.now() - createdAt.getTime() < 5 * 60 * 1000
        ) {
          isRunning = true;
        }
      }
    }

    // Post count via COUNT(*) header
    let postsCount = 0;
    try {
      const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
      postsUrl.searchParams.set("select", "id");
      postsUrl.searchParams.set("limit", "1");

      const postsRes = await fetch(postsUrl.toString(), {
        headers: {
          ...headers,
          Prefer: "count=exact",
        },
      });
      if (postsRes.ok) {
        const range = postsRes.headers.get("Content-Range");
        if (range && range.includes("/")) {
          const totalStr = range.split("/")[1];
          const total = parseInt(totalStr, 10);
          if (Number.isFinite(total)) {
            postsCount = total;
          }
        }
      }
    } catch {
      // ignore; postsCount stays 0
    }

    // Recent error messages
    const logsUrl = new URL(`${baseUrl}/rest/v1/activity_logs`);
    logsUrl.searchParams.set(
      "select",
      "id,action,details,created_at"
    );
    logsUrl.searchParams.set("action", "eq.wordpress_sync");
    logsUrl.searchParams.set("order", "created_at.desc");
    logsUrl.searchParams.set("limit", "20");

    const logsRes = await fetch(logsUrl.toString(), { headers });
    let errors: (string | { id?: string; timestamp?: string; message?: string; details?: any })[] = [];

    if (logsRes.ok) {
      const logs = (await logsRes.json().catch(() => [])) as any[];
      if (Array.isArray(logs)) {
        for (const row of logs) {
          let details = row.details;
          if (details && typeof details === "string") {
            try {
              details = JSON.parse(details);
            } catch {
              details = {};
            }
          }
          const status = details?.status;
          if (status === "error") {
            const msg =
              details?.message ||
              details?.error ||
              "WordPress sync encountered an error";
            const ts =
              details?.finishedAt ||
              details?.startedAt ||
              row.created_at ||
              row.createdAt ||
              null;
            errors.push({
              id: String(row.id),
              timestamp: ts || undefined,
              message: String(msg),
              details,
            });
          }
        }
      }
    }

    return json({
      isRunning,
      lastSync,
      nextSync,
      postsCount,
      errors,
      totalProcessed: postsCount,
      syncInterval,
      enabled,
    });
  } catch {
    return json(
      {
        isRunning: false,
        lastSync: null,
        nextSync: null,
        postsCount: 0,
        errors: [],
        totalProcessed: 0,
        syncInterval: 5 * 60 * 1000,
        enabled: env.ENABLE_WORDPRESS_SCHEDULER === "true",
      },
      { status: 500 }
    );
  }
});

// ADMIN WORDPRESS SYNC LOGS
router.get("/api/admin/wordpress/logs", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json([]);
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: "Admin authentication required" }, { status: 401 });
  }
  const currentUser = await getSupabaseCurrentUser(env, token);
  if (!currentUser || !currentUser.isAdmin) {
    return json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
    };

    const logsUrl = new URL(`${baseUrl}/rest/v1/activity_logs`);
    logsUrl.searchParams.set(
      "select",
      "id,action,details,created_at"
    );
    logsUrl.searchParams.set("action", "eq.wordpress_sync");
    logsUrl.searchParams.set("order", "created_at.desc");
    logsUrl.searchParams.set("limit", "20");

    const res = await fetch(logsUrl.toString(), { headers });
    if (!res.ok) {
      return json([], { status: 500 });
    }

    const rows = (await res.json().catch(() => [])) as any[];
    const logs = rows.map((row: any) => {
      let details = row.details;
      if (details && typeof details === "string") {
        try {
          details = JSON.parse(details);
        } catch {
          details = {};
        }
      }
      const d = (details && typeof details === "object" ? details : {}) as any;

      const statusRaw = d.status || "success";
      const status =
        statusRaw === "error"
          ? "error"
          : statusRaw === "running"
          ? "running"
          : "success";

      const startedAtStr = d.startedAt || row.created_at || row.createdAt;
      const finishedAtStr = d.finishedAt || startedAtStr;
      const startedAt = startedAtStr ? new Date(startedAtStr) : null;
      const finishedAt = finishedAtStr ? new Date(finishedAtStr) : null;

      let duration = 0;
      if (d.durationMs && Number.isFinite(Number(d.durationMs))) {
        duration = Number(d.durationMs);
      } else if (startedAt && finishedAt) {
        duration = Math.max(0, finishedAt.getTime() - startedAt.getTime());
      }

      const postsProcessed = Number(d.postsProcessed ?? 0);

      const message =
        d.message ||
        (status === "success"
          ? "WordPress sync completed successfully"
          : status === "running"
          ? "WordPress sync running"
          : d.error || "WordPress sync failed");

      return {
        id: String(row.id),
        timestamp: finishedAt
          ? finishedAt.toISOString()
          : startedAt
          ? startedAt.toISOString()
          : row.created_at || row.createdAt || new Date().toISOString(),
        status,
        message: String(message),
        postsProcessed: Number.isFinite(postsProcessed) ? postsProcessed : 0,
        duration,
      };
    });

    return json(logs);
  } catch {
    return json([], { status: 500 });
  }
});

// ADMIN WORDPRESS MANUAL SYNC
router.post(
  "/api/admin/wordpress/sync",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return json({ error: "Admin authentication required" }, { status: 401 });
    }
    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json({ error: "Admin access required" }, { status: 403 });
    }

    // Log trigger event (best-effort)
    try {
      if (env.SUPABASE_SERVICE_ROLE_KEY) {
        const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
        const url = new URL(`${baseUrl}/rest/v1/activity_logs`);
        await fetch(url.toString(), {
          method: "POST",
          headers: {
            apikey: env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            action: "wordpress_sync_trigger",
            details: {
              type: "wordpress_sync_trigger",
              triggeredBy:
                currentUser.fullName ||
                currentUser.username ||
                currentUser.email ||
                `admin:${currentUser.id}`,
              timestamp: new Date().toISOString(),
              source: "worker-admin",
            },
            ip_address:
              req.headers.get("cf-connecting-ip") ||
              req.headers.get("x-forwarded-for") ||
              null,
            user_agent: req.headers.get("user-agent") || null,
          }),
        });
      }
    } catch {
      // ignore logging failures
    }

    try {
      // Call the internal manual sync endpoint
      const reqUrl = new URL(req.url);
      const manualUrl = `${reqUrl.protocol}//${reqUrl.host}/api/wordpress/sync/manual`;

      const res = await fetch(manualUrl, {
        method: "POST",
        headers: {
          "X-Scheduler": "true",
          "X-Sync-Key": env.WORDPRESS_SYNC_KEY || "admin-trigger",
        },
      });

      if (res.status === 409) {
        return json(
          { success: false, message: "WordPress sync already in progress" },
          { status: 409 }
        );
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as any;
        const message =
          body?.error || body?.message || "Failed to trigger WordPress sync";
        return json(
          { success: false, message },
          { status: 500 }
        );
      }

      const payload = (await res.json().catch(() => ({}))) as any;
      return json({
        success: true,
        message: "WordPress sync triggered successfully",
        ...payload,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      return json(
        { success: false, message },
        { status: 500 }
      );
    }
  }
);

// ADMIN WORDPRESS ENABLE/DISABLE
router.post(
  "/api/admin/wordpress/toggle",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return json({ error: "Admin authentication required" }, { status: 401 });
    }
    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json({ error: "Admin access required" }, { status: 403 });
    }

    let enabled: boolean | null = null;
    try {
      const body = (await (req as any).json?.().catch(() => ({}))) || {};
      if (typeof body.enabled === "boolean") {
        enabled = body.enabled;
      } else if (typeof body.enabled === "string") {
        const lowered = body.enabled.toLowerCase();
        enabled =
          lowered === "true" ||
          lowered === "1" ||
          lowered === "yes" ||
          lowered === "on";
      }
    } catch {
      // body parse error -> handled below
    }

    if (enabled === null) {
      return json(
        { error: "enabled boolean is required" },
        { status: 400 }
      );
    }

    try {
      await updateSiteSetting(env, "wordpress_sync_enabled", enabled ? "true" : "false");

      // Log toggle event (best-effort)
      if (env.SUPABASE_SERVICE_ROLE_KEY) {
        const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
        const url = new URL(`${baseUrl}/rest/v1/activity_logs`);
        await fetch(url.toString(), {
          method: "POST",
          headers: {
            apikey: env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            action: "wordpress_sync_toggle",
            details: {
              type: "wordpress_sync_toggle",
              enabled,
              toggledBy:
                currentUser.fullName ||
                currentUser.username ||
                currentUser.email ||
                `admin:${currentUser.id}`,
              timestamp: new Date().toISOString(),
            },
            ip_address:
              req.headers.get("cf-connecting-ip") ||
              req.headers.get("x-forwarded-for") ||
              null,
            user_agent: req.headers.get("user-agent") || null,
          }),
        });
      }

      return json({
        success: true,
        enabled,
        message: `WordPress sync ${enabled ? "enabled" : "disabled"} successfully`,
      });
    } catch {
      return json(
        { error: "Failed to update WordPress sync setting" },
        { status: 500 }
      );
    }
  }
);

// Admin posts management: list, filters, and bulk actions
router.get("/api/admin/posts", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const token = getBearerToken(req);
  if (!token) {
    return json(
      { error: "Admin authentication required" },
      { status: 401 }
    );
  }

  const currentUser = await getSupabaseCurrentUser(env, token);
  if (!currentUser || !currentUser.isAdmin) {
    return json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const urlObj = new URL(req.url);
    const search = urlObj.searchParams;

    const pageRaw = parseInt(search.get("page") || "1", 10);
    const limitRaw = parseInt(search.get("limit") || "50", 10);
    const page =
      Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limitValue =
      Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 50;
    const limit = Math.max(1, Math.min(limitValue, 500));

    const searchTerm = (search.get("search") || "").trim().toLowerCase();
    const categoryParam = (search.get("category") || "")
      .trim()
      .toLowerCase();
    const statusParam = (search.get("status") || "all")
      .trim()
      .toLowerCase();
    const featuredOnly = search.get("featured") === "true";

    const allPosts = await fetchSupabasePosts(env);
    let posts = allPosts;

    if (searchTerm) {
      posts = posts.filter((post) => {
        const title = String(post.title || "").toLowerCase();
        const excerpt = String(post.excerpt || "").toLowerCase();
        const content = String(post.content || "").toLowerCase();
        return (
          title.includes(searchTerm) ||
          excerpt.includes(searchTerm) ||
          content.includes(searchTerm)
        );
      });
    }

    if (categoryParam) {
      posts = posts.filter((post) => {
        const meta =
          post.metadata && typeof post.metadata === "object"
            ? (post.metadata as any)
            : {};
        const theme = String(
          post.themeCategory || meta.themeCategory || ""
        ).toLowerCase();
        return theme === categoryParam;
      });
    }

    if (statusParam && statusParam !== "all") {
      posts = posts.filter((post) => {
        const meta =
          post.metadata && typeof post.metadata === "object"
            ? (post.metadata as any)
            : {};
        const s = String(meta.status || "").toLowerCase();

        if (statusParam === "published") {
          return s === "publish";
        }
        if (statusParam === "draft") {
          return s === "draft" || s === "pending";
        }
        if (statusParam === "flagged") {
          const flagged =
            meta.flagged === true ||
            Number(meta.flagCount || meta.flaggedCount || 0) > 0;
          return flagged;
        }
        return true;
      });
    }

    if (featuredOnly) {
      posts = posts.filter((post) => {
        const meta =
          post.metadata && typeof post.metadata === "object"
            ? (post.metadata as any)
            : {};
        return meta.featured === true;
      });
    }

    const total = posts.length;

    const stats = {
      published: posts.filter((post) => {
        const meta =
          post.metadata && typeof post.metadata === "object"
            ? (post.metadata as any)
            : {};
        return String(meta.status || "").toLowerCase() === "publish";
      }).length,
      pending: posts.filter((post) => {
        const meta =
          post.metadata && typeof post.metadata === "object"
            ? (post.metadata as any)
            : {};
        return String(meta.status || "").toLowerCase() === "pending";
      }).length,
      flagged: posts.filter((post) => {
        const meta =
          post.metadata && typeof post.metadata === "object"
            ? (post.metadata as any)
            : {};
        return (
          meta.flagged === true ||
          Number(meta.flagCount || meta.flaggedCount || 0) > 0
        );
      }).length,
    };

    const start = (page - 1) * limit;
    const end = start + limit;
    const slice =
      start < total ? posts.slice(start, end) : [];
    const hasMore = end < total;

    return json({ posts: slice, total, stats, hasMore });
  } catch {
    return json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
});

router.get("/api/admin/posts/pending", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const token = getBearerToken(req);
  if (!token) {
    return json(
      { error: "Admin authentication required" },
      { status: 401 }
    );
  }

  const currentUser = await getSupabaseCurrentUser(env, token);
  if (!currentUser || !currentUser.isAdmin) {
    return json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const posts = await fetchSupabasePosts(env);
    const pending = posts.filter((post) => {
      const meta =
        post.metadata && typeof post.metadata === "object"
          ? (post.metadata as any)
          : {};
      return String(meta.status || "").toLowerCase() === "pending";
    });

    const stats = {
      pending: pending.length,
      flagged: 0,
      published: 0,
    };

    return json({
      posts: pending,
      total: pending.length,
      stats,
    });
  } catch {
    return json(
      { error: "Failed to fetch pending posts" },
      { status: 500 }
    );
  }
});

router.get("/api/admin/posts/flagged", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const token = getBearerToken(req);
  if (!token) {
    return json(
      { error: "Admin authentication required" },
      { status: 401 }
    );
  }

  const currentUser = await getSupabaseCurrentUser(env, token);
  if (!currentUser || !currentUser.isAdmin) {
    return json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const posts = await fetchSupabasePosts(env);
    const flagged = posts.filter((post) => {
      const meta =
        post.metadata && typeof post.metadata === "object"
          ? (post.metadata as any)
          : {};
      return (
        meta.flagged === true ||
        Number(meta.flagCount || meta.flaggedCount || 0) > 0
      );
    });

    const stats = {
      flagged: flagged.length,
      pending: 0,
      published: 0,
    };

    return json({
      posts: flagged,
      total: flagged.length,
      stats,
    });
  } catch {
    return json(
      { error: "Failed to fetch flagged posts" },
      { status: 500 }
    );
  }
});

router.patch(
  "/api/admin/posts/:id/publish",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment =
        segments.length >= 2
          ? segments[segments.length - 2]
          : "";
      const id = parseInt(decodeURIComponent(idSegment || ""), 10);

      if (!Number.isFinite(id) || id <= 0) {
        return json(
          { error: "Invalid post id" },
          { status: 400 }
        );
      }

      const updated = await adminUpdateSupabasePost(env, id, {
        published: true,
      });

      return json(updated);
    } catch {
      return json(
        { error: "Failed to publish post" },
        { status: 500 }
      );
    }
  }
);

router.patch(
  "/api/admin/posts/:id/unpublish",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment =
        segments.length >= 2
          ? segments[segments.length - 2]
          : "";
      const id = parseInt(decodeURIComponent(idSegment || ""), 10);

      if (!Number.isFinite(id) || id <= 0) {
        return json(
          { error: "Invalid post id" },
          { status: 400 }
        );
      }

      const updated = await adminUpdateSupabasePost(env, id, {
        published: false,
      });

      return json(updated);
    } catch {
      return json(
        { error: "Failed to unpublish post" },
        { status: 500 }
      );
    }
  }
);

router.patch(
  "/api/admin/posts/:id/feature",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment =
        segments.length >= 2
          ? segments[segments.length - 2]
          : "";
      const id = parseInt(decodeURIComponent(idSegment || ""), 10);

      if (!Number.isFinite(id) || id <= 0) {
        return json(
          { error: "Invalid post id" },
          { status: 400 }
        );
      }

      const updated = await adminUpdateSupabasePost(env, id, {
        featured: true,
      });

      return json(updated);
    } catch {
      return json(
        { error: "Failed to feature post" },
        { status: 500 }
      );
    }
  }
);

router.patch(
  "/api/admin/posts/:id/unfeature",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment =
        segments.length >= 2
          ? segments[segments.length - 2]
          : "";
      const id = parseInt(decodeURIComponent(idSegment || ""), 10);

      if (!Number.isFinite(id) || id <= 0) {
        return json(
          { error: "Invalid post id" },
          { status: 400 }
        );
      }

      const updated = await adminUpdateSupabasePost(env, id, {
        featured: false,
      });

      return json(updated);
    } catch {
      return json(
        { error: "Failed to unfeature post" },
        { status: 500 }
      );
    }
  }
);

router.patch(
  "/api/admin/posts/:id",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment =
        segments.length >= 1
          ? segments[segments.length - 1]
          : "";
      const id = parseInt(decodeURIComponent(idSegment || ""), 10);

      if (!Number.isFinite(id) || id <= 0) {
        return json(
          { error: "Invalid post id" },
          { status: 400 }
        );
      }

      const body =
        (await (req as any).json?.().catch(() => ({}))) || {};

      const updated = await adminUpdateSupabasePost(env, id, body);

      return json(updated);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update post";
      const status = message === "Post not found" ? 404 : 500;
      return json({ error: message }, { status });
    }
  }
);

router.delete(
  "/api/admin/posts/:id",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment =
        segments.length >= 1
          ? segments[segments.length - 1]
          : "";
      const id = parseInt(decodeURIComponent(idSegment || ""), 10);

      if (!Number.isFinite(id) || id <= 0) {
        return json(
          { error: "Invalid post id" },
          { status: 400 }
        );
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const serviceKey =
        env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

      const deleteUrl = new URL(`${baseUrl}/rest/v1/posts`);
      deleteUrl.searchParams.set("id", `eq.${id}`);

      const res = await fetch(deleteUrl.toString(), {
        method: "DELETE",
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${serviceKey}`,
          Accept: "application/json",
          Prefer: "return=representation",
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return json(
          {
            error: `Failed to delete post: ${res.status} ${res.statusText} ${text.slice(
              0,
              200
            )}`,
          },
          { status: 500 }
        );
      }

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json(
          { error: "Post not found" },
          { status: 404 }
        );
      }

      const deleted = mapSupabasePostRowToPost(rows[0]);
      return json(deleted);
    } catch {
      return json(
        { error: "Failed to delete post" },
        { status: 500 }
      );
    }
  }
);

router.post(
  "/api/admin/posts/bulk",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return json(
        { error: "Admin authentication required" },
        { status: 401 }
      );
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    try {
      const body =
        (await (req as any).json?.().catch(() => ({}))) || {};

      const action = typeof body.action === "string" ? body.action : "";
      const validActions = [
        "publish",
        "unpublish",
        "delete",
        "feature",
        "unfeature",
      ];

      if (!validActions.includes(action)) {
        return json(
          { error: "Invalid action" },
          { status: 400 }
        );
      }

      const idsInput = Array.isArray(body.postIds)
        ? body.postIds
        : [];
      const postIds = idsInput
        .map((id: any) => Number(id))
        .filter((n: number) => Number.isFinite(n) && n > 0);

      if (!postIds.length) {
        return json(
          { error: "postIds array is required" },
          { status: 400 }
        );
      }

      const results: any[] = [];
      let successCount = 0;

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const serviceKey =
        env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

      for (const id of postIds) {
        try {
          if (action === "delete") {
            const deleteUrl = new URL(`${baseUrl}/rest/v1/posts`);
            deleteUrl.searchParams.set("id", `eq.${id}`);

            const res = await fetch(deleteUrl.toString(), {
              method: "DELETE",
              headers: {
                apikey: env.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${serviceKey}`,
                Accept: "application/json",
                Prefer: "return=representation",
              },
            });

            if (!res.ok) {
              const text = await res.text().catch(() => "");
              results.push({
                id,
                error: `Failed to delete post: ${res.status} ${res.statusText} ${text.slice(
                  0,
                  200
                )}`,
              });
              continue;
            }

            const rows = (await res.json().catch(() => [])) as any[];
            if (!Array.isArray(rows) || rows.length === 0) {
              results.push({ id, error: "Post not found" });
              continue;
            }

            const deleted = mapSupabasePostRowToPost(rows[0]);
            results.push({ id, result: deleted });
            successCount += 1;
          } else {
            let payload: any;
            if (action === "publish") {
              payload = { published: true };
            } else if (action === "unpublish") {
              payload = { published: false };
            } else if (action === "feature") {
              payload = { featured: true };
            } else {
              payload = { featured: false };
            }

            const updated = await adminUpdateSupabasePost(env, id, payload);
            results.push({ id, result: updated });
            successCount += 1;
          }
        } catch (e) {
          results.push({
            id,
            error:
              e instanceof Error ? e.message : "Operation failed",
          });
        }
      }

      return json({
        success: true,
        count: successCount,
        results,
      });
    } catch {
      return json(
        { error: "Failed to process bulk action" },
        { status: 500 }
      );
    }
  }
);

// WORDPRESS POSTS PROXY (avoids browser CORS and matches Express shape)
router.get("/api/wordpress/posts", async (req: Request, env: Env) => {
  try {
    const incomingUrl = new URL(req.url);
    const pageParam = incomingUrl.searchParams.get("page");
    const perPageParam = incomingUrl.searchParams.get("per_page");
    const slug = incomingUrl.searchParams.get("slug") || "";
    const search = incomingUrl.searchParams.get("search") || "";
    const fields = incomingUrl.searchParams.get("_fields") || "";

    const page = Number.isFinite(Number(pageParam)) && Number(pageParam) > 0 ? Number(pageParam) : 1;
    const perPageRaw = Number(perPageParam);
    const per_page =
      Number.isFinite(perPageRaw) && perPageRaw > 0
        ? Math.max(1, Math.min(100, perPageRaw))
        : 100;

    const params = new URLSearchParams();
    if (slug) {
      params.set("slug", slug.trim());
    } else {
      params.set("page", String(page));
      params.set("per_page", String(per_page));
    }
    if (search) params.set("search", search.trim());
    if (fields) params.set("_fields", fields.trim());

    const wpBase =
      env.WORDPRESS_API ||
      "https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts";
    const wpUrl = `${wpBase}?${params.toString()}`;

    const wpRes = await fetch(wpUrl);
    if (!wpRes.ok) {
      const text = await wpRes.text().catch(() => "");
      throw new Error(
        `WordPress API error: ${wpRes.status} ${wpRes.statusText} ${text.slice(
          0,
          200
        )}`
      );
    }

    const posts = await wpRes.json();

    const totalPagesHeader = wpRes.headers.get("X-WP-TotalPages");
    const totalHeader = wpRes.headers.get("X-WP-Total");
    const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
    const total = totalHeader
      ? parseInt(totalHeader, 10)
      : Array.isArray(posts)
      ? posts.length
      : 0;

    return json({
      success: true,
      posts,
      totalPages,
      total,
    });
  } catch (error) {
    console.error(
      "[WordPress] Error fetching posts via Worker proxy",
      error instanceof Error ? error.message : String(error)
    );
    return json(
      {
        success: false,
        message: `Error fetching WordPress posts`,
      },
      { status: 500 }
    );
  }
});

// READING PROGRESS: Supabase-backed (JWT + RLS), Worker-native

// POST /api/reading-progress - upsert progress for current user by slug
router.post("/api/reading-progress", async (req: Request, env: Env) => {
  try {
    // If Supabase isn't configured or there's no Bearer token, fall back to legacy backend
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }
    const authHeader =
      req.headers.get("Authorization") || req.headers.get("authorization") || "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return proxyToBackend(req, env);
    }
    const token = authHeader.slice(7).trim();

    const body = (await (req as any).json?.()) || {};
    const postSlug = typeof body.postSlug === "string" ? body.postSlug : "";
    const percent = Number(body.percentCompleted);

    if (!postSlug) {
      return json({ error: "postSlug is required" }, { status: 400 });
    }
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return json(
        { error: "percentCompleted must be a number between 0 and 100" },
        { status: 400 },
      );
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Resolve post id by slug
    const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
    postsUrl.searchParams.set("select", "id");
    postsUrl.searchParams.set("slug", `eq.${postSlug}`);
    postsUrl.searchParams.set("limit", "1");

    const postsRes = await fetch(postsUrl.toString(), {
      headers,
    });

    if (postsRes.status === 401 || postsRes.status === 403) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    if (!postsRes.ok) {
      return json(
        { error: "Failed to resolve post" },
        { status: 500 },
      );
    }

    const posts = (await postsRes.json().catch(() => [])) as any[];
    if (!Array.isArray(posts) || posts.length === 0 || posts[0]?.id == null) {
      return json({ error: "Post not found" }, { status: 404 });
    }
    const postId = Number(posts[0].id);
    if (!Number.isFinite(postId)) {
      return json({ error: "Post not found" }, { status: 404 });
    }

    // Resolve numeric user id via users table (RLS ensures we only see current user)
    const userUrl = new URL(`${baseUrl}/rest/v1/users`);
    userUrl.searchParams.set("select", "id");
    userUrl.searchParams.set("limit", "1");

    const userRes = await fetch(userUrl.toString(), {
      headers,
    });

    if (userRes.status === 401 || userRes.status === 403) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    if (!userRes.ok) {
      return json(
        { error: "Failed to resolve user" },
        { status: 500 },
      );
    }

    const users = (await userRes.json().catch(() => [])) as any[];
    if (!Array.isArray(users) || users.length === 0 || users[0]?.id == null) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = Number(users[0].id);
    if (!Number.isFinite(userId)) {
      return json({ error: "Authentication required" }, { status: 401 });
    }

    // Insert reading progress row; RLS ensures user_id matches auth.uid() via users table
    const progressUrl = `${baseUrl}/rest/v1/reading_progress`;
    const insertRes = await fetch(progressUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        post_id: postId,
        user_id: userId,
        progress: String(percent),
        last_read_at: new Date().toISOString(),
      }),
    });

    if (insertRes.status === 401 || insertRes.status === 403) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    if (!insertRes.ok) {
      return json(
        { error: "Failed to save reading progress" },
        { status: 500 },
      );
    }

    return json({ success: true }, { status: 201 });
  } catch (_error) {
    return json(
      { error: "Failed to save reading progress" },
      { status: 500 },
    );
  }
});

// GET /api/reading-progress/history - full reading history for current user
router.get("/api/reading-progress/history", async (req: Request, env: Env) => {
  try {
    const authHeader =
      req.headers.get("Authorization") || req.headers.get("authorization") || "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    const token = authHeader.slice(7).trim();
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const url = `${env.SUPABASE_URL}/rest/v1/reading_progress?select=post_id,progress,last_read_at,user_id&order=last_read_at.desc&limit=500`;
    const res = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (res.status === 401 || res.status === 403) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!res.ok) {
      return json(
        { error: "Failed to fetch reading history" },
        { status: 500 }
      );
    }

    const rows = (await res.json().catch(() => [])) as any;
    if (!Array.isArray(rows)) {
      return json({ history: [] });
    }
    return json({ history: rows });
  } catch (error) {
    return json(
      { error: "Failed to fetch reading history" },
      { status: 500 }
    );
  }
});

// GET /api/reading-progress/:slug - latest progress for current user
router.get("/api/reading-progress/:slug", async (req: Request, env: Env) => {
  try {
    const authHeader =
      req.headers.get("Authorization") || req.headers.get("authorization") || "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    const token = authHeader.slice(7).trim();
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const urlObj = new URL(req.url);
    const segments = urlObj.pathname.split("/");
    const slug = decodeURIComponent(segments[segments.length - 1] || "").trim();
    if (!slug) {
      return json({ error: "slug is required" }, { status: 400 });
    }

    // Resolve post id by slug
    const postsUrl = `${env.SUPABASE_URL}/rest/v1/posts?select=id&slug=eq.${encodeURIComponent(
      slug
    )}&limit=1`;
    const postsRes = await fetch(postsUrl, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (postsRes.status === 401 || postsRes.status === 403) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!postsRes.ok) {
      return json(
        { error: "Failed to resolve post" },
        { status: 500 }
      );
    }

    const posts = (await postsRes.json().catch(() => [])) as any[];
    if (!Array.isArray(posts) || posts.length === 0 || posts[0]?.id == null) {
      return json({ error: "Post not found" }, { status: 404 });
    }
    const postId = Number(posts[0].id);
    if (!Number.isFinite(postId)) {
      return json({ error: "Post not found" }, { status: 404 });
    }

    // Fetch latest reading progress for this post (RLS restricts to current user)
    const progressUrl = `${env.SUPABASE_URL}/rest/v1/reading_progress?select=post_id,progress,last_read_at,user_id&post_id=eq.${postId}&order=last_read_at.desc&limit=1`;
    const progRes = await fetch(progressUrl, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (progRes.status === 401 || progRes.status === 403) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!progRes.ok) {
      return json(
        { error: "Failed to fetch reading progress" },
        { status: 500 }
      );
    }

    const rows = (await progRes.json().catch(() => [])) as any[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return json({ progress: null });
    }

    const row = rows[0] as any;
    const percentCompleted = Number(row.progress);
    const lastReadAt = row.last_read_at;

    return json({
      progress: {
        postId,
        userId: row.user_id != null ? Number(row.user_id) : undefined,
        percentCompleted: Number.isFinite(percentCompleted)
          ? percentCompleted
          : 0,
        lastReadAt,
      },
    });
  } catch (error) {
    return json(
      { error: "Failed to fetch reading progress" },
      { status: 500 }
    );
  }
});

/**
 * Build post summaries (basic fields + reactions + analytics) using Supabase REST.
 * Returns summaries keyed by the raw external IDs provided (which may be local IDs or WordPress IDs).
 */
async function buildPostSummaries(env: Env, rawIds: number[]): Promise<any[]> {
  try {
    const ids = Array.from(
      new Set(
        rawIds
          .map((n) => Number(n))
          .filter((n) => Number.isFinite(n) && n > 0)
      )
    ).slice(0, 50); // Cap to 50 IDs per call to avoid excessive fan-out

    if (!ids.length) {
      return [];
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return [];
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceHeaders: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    };

    // 1) Fetch direct local posts by id
    const directUrl = new URL(`${baseUrl}/rest/v1/posts`);
    directUrl.searchParams.set(
      "select",
      "id,title,slug,excerpt,created_at,baseline_likes,baseline_dislikes,likes_count,dislikes_count,metadata"
    );
    directUrl.searchParams.set("id", `in.(${ids.join(",")})`);

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
        "select",
        "id,title,slug,excerpt,created_at,baseline_likes,baseline_dislikes,likes_count,dislikes_count,metadata"
      );
      moreUrl.searchParams.set("id", `in.(${neededLocalIds.join(",")})`);

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
        "select",
        "post_id,page_views,unique_visitors,average_read_time,bounce_rate,updated_at"
      );
      analyticsUrl.searchParams.set("post_id", `in.(${localPostIds.join(",")})`);

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

      const baselineLikes = Number(
        (row as any).baseline_likes ??
          (row as any).baselineLikes ??
          0
      );
      const baselineDislikes = Number(
        (row as any).baseline_dislikes ??
          (row as any).baselineDislikes ??
          0
      );
      const likesCount = Number(
        (row as any).likes_count ?? (row as any).likesCount ?? 0
      );
      const dislikesCount = Number(
        (row as any).dislikes_count ??
          (row as any).dislikesCount ??
          0
      );

      const metadata = (row as any).metadata;
      let wordpressId: number | undefined;
      try {
        const wpIdRaw =
          metadata && typeof metadata === "object"
            ? (metadata as any).wordpressId
            : undefined;
        const wpIdNum = Number(wpIdRaw);
        if (Number.isFinite(wpIdNum) && wpIdNum > 0) {
          wordpressId = wpIdNum;
        }
      } catch {
        // ignore metadata parse issues
      }

      const a = analyticsMap.get(localId);
      const analytics =
        a && typeof a === "object"
          ? {
              pageViews: Number(
                (a as any).page_views ??
                  (a as any).pageViews ??
                  0
              ),
              uniqueVisitors: Number(
                (a as any).unique_visitors ??
                  (a as any).uniqueVisitors ??
                  0
              ),
              averageReadTime: Number(
                (a as any).average_read_time ??
                  (a as any).averageReadTime ??
                  0
              ),
              bounceRate: Number(
                (a as any).bounce_rate ??
                  (a as any).bounceRate ??
                  0
              ),
              updatedAt:
                (a as any).updated_at ??
                (a as any).updatedAt ??
                null,
            }
          : null;

      results.push({
        id: Number(rawId),
        localPostId: localId,
        wordpressId,
        title: (row as any).title ?? "",
        slug: (row as any).slug ?? "",
        excerpt:
          (row as any).excerpt ??
          "",
        createdAt:
          (row as any).created_at ??
          (row as any).createdAt ??
          new Date().toISOString(),
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

// POSTS: Worker-native slug/summary endpoints (Supabase-backed) with legacy listing proxy

// GET /api/posts/slug/:slug - fetch full post by slug
router.get("/api/posts/slug/:slug", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  try {
    const urlObj = new URL(req.url);
    const segments = urlObj.pathname.split("/");
    const rawSlug = decodeURIComponent(segments[segments.length - 1] || "").trim();
    if (!rawSlug) {
      return json({ error: "Slug is required" }, { status: 400 });
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
    postsUrl.searchParams.set(
      "select",
      "id,title,content,excerpt,slug,author_id,is_secret,mature_content,theme_category,reading_time_minutes,likes_count,dislikes_count,baseline_likes,baseline_dislikes,metadata,created_at"
    );
    postsUrl.searchParams.set("slug", `eq.${rawSlug}`);
    postsUrl.searchParams.set("limit", "1");

    const res = await fetch(postsUrl.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return json(
        { error: "Failed to fetch post" },
        { status: 500 }
      );
    }

    const rows = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return json({ error: "Post not found" }, { status: 404 });
    }

    const row = rows[0] as any;
    const content = typeof row.content === "string" ? row.content : "";
    const readingTimeMinutesValue =
      row.reading_time_minutes != null
        ? Number(row.reading_time_minutes)
        : Math.max(
            1,
            Math.ceil(
              content
                .split(/\s+/)
                .filter((w: string) => w.length > 0).length / 200
            )
          );

    const metadata =
      row.metadata && typeof row.metadata === "object"
        ? row.metadata
        : undefined;

    const likesCount = Number(
      row.likes_count ?? row.likesCount ?? 0
    );
    const dislikesCount = Number(
      row.dislikes_count ?? row.dislikesCount ?? 0
    );

    const baselineLikes = Number(
      row.baseline_likes ?? row.baselineLikes ?? 0
    );
    const baselineDislikes = Number(
      row.baseline_dislikes ?? row.baselineDislikes ?? 0
    );

    const post = {
      id: Number(row.id),
      title: row.title ?? "",
      content,
      slug: row.slug ?? rawSlug,
      excerpt: row.excerpt ?? null,
      authorId:
        row.author_id != null ? Number(row.author_id) : undefined,
      isSecret: Boolean(row.is_secret),
      isAdminPost: null,
      matureContent: Boolean(row.mature_content),
      themeCategory:
        row.theme_category ??
        (metadata as any)?.themeCategory ??
        null,
      readingTimeMinutes: readingTimeMinutesValue,
      likesCount,
      dislikesCount,
      baselineLikes,
      baselineDislikes,
      metadata: metadata ?? {},
      createdAt: row.created_at ?? new Date().toISOString(),
    };

    return json(post);
  } catch {
    return json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
});

// GET /api/posts/:id/summary - single post summary by external id
router.get("/api/posts/:id/summary", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  try {
    const urlObj = new URL(req.url);
    const segments = urlObj.pathname.split("/");
    // .../api/posts/:id/summary -> second to last segment is id
    const idSegment = segments.length >= 2 ? segments[segments.length - 2] : "";
    const rawId = parseInt(decodeURIComponent(idSegment || ""), 10);
    if (!Number.isFinite(rawId) || rawId <= 0) {
      return json({ error: "Invalid post id" }, { status: 400 });
    }

    const summaries = await buildPostSummaries(env, [rawId]);
    if (!summaries.length) {
      return json({ error: "Post not found" }, { status: 404 });
    }

    return json(summaries[0]);
  } catch {
    return json(
      { error: "Failed to fetch post summary" },
      { status: 500 }
    );
  }
});

// GET /api/posts/summary?ids=1,2,3 - batch summaries by external ids
router.get("/api/posts/summary", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  try {
    const urlObj = new URL(req.url);
    const search = urlObj.searchParams;
    const rawParams = [
      ...search.getAll("ids"),
      ...search.getAll("id"),
    ];
    const joined = rawParams.length ? rawParams.join(",") : "";
    const list = joined
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);

    const ids = Array.from(new Set(list));
    if (!ids.length) {
      return json({ results: [] });
    }

    const results = await buildPostSummaries(env, ids);
    return json({ results });
  } catch {
    return json(
      { error: "Failed to fetch post summaries" },
      { status: 500 }
    );
  }
});

// POSTS listing/community: Supabase-backed for read operations with backend fallback

function mapSupabasePostRowToPost(row: any): any {
  const content = typeof row.content === "string" ? row.content : "";
  const metadata =
    row.metadata && typeof row.metadata === "object" ? row.metadata : {};

  const readingTimeMinutesValue =
    row.reading_time_minutes != null
      ? Number(row.reading_time_minutes)
      : Math.max(
          1,
          Math.ceil(
            content
              .split(/\s+/)
              .filter((w: string) => w.length > 0).length / 200
          )
        );

  const likesCount = Number(row.likes_count ?? row.likesCount ?? 0);
  const dislikesCount = Number(row.dislikes_count ?? row.dislikesCount ?? 0);
  const baselineLikes = Number(
    row.baseline_likes ?? row.baselineLikes ?? 0
  );
  const baselineDislikes = Number(
    row.baseline_dislikes ?? row.baselineDislikes ?? 0
  );

  const themeCategory =
    row.theme_category ??
    (metadata as any)?.themeCategory ??
    null;

  return {
    id: Number(row.id),
    title: row.title ?? "",
    content,
    slug: row.slug ?? "",
    excerpt: row.excerpt ?? null,
    authorId: row.author_id != null ? Number(row.author_id) : undefined,
    isSecret: Boolean(row.is_secret),
    isAdminPost:
      typeof row.isAdminPost === "boolean"
        ? row.isAdminPost
        : (metadata as any)?.isAdminPost ?? null,
    matureContent: Boolean(row.mature_content),
    themeCategory,
    readingTimeMinutes: readingTimeMinutesValue,
    likesCount,
    dislikesCount,
    baselineLikes,
    baselineDislikes,
    metadata,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

async function fetchSupabasePosts(env: Env): Promise<any[]> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return [];
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
  const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
  postsUrl.searchParams.set(
    "select",
    "id,title,content,excerpt,slug,author_id,is_secret,isAdminPost,mature_content,theme_category,reading_time_minutes,likes_count,dislikes_count,baseline_likes,baseline_dislikes,metadata,created_at"
  );
  postsUrl.searchParams.set("order", "created_at.desc");
  postsUrl.searchParams.set("limit", "1000");

  const res = await fetch(postsUrl.toString(), {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts from Supabase");
  }

  const rows = (await res.json().catch(() => [])) as any[];
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(mapSupabasePostRowToPost);
}

async function fetchSupabasePostRowById(
  env: Env,
  id: number
): Promise<any | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return null;
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

  const url = new URL(`${baseUrl}/rest/v1/posts`);
  url.searchParams.set(
    "select",
    "id,title,content,excerpt,slug,author_id,is_secret,isAdminPost,mature_content,theme_category,reading_time_minutes,likes_count,dislikes_count,baseline_likes,baseline_dislikes,metadata,created_at"
  );
  url.searchParams.set("id", `eq.${id}`);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    return null;
  }

  const rows = (await res.json().catch(() => [])) as any[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function adminUpdateSupabasePost(
  env: Env,
  id: number,
  body: any
): Promise<any> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error("Supabase not configured");
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

  const hasOwn = Object.prototype.hasOwnProperty;

  const hasMetadataPatch =
    body &&
    typeof body.metadata === "object" &&
    body.metadata !== null &&
    !Array.isArray(body.metadata);
  const hasFeaturedPatch = body && hasOwn.call(body, "featured");
  const hasPublishedPatch = body && hasOwn.call(body, "published");
  const needsMetadataUpdate =
    hasMetadataPatch || hasFeaturedPatch || hasPublishedPatch;

  let existingMeta: any = {};
  if (needsMetadataUpdate) {
    const row = await fetchSupabasePostRowById(env, id);
    if (!row) {
      throw new Error("Post not found");
    }
    const meta = row.metadata;
    existingMeta =
      meta && typeof meta === "object" && !Array.isArray(meta) ? meta : {};
  }

  const patch: any = {};

  if (body && typeof body.title === "string") {
    patch.title = body.title;
  }
  if (body && typeof body.content === "string") {
    patch.content = body.content;
  }
  if (body && typeof body.excerpt === "string") {
    patch.excerpt = body.excerpt;
  }
  if (body && typeof body.isSecret === "boolean") {
    patch.is_secret = body.isSecret;
  }
  if (body && typeof body.matureContent === "boolean") {
    patch.mature_content = body.matureContent;
  }
  if (body && typeof body.themeCategory === "string") {
    patch.theme_category = body.themeCategory;
  }
  if (
    body &&
    typeof body.readingTimeMinutes === "number" &&
    Number.isFinite(body.readingTimeMinutes)
  ) {
    patch.reading_time_minutes = Math.max(
      1,
      Math.round(body.readingTimeMinutes)
    );
  }

  if (needsMetadataUpdate) {
    let meta = { ...existingMeta };

    if (hasMetadataPatch) {
      meta = { ...meta, ...body.metadata };
    }

    if (hasFeaturedPatch) {
      meta.featured = !!body.featured;
    }

    if (hasPublishedPatch) {
      meta.status = body.published ? "publish" : "pending";
    }

    patch.metadata = meta;

    const metaTheme =
      meta && typeof meta === "object" ? (meta as any).themeCategory : null;
    if (!patch.theme_category && typeof metaTheme === "string" && metaTheme) {
      patch.theme_category = metaTheme;
    }
  }

  if (Object.keys(patch).length === 0) {
    throw new Error("No valid fields to update");
  }

  const updateUrl = new URL(`${baseUrl}/rest/v1/posts`);
  updateUrl.searchParams.set("id", `eq.${id}`);

  const res = await fetch(updateUrl.toString(), {
    method: "PATCH",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to update post: ${res.status} ${res.statusText} ${text.slice(
        0,
        200
      )}`
    );
  }

  const rows = (await res.json().catch(() => [])) as any[];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Post not found");
  }

  return mapSupabasePostRowToPost(rows[0]);
}

router.get("/api/posts", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  try {
    const urlObj = new URL(req.url);
    const search = urlObj.searchParams;
    const pageParam = Number(search.get("page") || "1");
    const limitParam = Number(search.get("limit") || "16");

    const page =
      Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limitRaw =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 16;
    const limit = Math.max(1, Math.min(limitRaw, 100));

    const category = (search.get("category") || "").trim();
    const searchTerm = (search.get("search") || "").trim().toLowerCase();

    const allPosts = await fetchSupabasePosts(env);
    if (!allPosts.length) {
      return json({ posts: [], hasMore: false });
    }

    let filtered = allPosts;

    if (category) {
      const catLower = category.toLowerCase();
      filtered = filtered.filter((post) => {
        const meta =
          post.metadata && typeof post.metadata === "object"
            ? post.metadata
            : {};
        const theme = String(
          post.themeCategory ||
            (meta as any).themeCategory ||
            ""
        ).toLowerCase();
        return theme === catLower;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((post) => {
        const title = String(post.title || "").toLowerCase();
        const excerpt = String(post.excerpt || "").toLowerCase();
        const content = String(post.content || "").toLowerCase();
        return (
          title.includes(searchTerm) ||
          excerpt.includes(searchTerm) ||
          content.includes(searchTerm)
        );
      });
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageItems =
      start < total ? filtered.slice(start, end) : [];
    const hasMore = end < total;

    return json({ posts: pageItems, hasMore });
  } catch {
    return proxyToBackend(req, env);
  }
});

router.get("/api/posts/community", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  try {
    const urlObj = new URL(req.url);
    const search = urlObj.searchParams;
    const pageParam = Number(search.get("page") || "1");
    const limitParam = Number(search.get("limit") || "16");

    const page =
      Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limitRaw =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 16;
    const limit = Math.max(1, Math.min(limitRaw, 100));

    const category = (search.get("category") || "").trim();
    const searchTerm = (search.get("search") || "").trim().toLowerCase();

    const allPosts = await fetchSupabasePosts(env);
    if (!allPosts.length) {
      return json({ posts: [], hasMore: false });
    }

    // Restrict to community posts (metadata.isCommunityPost === true)
    let filtered = allPosts.filter((post) => {
      const meta =
        post.metadata && typeof post.metadata === "object"
          ? post.metadata
          : {};
      return (meta as any).isCommunityPost === true;
    });

    if (category) {
      const catLower = category.toLowerCase();
      filtered = filtered.filter((post) => {
        const meta =
          post.metadata && typeof post.metadata === "object"
            ? post.metadata
            : {};
        const theme = String(
          post.themeCategory ||
            (meta as any).themeCategory ||
            ""
        ).toLowerCase();
        return theme === catLower;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((post) => {
        const title = String(post.title || "").toLowerCase();
        const excerpt = String(post.excerpt || "").toLowerCase();
        const content = String(post.content || "").toLowerCase();
        return (
          title.includes(searchTerm) ||
          excerpt.includes(searchTerm) ||
          content.includes(searchTerm)
        );
      });
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageItems =
      start < total ? filtered.slice(start, end) : [];
    const hasMore = end < total;

    return json({ posts: pageItems, hasMore });
  } catch {
    return proxyToBackend(req, env);
  }
});

// Reactions: Supabase-backed Worker endpoints with legacy fallback

type ReactionState = "like" | "dislike" | "none";

function parseReactionState(value: any): ReactionState {
  if (value === "like" || value === "dislike") return value;
  return "none";
}

function computeReactionDelta(
  prev: ReactionState,
  next: ReactionState
): {
  deltaLikes: number;
  deltaDislikes: number;
} {
  if (prev === next) return { deltaLikes: 0, deltaDislikes: 0 };
  let deltaLikes = 0;
  let deltaDislikes = 0;

  if (prev === "none") {
    if (next === "like") deltaLikes = 1;
    else if (next === "dislike") deltaDislikes = 1;
  } else if (prev === "like") {
    if (next === "none") {
      deltaLikes = -1;
    } else if (next === "dislike") {
      deltaLikes = -1;
      deltaDislikes = 1;
    }
  } else if (prev === "dislike") {
    if (next === "none") {
      deltaDislikes = -1;
    } else if (next === "like") {
      deltaLikes = 1;
      deltaDislikes = -1;
    }
  }

  return { deltaLikes, deltaDislikes };
}

// GET /api/posts/:id/reactions - single post reaction totals
router.get("/api/posts/:id/reactions", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  try {
    const urlObj = new URL(req.url);
    const segments = urlObj.pathname.split("/");
    const idSegment =
      segments.length >= 2 ? segments[segments.length - 2] : "";
    const rawId = parseInt(decodeURIComponent(idSegment || ""), 10);
    if (!Number.isFinite(rawId) || rawId <= 0) {
      return json({ error: "Invalid post id" }, { status: 400 });
    }

    const summaries = await buildPostSummaries(env, [rawId]);
    if (!summaries.length) {
      return json({ error: "Post not found" }, { status: 404 });
    }

    const s = summaries[0] as any;
    const reactions = s.reactions || {};
    const baselineLikes = Number(reactions.baselineLikes ?? 0);
    const baselineDislikes = Number(reactions.baselineDislikes ?? 0);
    const likesCount = Number(reactions.likesCount ?? 0);
    const dislikesCount = Number(reactions.dislikesCount ?? 0);

    return json({
      postId: Number(s.localPostId ?? s.id ?? rawId),
      baselineLikes,
      baselineDislikes,
      likesCount,
      dislikesCount,
      totals: {
        likes: baselineLikes + likesCount,
        dislikes: baselineDislikes + dislikesCount,
      },
    });
  } catch {
    return proxyToBackend(req, env);
  }
});

// GET /api/posts/reactions-batch?ids=1,2,3
router.get("/api/posts/reactions-batch", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  try {
    const urlObj = new URL(req.url);
    const search = urlObj.searchParams;
    const rawParams = [
      ...search.getAll("ids"),
      ...search.getAll("id"),
    ];
    const joined = rawParams.length ? rawParams.join(",") : "";
    const list = joined
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);

    const ids = Array.from(new Set(list));
    if (!ids.length) {
      return json({ results: [] });
    }

    const summaries = await buildPostSummaries(env, ids);
    const results = summaries.map((s: any) => {
      const reactions = s.reactions || {};
      const baselineLikes = Number(reactions.baselineLikes ?? 0);
      const baselineDislikes = Number(reactions.baselineDislikes ?? 0);
      const likesCount = Number(reactions.likesCount ?? 0);
      const dislikesCount = Number(reactions.dislikesCount ?? 0);
      const localId = Number(s.localPostId ?? s.id ?? 0);

      return {
        postId: localId,
        baselineLikes,
        baselineDislikes,
        likesCount,
        dislikesCount,
        totals: {
          likes: baselineLikes + likesCount,
          dislikes: baselineDislikes + dislikesCount,
        },
      };
    });

    return json({ results });
  } catch {
    return proxyToBackend(req, env);
  }
});

// POST /api/posts/:id/reaction - update aggregate reaction counters
router.post("/api/posts/:id/reaction", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  try {
    const urlObj = new URL(req.url);
    const segments = urlObj.pathname.split("/");
    const idSegment =
      segments.length >= 2 ? segments[segments.length - 2] : "";
    const rawId = parseInt(decodeURIComponent(idSegment || ""), 10);
    if (!Number.isFinite(rawId) || rawId <= 0) {
      return json({ error: "Invalid post id" }, { status: 400 });
    }

    const body = (await (req as any).json?.()) || {};
    const isLike = Boolean((body as any).isLike);
    const prevState = parseReactionState((body as any).prevState);
    const hasExplicitNextState =
      body && Object.prototype.hasOwnProperty.call(body, "nextState");
    let nextState = parseReactionState((body as any).nextState);

    // For legacy callers that don't send nextState, derive it from isLike.
    // If nextState is provided (including "none"), respect it.
    if (!hasExplicitNextState) {
      nextState = isLike ? "like" : "dislike";
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceHeaders: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    };

    const localPostId = await resolveLocalPostIdFromExternal(env, rawId);
    if (!Number.isFinite(localPostId || NaN)) {
      return json({ error: "Post not found" }, { status: 404 });
    }
    const postId = Number(localPostId);

    const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
    postsUrl.searchParams.set(
      "select",
      "id,baseline_likes,baseline_dislikes,likes_count,dislikes_count"
    );
    postsUrl.searchParams.set("id", `eq.${postId}`);
    postsUrl.searchParams.set("limit", "1");

    const res = await fetch(postsUrl.toString(), { headers: serviceHeaders });
    if (!res.ok) {
      return json({ error: "Failed to update reaction" }, { status: 500 });
    }
    const rows = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return json({ error: "Post not found" }, { status: 404 });
    }

    const row = rows[0] as any;
    const baselineLikes = Number(row.baseline_likes ?? row.baselineLikes ?? 0);
    const baselineDislikes = Number(
      row.baseline_dislikes ?? row.baselineDislikes ?? 0
    );
    const currentLikesCount = Number(
      row.likes_count ?? row.likesCount ?? 0
    );
    const currentDislikesCount = Number(
      row.dislikes_count ?? row.dislikesCount ?? 0
    );

    const { deltaLikes, deltaDislikes } = computeReactionDelta(
      prevState,
      nextState
    );
    const newLikesCount = Math.max(0, currentLikesCount + deltaLikes);
    const newDislikesCount = Math.max(
      0,
      currentDislikesCount + deltaDislikes
    );

    let finalLikesCount = newLikesCount;
    let finalDislikesCount = newDislikesCount;

    try {
      const updateUrl = new URL(`${baseUrl}/rest/v1/posts`);
      updateUrl.searchParams.set("id", `eq.${postId}`);

      const updateRes = await fetch(updateUrl.toString(), {
        method: "PATCH",
        headers: {
          ...serviceHeaders,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          likes_count: newLikesCount,
          dislikes_count: newDislikesCount,
        }),
      });

      if (updateRes.ok) {
        const updatedRows = (await updateRes.json().catch(() => [])) as any[];
        if (Array.isArray(updatedRows) && updatedRows.length > 0) {
          const updated = updatedRows[0] as any;
          finalLikesCount = Number(
            updated.likes_count ?? updated.likesCount ?? newLikesCount
          );
          finalDislikesCount = Number(
            updated.dislikes_count ??
              updated.dislikesCount ??
              newDislikesCount
          );
        }
      }
    } catch {
      // best-effort; fall back to optimistic values on error
    }

    const totalsLikes = baselineLikes + finalLikesCount;
    const totalsDislikes = baselineDislikes + finalDislikesCount;

    return json({
      postId,
      baselineLikes,
      baselineDislikes,
      likesCount: finalLikesCount,
      dislikesCount: finalDislikesCount,
      totals: {
        likes: totalsLikes,
        dislikes: totalsDislikes,
      },
    });
  } catch {
    return proxyToBackend(req, env);
  }
});

// REACTIONS SSE: streaming reaction updates per post (best-effort)
router.get("/api/posts/:id/reactions/stream", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    // In non-Supabase environments, defer to the legacy backend
    return proxyToBackend(req, env);
  }

  const urlObj = new URL(req.url);
  const segments = urlObj.pathname.split("/").filter(Boolean);
  const idSegment = segments[2]; // /api/posts/:id/reactions/stream -> ["api","posts",":id",...]
  const rawId = Number(idSegment);
  if (!Number.isFinite(rawId) || rawId <= 0) {
    return json({ error: "Invalid postId" }, { status: 400 });
  }

  let intervalId: number | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sendEvent = (event: string, data: any) => {
        try {
          const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Ignore write errors; the stream will be closed by cancel()
        }
      };

      // Send an initial snapshot
      const sendSnapshot = async (eventName: "initial" | "update") => {
        try {
          const summaries = await buildPostSummaries(env, [rawId]);
          const summary = summaries[0];
          if (!summary) return;

          const reactions = summary.reactions || {};
          const payload = {
            postId: summary.localPostId ?? summary.id ?? rawId,
            baselineLikes: Number(reactions.baselineLikes ?? 0),
            baselineDislikes: Number(reactions.baselineDislikes ?? 0),
            likesCount: Number(reactions.likesCount ?? 0),
            dislikesCount: Number(reactions.dislikesCount ?? 0),
            totals: {
              likes:
                Number(reactions.baselineLikes ?? 0) +
                Number(reactions.likesCount ?? 0),
              dislikes:
                Number(reactions.baselineDislikes ?? 0) +
                Number(reactions.dislikesCount ?? 0),
            },
            ts: Date.now(),
          };

          sendEvent(eventName, payload);
        } catch {
          // Surface as SSE error event but do not terminate the stream
          sendEvent("error", {
            postId: rawId,
            message: "Failed to read reactions snapshot",
          });
        }
      };

      await sendSnapshot("initial");

      // Periodic updates (lightweight polling)
      intervalId = setInterval(() => {
        // Fire and forget; errors are handled inside sendSnapshot
        void sendSnapshot("update");
      }, 25_000) as unknown as number;

      // Heartbeat ping so intermediaries keep the connection alive
      const pingInterval = setInterval(() => {
        sendEvent("ping", { ts: Date.now() });
      }, 25_000) as unknown as number;

      // Combine both intervals into one handle for cleanup
      intervalId = pingInterval;
    },
    cancel() {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

// Comments: Supabase-backed list/create/flag with legacy fallback

function parseCookies(header: string | null): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  try {
    const parts = header.split(";");
    for (const part of parts) {
      const [name, ...rest] = part.split("=");
      const key = name.trim();
      if (!key) continue;
      const value = rest.join("=").trim();
      if (!value) continue;
      result[key] = decodeURIComponent(value);
    }
  } catch {
    // ignore parse errors
  }
  return result;
}

function getAnonCommentIdFromCookie(header: string | null): string | null {
  const cookies = parseCookies(header);
  return cookies["anon_comment_id"] || null;
}

function makeAnonCommentId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2)}`;
  }
}

// GET /api/posts/:postId/comments - list comments for a post
router.get(
  "/api/posts/:postId/comments",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment =
        segments.length >= 2 ? segments[segments.length - 2] : "";
      const rawPostId = parseInt(
        decodeURIComponent(idSegment || ""),
        10
      );
      if (!Number.isFinite(rawPostId) || rawPostId <= 0) {
        return json({ error: "Invalid post id" }, { status: 400 });
      }

      const localPostId = await resolveLocalPostIdFromExternal(
        env,
        rawPostId
      );
      if (!Number.isFinite(localPostId || NaN)) {
        return json([]);
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      };

      const commentsUrl = new URL(`${baseUrl}/rest/v1/comments`);
      commentsUrl.searchParams.set(
        "select",
        "id,content,post_id,user_id,is_approved,edited,edited_at,metadata,created_at,parent_id"
      );
      commentsUrl.searchParams.set(
        "post_id",
        `eq.${Number(localPostId)}`
      );
      commentsUrl.searchParams.set("order", "created_at.desc");
      commentsUrl.searchParams.set("limit", "500");

      const res = await fetch(commentsUrl.toString(), { headers });
      if (res.status === 401 || res.status === 403) {
        return proxyToBackend(req, env);
      }
      if (!res.ok) {
        return json(
          { error: "Failed to fetch comments" },
          { status: 500 }
        );
      }

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json([]);
      }

      let userKey: string | null = null;
      const token = getBearerToken(req);
      if (token) {
        const userId = await getSupabaseUserIdFromJwt(env, token);
        if (Number.isFinite(userId || NaN)) {
          userKey = String(userId);
        }
      }
      if (!userKey) {
        const cookieHeader =
          req.headers.get("Cookie") || req.headers.get("cookie") || "";
        const anonId = getAnonCommentIdFromCookie(cookieHeader);
        if (anonId) {
          userKey = `anon:${anonId}`;
        }
      }

      const enhanced = rows.map((row: any) => {
        let metadata = row.metadata;
        if (metadata && typeof metadata === "string") {
          try {
            metadata = JSON.parse(metadata);
          } catch {
            metadata = {};
          }
        }
        if (!metadata || typeof metadata !== "object") {
          metadata = {};
        }
        const meta = metadata as any;

        const baseApproved =
          (row as any).approved === undefined
            ? Boolean(row.is_approved)
            : Boolean((row as any).approved);
        const ownerKey =
          meta && meta.ownerKey != null ? String(meta.ownerKey) : null;
        const isOwner =
          !!userKey && !!ownerKey && String(ownerKey) === userKey;
        const uxApproved = baseApproved || isOwner;

        const author =
          (meta && meta.author) ||
          (meta && meta.name) ||
          "Guest";

        return {
          id: row.id,
          content: row.content ?? "",
          createdAt: row.created_at,
          metadata: {
            ...meta,
            author,
          },
          is_approved: row.is_approved === true,
          approved: uxApproved,
          parentId:
            row.parent_id != null
              ? Number(row.parent_id)
              : null,
          isOwner,
        };
      });

      return json(enhanced);
    } catch {
      return proxyToBackend(req, env);
    }
  }
);

// POST /api/posts/:postId/comments - create a new comment or reply
router.post(
  "/api/posts/:postId/comments",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment =
        segments.length >= 2 ? segments[segments.length - 2] : "";
      const rawPostId = parseInt(
        decodeURIComponent(idSegment || ""),
        10
      );
      if (!Number.isFinite(rawPostId) || rawPostId <= 0) {
        return json({ error: "Invalid post id" }, { status: 400 });
      }

      const body = (await (req as any).json?.()) || {};
      const rawContent =
        typeof body.content === "string" ? body.content : "";
      const content = rawContent.trim();
      if (!content) {
        return json(
          { error: "Content is required" },
          { status: 400 }
        );
      }

      const localPostId = await resolveLocalPostIdFromExternal(
        env,
        rawPostId
      );
      if (!Number.isFinite(localPostId || NaN)) {
        return json({ error: "Post not found" }, { status: 404 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const token = getBearerToken(req);
      let userId: number | null = null;
      if (token) {
        const uid = await getSupabaseUserIdFromJwt(env, token);
        if (Number.isFinite(uid || NaN)) {
          userId = Number(uid);
        }
      }

      const cookieHeader =
        req.headers.get("Cookie") || req.headers.get("cookie") || "";
      let anonId = getAnonCommentIdFromCookie(cookieHeader);
      let setAnonCookie = false;
      if (!userId) {
        if (!anonId) {
          anonId = makeAnonCommentId();
          setAnonCookie = true;
        }
      }

      const userKey =
        userId != null && Number.isFinite(userId)
          ? String(userId)
          : `anon:${anonId}`;

      const authorFromBody =
        typeof body.author === "string" ? body.author.trim() : "";
      const author =
        authorFromBody ||
        (userId != null ? "User" : "Guest");

      const needsModeration = Boolean(body.needsModeration === true);
      const moderationStatus = String(
        body.moderationStatus || ""
      ).toLowerCase();
      const holdForReview =
        needsModeration ||
        moderationStatus === "flagged" ||
        moderationStatus === "under_review";

      const isApproved = !holdForReview;

      const selectionStart =
        typeof body.selectionStart === "number"
          ? body.selectionStart
          : Number.isFinite(Number(body.selectionStart))
          ? Number(body.selectionStart)
          : undefined;
      const selectionEnd =
        typeof body.selectionEnd === "number"
          ? body.selectionEnd
          : Number.isFinite(Number(body.selectionEnd))
          ? Number(body.selectionEnd)
          : undefined;
      const anchorParagraphIndex =
        typeof body.anchorParagraphIndex === "number"
          ? body.anchorParagraphIndex
          : Number.isFinite(Number(body.anchorParagraphIndex))
          ? Number(body.anchorParagraphIndex)
          : undefined;
      const selectionText =
        typeof body.selectionText === "string"
          ? body.selectionText
          : undefined;

      const metadata: any = {
        author,
        isAnonymous: !userId,
        moderated: holdForReview,
        originalContent: content,
        replyCount: 0,
        ownerKey: userKey,
      };

      if (
        selectionText &&
        selectionStart != null &&
        selectionEnd != null
      ) {
        metadata.selectionAnchor = {
          startOffset: Number(selectionStart),
          endOffset: Number(selectionEnd),
          paragraphIndex:
            anchorParagraphIndex != null
              ? Number(anchorParagraphIndex)
              : undefined,
          text: selectionText,
        };
      }

      const parentIdRaw = (body as any).parentId;
      const parentId =
        typeof parentIdRaw === "number"
          ? parentIdRaw
          : Number.isFinite(Number(parentIdRaw))
          ? Number(parentIdRaw)
          : null;

      const insertBody: Record<string, any> = {
        post_id: Number(localPostId),
        user_id:
          userId != null && Number.isFinite(userId) ? userId : null,
        content,
        parent_id: parentId,
        is_approved: isApproved,
        metadata,
        created_at: new Date().toISOString(),
      };

      const insertRes = await fetch(
        `${baseUrl}/rest/v1/comments`,
        {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "return=representation",
          },
          body: JSON.stringify(insertBody),
        }
      );

      if (insertRes.status === 401 || insertRes.status === 403) {
        return proxyToBackend(req, env);
      }
      if (!insertRes.ok) {
        return json(
          { error: "Failed to create comment" },
          { status: 500 }
        );
      }

      const rows = (await insertRes.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json(
          { error: "Failed to create comment" },
          { status: 500 }
        );
      }

      const row = rows[0] as any;
      let metaOut = row.metadata;
      if (metaOut && typeof metaOut === "string") {
        try {
          metaOut = JSON.parse(metaOut);
        } catch {
          metaOut = {};
        }
      }
      if (!metaOut || typeof metaOut !== "object") {
        metaOut = {};
      }

      const baseApproved = row.is_approved === true;
      const approved = baseApproved || true;

      const responseComment = {
        id: row.id,
        content: row.content ?? content,
        createdAt: row.created_at ?? insertBody.created_at,
        metadata: metaOut,
        is_approved: row.is_approved === true,
        approved,
        parentId:
          row.parent_id != null
            ? Number(row.parent_id)
            : insertBody.parent_id,
        isOwner: true,
      };

      const headersInit: Record<string, string> = {};
      if (setAnonCookie && !userId && anonId) {
        headersInit["Set-Cookie"] =
          `anon_comment_id=${encodeURIComponent(
            anonId
          )}; Path=/; Max-Age=31536000; SameSite=Lax`;
      }

      return json(responseComment, {
        status: 201,
        headers: headersInit,
      });
    } catch {
      return proxyToBackend(req, env);
    }
  }
);

// POST /api/comments/:id/flag - flag a comment for moderation
router.post(
  "/api/comments/:id/flag",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment =
        segments.length >= 2 ? segments[segments.length - 2] : "";
      const commentId = parseInt(
        decodeURIComponent(idSegment || ""),
        10
      );
      if (!Number.isFinite(commentId) || commentId <= 0) {
        return json({ error: "Invalid comment id" }, { status: 400 });
      }

      const body = (await (req as any).json?.()) || {};
      const reason =
        typeof body.reason === "string" && body.reason.trim().length > 0
          ? body.reason.trim()
          : "inappropriate content";

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      };

      const getUrl = new URL(`${baseUrl}/rest/v1/comments`);
      getUrl.searchParams.set("select", "id,metadata");
      getUrl.searchParams.set("id", `eq.${commentId}`);
      getUrl.searchParams.set("limit", "1");

      const res = await fetch(getUrl.toString(), { headers });
      if (res.status === 401 || res.status === 403) {
        return proxyToBackend(req, env);
      }
      if (!res.ok) {
        return json(
          { error: "Failed to flag comment" },
          { status: 500 }
        );
      }

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json(
          { error: "Comment not found" },
          { status: 404 }
        );
      }

      let metadata = rows[0].metadata;
      if (metadata && typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = {};
        }
      }
      if (!metadata || typeof metadata !== "object") {
        metadata = {};
      }

      const token = getBearerToken(req);
      let userKey: string | null = null;
      if (token) {
        const userId = await getSupabaseUserIdFromJwt(env, token);
        if (Number.isFinite(userId || NaN)) {
          userKey = String(userId);
        }
      }
      if (!userKey) {
        const cookieHeader =
          req.headers.get("Cookie") || req.headers.get("cookie") || "";
        const anonId = getAnonCommentIdFromCookie(cookieHeader);
        userKey = anonId ? `anon:${anonId}` : "anon";
      }

      const updatedMeta = {
        ...(metadata as any),
        status: "flagged",
        flaggedAt: new Date().toISOString(),
        flaggedBy: userKey,
        flagReason: reason,
      };

      const updateUrl = new URL(`${baseUrl}/rest/v1/comments`);
      updateUrl.searchParams.set("id", `eq.${commentId}`);

      const updRes = await fetch(updateUrl.toString(), {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ metadata: updatedMeta }),
      });

      if (updRes.status === 401 || updRes.status === 403) {
        return proxyToBackend(req, env);
      }
      if (!updRes.ok) {
        return json(
          { error: "Failed to flag comment" },
          { status: 500 }
        );
      }

      return json({ success: true });
    } catch {
      return proxyToBackend(req, env);
    }
  }
);

router.get("/api/themes/categories", async (_req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({
      categories: [],
      total: 0,
      source: "supabase-not-configured",
    });
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/theme_categories`);
    url.searchParams.set(
      "select",
      "key,label,icon,is_active,sort_order",
    );
    url.searchParams.set("is_active", "eq.true");
    url.searchParams.set("order", "sort_order.asc,label.asc");

    const res = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return json(
        { categories: [], total: 0, source: "supabase-error" },
        { status: 500 },
      );
    }

    const rows = (await res.json().catch(() => [])) as any[];
    const categories = Array.isArray(rows)
      ? rows
          .filter((row) => row && row.key)
          .map((row) => ({
            key: String(row.key),
            label: String(row.label || row.key),
            icon: row.icon ? String(row.icon) : null,
            sortOrder:
              row.sort_order != null ? Number(row.sort_order) : 0,
          }))
      : [];

    return json({
      categories,
      total: categories.length,
      source: "supabase",
    });
  } catch {
    return json(
      { categories: [], total: 0, source: "supabase-error" },
      { status: 500 },
    );
  }
});

router.get("/api/trending-stories", async (_req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({ posts: [] });
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    };

    // Fetch top posts by page views from analytics
    const analyticsUrl = new URL(`${baseUrl}/rest/v1/analytics`);
    analyticsUrl.searchParams.set(
      "select",
      "post_id,page_views,average_read_time,updated_at"
    );
    analyticsUrl.searchParams.set("order", "page_views.desc");
    analyticsUrl.searchParams.set("limit", "50");

    const aRes = await fetch(analyticsUrl.toString(), { headers });
    let analyticsRows: any[] = [];
    if (aRes.ok) {
      const parsed = (await aRes.json().catch(() => [])) as any[];
      if (Array.isArray(parsed)) analyticsRows = parsed;
    }

    const postIds = Array.from(
      new Set(
        analyticsRows
          .map((row) => Number(row.post_id ?? row.postId))
          .filter((id) => Number.isFinite(id) && id > 0)
      )
    );

    if (postIds.length === 0) {
      return json({ posts: [] });
    }

    const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
    postsUrl.searchParams.set(
      "select",
      "id,title,slug,excerpt,content,created_at,theme_category,reading_time_minutes,baseline_likes,likes_count,metadata,is_secret"
    );
    postsUrl.searchParams.set("id", `in.(${postIds.join(",")})`);

    const pRes = await fetch(postsUrl.toString(), { headers });
    if (!pRes.ok) {
      return json({ posts: [] });
    }

    const postRows = (await pRes.json().catch(() => [])) as any[];
    if (!Array.isArray(postRows) || postRows.length === 0) {
      return json({ posts: [] });
    }

    const analyticsMap = new Map<number, any>();
    for (const row of analyticsRows) {
      const pid = Number(row.post_id ?? row.postId);
      if (!Number.isFinite(pid)) continue;
      if (!analyticsMap.has(pid)) {
        analyticsMap.set(pid, row);
      }
    }

    type TrendingEntry = { score: number; item: any };
    const scored: TrendingEntry[] = [];

    for (const row of postRows) {
      const localId = Number(row.id);
      if (!Number.isFinite(localId)) continue;
      if (row.is_secret) continue;

      const metadata =
        row.metadata && typeof row.metadata === "object" ? row.metadata : null;

      const rawTitle = row.title ?? "";
      const rawExcerpt = row.excerpt ?? "";
      const rawContent = row.content ?? "";
      const titleText = stripHtml(rawTitle) || "Untitled";
      const contentText = stripHtml(rawContent);
      const excerptTextSource = stripHtml(rawExcerpt) || contentText;
      const excerptText =
        excerptTextSource.length > 180
          ? `${excerptTextSource.slice(0, 180)}...`
          : excerptTextSource;

      const readingTimeMinutes =
        row.reading_time_minutes != null
          ? Number(row.reading_time_minutes)
          : Math.max(
              1,
              Math.ceil(
                contentText
                  .split(/\s+/)
                  .filter((w: string) => w.length > 0).length / 200
              )
            );

      const a = analyticsMap.get(localId) as any;
      const views = Number(
        a && (a.page_views ?? a.pageViews) != null
          ? a.page_views ?? a.pageViews
          : 0
      );
      const baselineLikes = Number(
        row.baseline_likes ?? row.baselineLikes ?? 0
      );
      const likesCount = Number(row.likes_count ?? row.likesCount ?? 0);
      const likes = baselineLikes + likesCount;
      const timeOnPageSeconds = Number(
        a && (a.average_read_time ?? a.averageReadTime) != null
          ? a.average_read_time ?? a.averageReadTime
          : readingTimeMinutes * 60
      );
      const engagementRate =
        views > 0 ? Math.max(0, Math.min(1, likes / views)) : 0;

      const themeCategory =
        row.theme_category ??
        (metadata as any)?.themeCategory ??
        null;

      const score = views * 0.7 + likes * 0.3;

      scored.push({
        score,
        item: {
          id: localId,
          slug: row.slug ?? String(localId),
          title: { rendered: titleText },
          excerpt: { rendered: excerptText },
          date: row.created_at ?? new Date().toISOString(),
          metadata: {
            themeCategory,
          },
          analytics: {
            views,
            likes,
            timeOnPage: timeOnPageSeconds,
            engagementRate,
          },
        },
      });
    }

    if (!scored.length) {
      return json({ posts: [] });
    }

    const top = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((e) => e.item);

    return json({ posts: top });
  } catch {
    return json({ posts: [] });
  }
});

router.get("/api/search", async (req: Request, env: Env) => {
  try {
    const urlObj = new URL(req.url);
    const searchParams = urlObj.searchParams;

    const q = searchParams.get("q");
    if (!q || !q.trim()) {
      return json({ error: "Search query is required" }, { status: 400 });
    }
    const searchQuery = q.trim();

    const typesParam = searchParams.get("types") || "posts";
    const contentTypes = typesParam
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const limitRaw = parseInt(searchParams.get("limit") || "20", 10);
    const resultLimit = Math.min(Math.max(limitRaw || 20, 1), 50);

    const pageRaw = parseInt(searchParams.get("page") || "1", 10);
    const pageNum = Math.max(pageRaw || 1, 1);
    const offset = (pageNum - 1) * resultLimit;

    const fromParam = searchParams.get("from");
    const categoryParam = searchParams.get("category");
    const tagsParams = searchParams.getAll("tags");

    let fromDate: Date | null = null;
    if (fromParam && fromParam.trim()) {
      const days = parseInt(fromParam, 10);
      if (!isNaN(days) && days > 0) {
        fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      } else {
        const d = new Date(fromParam);
        if (!isNaN(d.getTime())) fromDate = d;
      }
    }

    let tagFilters: string[] = [];
    if (tagsParams && tagsParams.length) {
      tagFilters = tagsParams
        .flatMap((t) => String(t).split(","))
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
    }

    const cacheKey = makeSearchCacheKey({
      q: searchQuery,
      types: contentTypes,
      limit: resultLimit,
      page: pageNum,
      from: fromDate ? fromDate.toISOString() : null,
      category: categoryParam || null,
      tags: tagFilters,
    });

    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL_MS) {
      return json(cached.data);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      const payload = {
        results: [],
        meta: {
          query: searchQuery,
          total: 0,
          page: pageNum,
          pages: 1,
          limit: resultLimit,
          types: contentTypes,
          from: fromDate ? fromDate.toISOString() : null,
          category: categoryParam || null,
          tags: tagFilters,
          didYouMean: null,
        },
      };
      searchCache.set(cacheKey, { ts: Date.now(), data: payload });
      return json(payload);
    }

    let results: any[] = [];

    if (contentTypes.includes("posts") || !contentTypes.length) {
      const allPosts = await fetchSupabasePosts(env);
      if (allPosts.length) {
        const qLower = searchQuery.toLowerCase();
        const categoryNormalized = categoryParam
          ? categoryParam.trim().toLowerCase()
          : "";

        const filtered = allPosts.filter((post) => {
          if (post.isSecret) return false;

          if (categoryNormalized) {
            const meta =
              post.metadata && typeof post.metadata === "object"
                ? post.metadata
                : {};
            const theme = String(
              post.themeCategory || (meta as any).themeCategory || ""
            ).toLowerCase();
            if (theme !== categoryNormalized) return false;
          }

          if (fromDate) {
            const created = new Date(post.createdAt || 0);
            if (isNaN(created.getTime()) || created < fromDate) {
              return false;
            }
          }

          const titleText = stripHtml(post.title || "");
          const excerptText = stripHtml(post.excerpt || "");
          const contentText = stripHtml(post.content || "");
          const haystack = `${titleText} ${excerptText} ${contentText}`.toLowerCase();
          return haystack.includes(qLower);
        });

        const totalMatches = filtered.length;
        const paged =
          offset < totalMatches
            ? filtered.slice(offset, offset + resultLimit)
            : [];

        results = paged.map((post: any) => {
          const plainContent = stripHtml(post.content || "");
          const baseExcerpt =
            stripHtml(post.excerpt || "") ||
            (plainContent.length > 160
              ? `${plainContent.slice(0, 160)}...`
              : plainContent);

          let matches: { text: string; context: string }[] = [];
          const idx = plainContent.toLowerCase().indexOf(qLower);
          if (idx >= 0) {
            const start = Math.max(0, idx - 60);
            const end = Math.min(
              plainContent.length,
              idx + searchQuery.length + 60
            );
            const context = plainContent.slice(start, end).trim();
            matches = [{ text: searchQuery, context }];
          }

          return {
            id: Number(post.id),
            title: post.title,
            excerpt: baseExcerpt,
            type: "post",
            url: `/reader/${post.slug || post.id}`,
            matches,
            createdAt: post.createdAt,
          };
        });

        const totalPages = Math.max(
          Math.ceil(totalMatches / resultLimit),
          1
        );
        const payload = {
          results,
          meta: {
            query: searchQuery,
            total: totalMatches,
            page: pageNum,
            pages: totalPages,
            limit: resultLimit,
            types: contentTypes,
            from: fromDate ? fromDate.toISOString() : null,
            category: categoryParam || null,
            tags: tagFilters,
            didYouMean: null,
          },
        };

        recordTrendingQuery(searchQuery);
        searchCache.set(cacheKey, { ts: Date.now(), data: payload });
        return json(payload);
      }
    }

    const payload = {
      results,
      meta: {
        query: searchQuery,
        total: 0,
        page: pageNum,
        pages: 1,
        limit: resultLimit,
        types: contentTypes,
        from: fromDate ? fromDate.toISOString() : null,
        category: categoryParam || null,
        tags: tagFilters,
        didYouMean: null,
      },
    };
    recordTrendingQuery(searchQuery);
    searchCache.set(cacheKey, { ts: Date.now(), data: payload });
    return json(payload);
  } catch {
    return json(
      { error: "An error occurred during search", results: [] },
      { status: 500 }
    );
  }
});

router.get("/api/search/suggest", async (req: Request, env: Env) => {
  try {
    const urlObj = new URL(req.url);
    const searchParams = urlObj.searchParams;
    const q = searchParams.get("q");
    const limitRaw = parseInt(searchParams.get("limit") || "10", 10);
    const max = Math.min(Math.max(limitRaw || 10, 1), 20);

    if (!q || q.trim().length < 2) {
      const sorted = Array.from(trendingQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, max)
        .map(([term]) => ({
          id: term,
          title: term,
          type: "query",
          url: `/search?q=${encodeURIComponent(term)}`,
        }));
      return json({ suggestions: sorted });
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json({ suggestions: [] });
    }

    const searchTerm = q.trim().toLowerCase();
    const allPosts = await fetchSupabasePosts(env);
    if (!allPosts.length) {
      return json({ suggestions: [] });
    }

    const titleMatches: any[] = [];
    const contentMatches: any[] = [];

    for (const post of allPosts) {
      if (post.isSecret) continue;
      const titleText = stripHtml(post.title || "");
      const contentText = stripHtml(post.content || "");

      const titleIncludes = titleText.toLowerCase().includes(searchTerm);
      const contentIncludes = contentText.toLowerCase().includes(searchTerm);

      if (titleIncludes) {
        titleMatches.push(post);
      } else if (contentIncludes) {
        contentMatches.push(post);
      }
    }

    const combined = [...titleMatches, ...contentMatches].slice(0, max);
    const suggestions = combined.map((post: any) => ({
      id: Number(post.id),
      title: post.title || "Untitled",
      type: "post",
      url: `/reader/${post.slug || post.id}`,
    }));

    return json({ suggestions });
  } catch {
    return json({ suggestions: [] }, { status: 500 });
  }
});

/**
 * FEEDBACK ADMIN & AI ROUTES (Supabase-backed, JWT-based; fallback to legacy Express)
 */

type FeedbackCategory =
  | "bug"
  | "feature"
  | "praise"
  | "complaint"
  | "question"
  | "general";

interface WorkerUserFeedback {
  id: number;
  type: string;
  content: string;
  page?: string | null;
  status: string;
  browser?: string | null;
  operatingSystem?: string | null;
  screenResolution?: string | null;
  userAgent?: string | null;
  category?: string | null;
  metadata?: any;
}

interface WorkerResponseSuggestion {
  suggestion: string;
  confidence: number;
  category: FeedbackCategory;
  tags?: string[];
  template?: string;
  isAutomated: boolean;
}

// Keywords and templates copied from server/utils/feedback-ai.ts
const feedbackCategoryKeywords: Record<FeedbackCategory, string[]> = {
  bug: [
    "broken",
    "error",
    "issue",
    "problem",
    "not working",
    "crash",
    "fail",
    "bug",
    "glitch",
    "incorrect",
    "doesn't work",
    "doesn't load",
    "stuck",
    "freezes",
  ],
  feature: [
    "add",
    "feature",
    "suggestion",
    "improvement",
    "enhance",
    "upgrade",
    "implement",
    "could you",
    "would be nice",
    "wish",
    "hope",
    "consider",
    "should have",
  ],
  praise: [
    "love",
    "great",
    "amazing",
    "excellent",
    "awesome",
    "fantastic",
    "good job",
    "well done",
    "impressive",
    "wonderful",
    "brilliant",
    "thank you",
    "thanks",
  ],
  complaint: [
    "disappointed",
    "unhappy",
    "frustrating",
    "annoying",
    "difficult",
    "hard to",
    "terrible",
    "awful",
    "bad",
    "poor",
    "worst",
    "waste",
    "useless",
    "horrible",
  ],
  question: [
    "how do i",
    "how can i",
    "is there a way",
    "can you",
    "possible to",
    "wondering if",
    "help with",
    "how to",
    "where is",
    "what is",
    "when will",
  ],
  general: [],
};

const feedbackResponseTemplates: Record<FeedbackCategory, string[]> = {
  bug: [
    "Thank you for reporting this issue. Our development team is investigating the problem and will work to resolve it as soon as possible.",
    "We appreciate you bringing this bug to our attention. Our team is looking into it and will provide an update once it's fixed.",
    "Thank you for your bug report. We've logged this issue and assigned it to our development team for resolution.",
  ],
  feature: [
    "Thank you for your feature suggestion. We're always looking for ways to improve our platform and will consider this for a future update.",
    "We appreciate your feedback! Your feature request has been added to our product roadmap for consideration.",
    "Thanks for the suggestion. We're evaluating this feature request and will update you if we decide to implement it.",
  ],
  praise: [
    "Thank you for your kind words! We're delighted to hear you're enjoying our platform.",
    "We appreciate your positive feedback! It's great to know our work is making a difference for you.",
    "Thank you for taking the time to share your positive experience. Your feedback motivates our team to continue improving.",
  ],
  complaint: [
    "We're sorry to hear about your experience. We take your feedback seriously and will work to address these concerns.",
    "Thank you for bringing this to our attention. We apologize for the inconvenience and are working to improve this aspect of our service.",
    "We appreciate your honest feedback. Our team is reviewing your concerns to make necessary improvements.",
  ],
  question: [
    "Thank you for your question. Our support team will reach out shortly with more information to help you.",
    "We've received your inquiry and will provide you with a detailed response as soon as possible.",
    "Thanks for reaching out. We're preparing an answer to your question and will respond shortly.",
  ],
  general: [
    "Thank you for your feedback. We appreciate you taking the time to share your thoughts with us.",
    "We value your input and will use it to continue improving our services.",
    "Thank you for sharing your feedback. It helps us understand how we can better serve our users.",
  ],
};

function categorizeFeedbackForWorker(
  feedback: WorkerUserFeedback
): FeedbackCategory {
  if (
    feedback.type &&
    ["bug", "feature", "praise", "complaint", "question", "general"].includes(
      feedback.type
    )
  ) {
    return feedback.type as FeedbackCategory;
  }

  const content = feedback.content.toLowerCase();
  const scores: Record<FeedbackCategory, number> = {
    bug: 0,
    feature: 0,
    praise: 0,
    complaint: 0,
    question: 0,
    general: 1, // default base
  };

  (Object.keys(feedbackCategoryKeywords) as FeedbackCategory[]).forEach(
    (category) => {
      for (const keyword of feedbackCategoryKeywords[category]) {
        if (content.includes(keyword)) {
          scores[category] += 1;
        }
      }
    }
  );

  if (content.includes("?")) {
    scores.question += 2;
  }

  let best: FeedbackCategory = "general";
  let bestScore = 0;
  (Object.entries(scores) as [FeedbackCategory, number][]).forEach(
    ([cat, score]) => {
      if (score > bestScore) {
        bestScore = score;
        best = cat;
      }
    }
  );

  return best;
}

function generateFeedbackTags(
  feedback: WorkerUserFeedback,
  category: FeedbackCategory
): string[] {
  const tags: string[] = [category];
  const content = feedback.content.toLowerCase();

  if (feedback.page && feedback.page !== "unknown") {
    tags.push(`page:${String(feedback.page).replace(/^\//, "")}`);
  }

  if (feedback.browser && feedback.browser !== "unknown") {
    tags.push(`browser:${feedback.browser.toLowerCase().split(" ")[0]}`);
  }

  if (feedback.operatingSystem && feedback.operatingSystem !== "unknown") {
    tags.push(
      `os:${feedback.operatingSystem.toLowerCase().split(" ")[0]}`
    );
  }

  const urgentKeywords = ["urgent", "critical", "immediately", "serious", "emergency"];
  if (urgentKeywords.some((kw) => content.includes(kw))) {
    tags.push("priority");
  }

  return tags;
}

function generateWorkerResponseSuggestion(
  feedback: WorkerUserFeedback
): WorkerResponseSuggestion {
  try {
    const category = categorizeFeedbackForWorker(feedback);
    const templates = feedbackResponseTemplates[category] || feedbackResponseTemplates.general;
    const template =
      templates[Math.floor(Math.random() * templates.length)] ||
      feedbackResponseTemplates.general[0];

    const contentLengthFactor = Math.min(
      feedback.content.length / 1000,
      0.4
    );
    const hasMetadataFactor =
      feedback.metadata && Object.keys(feedback.metadata).length > 0 ? 0.1 : 0;
    const categoryMatchFactor =
      feedback.type === category ? 0.2 : 0;

    const confidenceBase = 0.3;
    const confidence =
      confidenceBase +
      contentLengthFactor +
      hasMetadataFactor +
      categoryMatchFactor;

    const tags = generateFeedbackTags(feedback, category);

    return {
      suggestion: template,
      confidence: parseFloat(Math.max(0.1, Math.min(0.95, confidence)).toFixed(2)),
      category,
      tags,
      template,
      isAutomated: true,
    };
  } catch {
    return {
      suggestion:
        "Thank you for your feedback. Our team will review it and respond if necessary.",
      confidence: 0.1,
      category: "general",
      isAutomated: true,
    };
  }
}

function getWorkerResponseHints(
  feedback: WorkerUserFeedback
): string[] {
  const category = categorizeFeedbackForWorker(feedback);
  const hints: string[] = [];

  switch (category) {
    case "bug":
      hints.push("Acknowledge the specific issue mentioned.");
      hints.push("Provide an estimated timeline for resolution if possible.");
      hints.push(
        "Ask for additional details if needed (browser version, steps to reproduce)."
      );
      break;
    case "feature":
      hints.push(
        "Thank them for the suggestion and explain if it fits the product roadmap."
      );
      hints.push("Consider asking for more details about their use case.");
      hints.push("Be honest about implementation likelihood.");
      break;
    case "praise":
      hints.push(
        "Express genuine appreciation for their positive feedback."
      );
      hints.push("Share the feedback with the relevant team members.");
      hints.push("Consider asking what other features they enjoy.");
      break;
    case "complaint":
      hints.push(
        "Acknowledge their frustration without making excuses."
      );
      hints.push("Provide a clear solution or next steps.");
      hints.push(
        "Follow up to ensure they are satisfied with the resolution."
      );
      break;
    case "question":
      hints.push("Provide a clear, direct answer to their question.");
      hints.push("Include links to relevant documentation if available.");
      hints.push("Ask if your answer addressed their concern.");
      break;
    default:
      hints.push("Thank them for their feedback.");
      hints.push(
        "Ask if there is anything specific they would like to see improved."
      );
      hints.push("Maintain a friendly, appreciative tone.");
  }

  return hints;
}

function normalizeFeedbackMetadata(row: any): any {
  let meta = row && typeof row.metadata === "object" && row.metadata !== null
    ? (row.metadata as any)
    : {};

  try {
    if (typeof row.metadata === "string") {
      meta = JSON.parse(row.metadata);
    }
  } catch {
    // ignore bad JSON, keep meta as {}
  }

  if (!meta || typeof meta !== "object") {
    meta = {};
  }

  const result: any = { ...meta };

  const browserName =
    (meta.browser && typeof meta.browser === "object" && meta.browser.name) ||
    meta.browserName ||
    meta.browser ||
    row.browser ||
    row.browser_name ||
    "unknown";

  const browserVersion =
    (meta.browser && typeof meta.browser === "object" && meta.browser.version) ||
    meta.browserVersion ||
    "";

  const userAgent =
    (meta.browser && typeof meta.browser === "object" && meta.browser.userAgent) ||
    meta.userAgent ||
    row.userAgent ||
    row.user_agent ||
    "";

  if (!result.browser || typeof result.browser !== "object") {
    result.browser = {
      name: String(browserName || "unknown"),
      version: String(browserVersion || ""),
      userAgent: String(userAgent || ""),
    };
  } else {
    result.browser = {
      name: String(
        (result.browser.name ||
          result.browser.browserName ||
          browserName ||
          "unknown") as string
      ),
      version: String((result.browser.version || browserVersion || "") as string),
      userAgent: String(
        (result.browser.userAgent || userAgent || "") as string
      ),
    };
  }

  const osName =
    (meta.os && typeof meta.os === "object" && meta.os.name) ||
    meta.osName ||
    meta.operatingSystem ||
    row.operatingSystem ||
    row.operating_system ||
    "unknown";

  const osVersion =
    (meta.os && typeof meta.os === "object" && meta.os.version) ||
    meta.osVersion ||
    "";

  if (!result.os || typeof result.os !== "object") {
    result.os = {
      name: String(osName || "unknown"),
      version: String(osVersion || ""),
    };
  } else {
    result.os = {
      name: String(
        (result.os.name ||
          result.os.osName ||
          result.os.operatingSystem ||
          osName ||
          "unknown") as string
      ),
      version: String((result.os.version || osVersion || "") as string),
    };
  }

  const rawScreen =
    meta.screen ||
    meta.screenResolution ||
    row.screenResolution ||
    row.screen_resolution ||
    null;

  if (!result.screen || typeof result.screen !== "object") {
    let width = 0;
    let height = 0;
    if (typeof rawScreen === "object" && rawScreen) {
      width = Number(rawScreen.width ?? 0);
      height = Number(rawScreen.height ?? 0);
    } else if (typeof rawScreen === "string") {
      const m = rawScreen.match(/(\d+)\s*x\s*(\d+)/i);
      if (m) {
        width = parseInt(m[1], 10);
        height = parseInt(m[2], 10);
      }
    }

    if (width > 0 && height > 0) {
      result.screen = { width, height };
    }
  }

  const path =
    (meta.location && meta.location.path) ||
    meta.path ||
    row.page ||
    row.location_path ||
    "";

  const referrer =
    (meta.location && meta.location.referrer) ||
    meta.referrer ||
    "";

  if (!result.location || typeof result.location !== "object") {
    result.location = {
      path: String(path || ""),
      ...(referrer ? { referrer: String(referrer) } : {}),
    };
  } else {
    result.location = {
      path: String(
        (result.location.path || path || "") as string
      ),
      ...(result.location.referrer || referrer
        ? {
            referrer: String(
              (result.location.referrer || referrer || "") as string
            ),
          }
        : {}),
    };
  }

  const rawAdminResponse = meta.adminResponse;
  const rawRespondedAt = meta.respondedAt;
  const rawRespondedBy = meta.respondedBy;

  if (rawAdminResponse) {
    if (typeof rawAdminResponse === "string") {
      result.adminResponse = {
        content: rawAdminResponse,
        respondedAt: String(
          rawRespondedAt || new Date().toISOString()
        ),
        respondedBy: String(rawRespondedBy || "Admin"),
      };
    } else if (typeof rawAdminResponse === "object") {
      result.adminResponse = {
        content: String(
          rawAdminResponse.content || ""
        ),
        respondedAt: String(
          rawAdminResponse.respondedAt ||
            rawRespondedAt ||
            new Date().toISOString()
        ),
        respondedBy: String(
          rawAdminResponse.respondedBy || rawRespondedBy || "Admin"
        ),
      };
    }
  }

  return result;
}

function mapFeedbackRowToApiItem(row: any): any {
  const metadata = normalizeFeedbackMetadata(row);

  const subject =
    (metadata.subject && String(metadata.subject)) ||
    (row.category && String(row.category)) ||
    (row.type && String(row.type)) ||
    "Feedback";

  const email =
    (metadata.email && String(metadata.email)) ||
    (typeof row.email === "string" ? row.email : null) ||
    null;

  const contactRequested =
    typeof metadata.contactRequested === "boolean"
      ? metadata.contactRequested
      : Boolean(
          metadata.contact_me ||
            metadata.allowContact ||
            metadata.contactRequested
        );

  const priority =
    (metadata.priority && String(metadata.priority)) || "medium";

  return {
    id: Number(row.id),
    userId:
      row.user_id != null && Number.isFinite(Number(row.user_id))
        ? Number(row.user_id)
        : null,
    email,
    subject,
    content: String(row.content || ""),
    type: String(row.type || "general"),
    status: String(row.status || "pending"),
    priority,
    contactRequested,
    createdAt: row.created_at || new Date().toISOString(),
    metadata,
  };
}

async function fetchFeedbackRowById(
  env: Env,
  id: number,
  headers: Record<string, string>
): Promise<any | null> {
  const baseUrl = env.SUPABASE_URL!.replace(/\/+$/, "");
  const url = new URL(`${baseUrl}/rest/v1/user_feedback`);
  url.searchParams.set(
    "select",
    "id,type,content,page,status,user_id,browser,operating_system,screen_resolution,user_agent,category,metadata,created_at"
  );
  url.searchParams.set("id", `eq.${id}`);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    return null;
  }
  const rows = (await res.json().catch(() => [])) as any[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }
  return rows[0];
}

function buildFeedbackSuggestionsPayload(
  row: any
): {
  responseSuggestion: WorkerResponseSuggestion;
  alternativeSuggestions: WorkerResponseSuggestion[];
  responseHints: string[];
} {
  const feedback: WorkerUserFeedback = {
    id: Number(row.id),
    type: String(row.type || "general"),
    content: String(row.content || ""),
    page: row.page ?? null,
    status: String(row.status || "pending"),
    browser: row.browser ?? null,
    operatingSystem: row.operating_system ?? null,
    screenResolution: row.screen_resolution ?? null,
    userAgent: row.user_agent ?? null,
    category: row.category ?? null,
    metadata: normalizeFeedbackMetadata(row),
  };

  const primary = generateWorkerResponseSuggestion(feedback);
  const hints = getWorkerResponseHints(feedback);

  const templates =
    feedbackResponseTemplates[primary.category] ||
    feedbackResponseTemplates.general;

  const used = new Set<string>();
  if (primary.template) {
    used.add(primary.template);
  } else {
    used.add(primary.suggestion);
  }

  const alternatives: WorkerResponseSuggestion[] = [];
  for (const tpl of templates) {
    if (alternatives.length >= 2) break;
    if (used.has(tpl)) continue;
    alternatives.push({
      suggestion: tpl,
      confidence: Math.max(
        0.5,
        primary.confidence - 0.05 * (alternatives.length + 1)
      ),
      category: primary.category,
      tags: primary.tags,
      template: tpl,
      isAutomated: true,
    });
    used.add(tpl);
  }

  return {
    responseSuggestion: primary,
    alternativeSuggestions: alternatives,
    responseHints: hints,
  };
}

// GET /api/feedback - admin list with Supabase JWT, fallback to legacy Express for cookie-based admin
router.get("/api/feedback", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  const token = getBearerToken(req);
  if (!token) {
    // Legacy cookie/session-based admin
    return proxyToBackend(req, env);
  }

  const currentUser = await getSupabaseCurrentUser(env, token);
  if (!currentUser || !currentUser.isAdmin) {
    return json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const urlObj = new URL(req.url);
    const search = urlObj.searchParams;
    const statusParam = (search.get("status") || "all").trim().toLowerCase();
    const typeParam = (search.get("type") || "").trim().toLowerCase();
    const pageRaw = parseInt(search.get("page") || "1", 10);
    const limitRaw = parseInt(search.get("limit") || "50", 10);

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit = Math.max(1, Math.min(Number.isFinite(limitRaw) ? limitRaw : 50, 200));
    const offset = (page - 1) * limit;

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      Prefer: "count=exact",
    };

    const listUrl = new URL(`${baseUrl}/rest/v1/user_feedback`);
    listUrl.searchParams.set(
      "select",
      "id,type,content,page,status,user_id,browser,operating_system,screen_resolution,user_agent,category,metadata,created_at"
    );
    listUrl.searchParams.set("order", "created_at.desc");
    listUrl.searchParams.set("limit", String(limit));
    listUrl.searchParams.set("offset", String(offset));

    if (statusParam && statusParam !== "all") {
      listUrl.searchParams.set("status", `eq.${statusParam}`);
    }
    if (typeParam) {
      listUrl.searchParams.set("type", `eq.${typeParam}`);
    }

    const res = await fetch(listUrl.toString(), { headers });
    if (!res.ok) {
      return json({ error: "Failed to list feedback" }, { status: 500 });
    }

    const rows = (await res.json().catch(() => [])) as any[];
    const contentRange = res.headers.get("Content-Range") || "";
    let total = rows.length;
    const parts = contentRange.split("/");
    if (parts.length === 2) {
      const totalStr = parts[1];
      const n = parseInt(totalStr, 10);
      if (Number.isFinite(n)) total = n;
    }

    const feedback = rows.map(mapFeedbackRowToApiItem);
    const hasMore = offset + rows.length < total;

    return json({ feedback, total, page, hasMore });
  } catch {
    return json({ error: "Failed to list feedback" }, { status: 500 });
  }
});

// GET /api/feedback/:id - admin detail + AI suggestions
router.get("/api/feedback/:id", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  const token = getBearerToken(req);
  if (!token) {
    return proxyToBackend(req, env);
  }

  const currentUser = await getSupabaseCurrentUser(env, token);
  if (!currentUser || !currentUser.isAdmin) {
    return json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const urlObj = new URL(req.url);
    const segments = urlObj.pathname.split("/");
    const idSegment = segments[segments.length - 1] || "";
    const id = parseInt(decodeURIComponent(idSegment), 10);
    if (!Number.isFinite(id) || id <= 0) {
      return json({ error: "Invalid id" }, { status: 400 });
    }

    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      Prefer: "count=exact",
    };

    const row = await fetchFeedbackRowById(env, id, headers);
    if (!row) {
      return json({ error: "Feedback not found" }, { status: 404 });
    }

    const feedback = mapFeedbackRowToApiItem(row);
    const suggestions = buildFeedbackSuggestionsPayload(row);

    return json({
      feedback,
      responseSuggestion: suggestions.responseSuggestion,
      alternativeSuggestions: suggestions.alternativeSuggestions,
      responseHints: suggestions.responseHints,
    });
  } catch {
    return json({ error: "Failed to fetch feedback item" }, { status: 500 });
  }
});

// PATCH /api/feedback/:id/status - admin status update
router.patch(
  "/api/feedback/:id/status",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    const token = getBearerToken(req);
    if (!token) {
      return proxyToBackend(req, env);
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json({ error: "Admin access required" }, { status: 403 });
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment = segments[segments.length - 2] || "";
      const id = parseInt(decodeURIComponent(idSegment), 10);
      if (!Number.isFinite(id) || id <= 0) {
        return json({ error: "Invalid id" }, { status: 400 });
      }

      const body = (await (req as any).json?.().catch(() => ({}))) || {};
      const status =
        typeof body.status === "string" && body.status.trim()
          ? body.status.trim()
          : null;
      if (!status) {
        return json({ error: "Status is required" }, { status: 400 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        Prefer: "return=representation",
      };

      const updateUrl = new URL(`${baseUrl}/rest/v1/user_feedback`);
      updateUrl.searchParams.set("id", `eq.${id}`);

      const res = await fetch(updateUrl.toString(), {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        return json(
          { error: "Failed to update feedback status" },
          { status: 500 }
        );
      }

      const rows = (await res.json().catch(() => [])) as any[];
      const row = Array.isArray(rows) && rows.length ? rows[0] : null;
      if (!row) {
        return json(
          { error: "Feedback not found after update" },
          { status: 404 }
        );
      }

      const feedback = mapFeedbackRowToApiItem(row);
      return json({ success: true, feedback });
    } catch {
      return json(
        { error: "Failed to update feedback status" },
        { status: 500 }
      );
    }
  }
);

// POST /api/feedback/:id/respond - admin response stored in metadata.adminResponse
router.post(
  "/api/feedback/:id/respond",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    const token = getBearerToken(req);
    if (!token) {
      return proxyToBackend(req, env);
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json({ error: "Admin access required" }, { status: 403 });
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment = segments[segments.length - 2] || "";
      const id = parseInt(decodeURIComponent(idSegment), 10);
      if (!Number.isFinite(id) || id <= 0) {
        return json({ error: "Invalid id" }, { status: 400 });
      }

      const body = (await (req as any).json?.().catch(() => ({}))) || {};
      const responseText =
        typeof body.response === "string" && body.response.trim()
          ? body.response.trim()
          : null;
      if (!responseText) {
        return json({ error: "Response is required" }, { status: 400 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

      const readHeaders: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
        Prefer: "count=exact",
      };

      const existing = await fetchFeedbackRowById(env, id, readHeaders);
      if (!existing) {
        return json({ error: "Feedback not found" }, { status: 404 });
      }

      let meta = normalizeFeedbackMetadata(existing);
      const respondedAt = new Date().toISOString();
      const respondedBy =
        currentUser.fullName ||
        currentUser.username ||
        currentUser.email ||
        `admin:${currentUser.id}`;

      meta = {
        ...meta,
        adminResponse: {
          content: responseText,
          respondedAt,
          respondedBy,
        },
        responderId: currentUser.id,
        respondedAt,
      };

      const status =
        existing.status === "pending" ? "reviewed" : existing.status;

      const updateUrl = new URL(`${baseUrl}/rest/v1/user_feedback`);
      updateUrl.searchParams.set("id", `eq.${id}`);

      const writeHeaders: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        Prefer: "return=representation",
      };

      const res = await fetch(updateUrl.toString(), {
        method: "PATCH",
        headers: writeHeaders,
        body: JSON.stringify({ metadata: meta, status }),
      });

      if (!res.ok) {
        return json(
          { error: "Failed to store admin response" },
          { status: 500 }
        );
      }

      const rows = (await res.json().catch(() => [])) as any[];
      const row = Array.isArray(rows) && rows.length ? rows[0] : null;
      if (!row) {
        return json(
          { error: "Feedback not found after update" },
          { status: 404 }
        );
      }

      const feedback = mapFeedbackRowToApiItem(row);
      return json({ success: true, feedback });
    } catch {
      return json(
        { error: "Failed to store admin response" },
        { status: 500 }
      );
    }
  }
);

// GET /api/feedback/:id/suggestions - AI suggestions only
router.get(
  "/api/feedback/:id/suggestions",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    const token = getBearerToken(req);
    if (!token) {
      return proxyToBackend(req, env);
    }

    const currentUser = await getSupabaseCurrentUser(env, token);
    if (!currentUser || !currentUser.isAdmin) {
      return json({ error: "Admin access required" }, { status: 403 });
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split("/");
      const idSegment = segments[segments.length - 2] || "";
      const id = parseInt(decodeURIComponent(idSegment), 10);
      if (!Number.isFinite(id) || id <= 0) {
        return json({ error: "Invalid id" }, { status: 400 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
        Prefer: "count=exact",
      };

      const row = await fetchFeedbackRowById(env, id, headers);
      if (!row) {
        return json({ error: "Feedback not found" }, { status: 404 });
      }

      const suggestions = buildFeedbackSuggestionsPayload(row);
      return json({
        responseSuggestion: suggestions.responseSuggestion,
        alternativeSuggestions: suggestions.alternativeSuggestions,
      });
    } catch {
      return json(
        { error: "Failed to generate suggestions" },
        { status: 500 }
      );
    }
  }
);

// USER NOTIFICATIONS: Supabase-backed, with legacy fallback

// User notification preferences (Supabase-backed) - replaces Express /api/user/notification-preferences
router.get("/api/user/notification-preferences", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = await getSupabaseUserIdFromJwt(env, token);
  if (!Number.isFinite(userId || NaN)) {
    return json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const listUrl = new URL(`${baseUrl}/rest/v1/user_notification_preferences`);
    listUrl.searchParams.set(
      "select",
      "user_id,story_updates,community_activity,security_alerts,reading_reminders,recommendations,preferred_time,timezone,updated_at",
    );
    listUrl.searchParams.set("user_id", `eq.${userId}`);
    listUrl.searchParams.set("limit", "1");

    const res = await fetch(listUrl.toString(), { headers });
    if (!res.ok) {
      return json(
        { error: "Failed to load notification preferences" },
        { status: 500 },
      );
    }

    const rows = (await res.json().catch(() => [])) as any[];
    let row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!row) {
      const defaults = {
        user_id: Number(userId),
        story_updates: true,
        community_activity: true,
        security_alerts: true,
        reading_reminders: false,
        recommendations: true,
        preferred_time: "evening",
        timezone: "pst",
      };

      const insertRes = await fetch(
        `${baseUrl}/rest/v1/user_notification_preferences`,
        {
          method: "POST",
          headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(defaults),
        },
      );

      if (!insertRes.ok) {
        return json(
          { error: "Failed to create notification preferences" },
          { status: 500 },
        );
      }

      const inserted = (await insertRes.json().catch(() => [])) as any[];
      row =
        Array.isArray(inserted) && inserted.length > 0
          ? inserted[0]
          : defaults;
    }

    const payload = {
      storyUpdates: row.story_updates !== false,
      communityActivity: row.community_activity !== false,
      securityAlerts: row.security_alerts !== false,
      readingReminders: row.reading_reminders === true,
      recommendations: row.recommendations !== false,
      preferredTime: row.preferred_time || "evening",
      timezone: row.timezone || "pst",
    };

    return json(payload);
  } catch {
    return json(
      { error: "Failed to load notification preferences" },
      { status: 500 },
    );
  }
});

router.patch(
  "/api/user/notification-preferences",
  async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json(
        { error: "Supabase not configured" },
        { status: 500 },
      );
    }

    const token = getBearerToken(req);
    if (!token) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = await getSupabaseUserIdFromJwt(env, token);
    if (!Number.isFinite(userId || NaN)) {
      return json({ error: "User not authenticated" }, { status: 401 });
    }

    let body: any;
    try {
      body = (await (req as any).json?.().catch(() => ({}))) || {};
    } catch {
      return json(
        { error: "Invalid payload" },
        { status: 400 },
      );
    }

    const update: any = {};

    if (typeof body.storyUpdates === "boolean") {
      update.story_updates = body.storyUpdates;
    }
    if (typeof body.communityActivity === "boolean") {
      update.community_activity = body.communityActivity;
    }
    if (typeof body.securityAlerts === "boolean") {
      update.security_alerts = body.securityAlerts;
    }
    if (typeof body.readingReminders === "boolean") {
      update.reading_reminders = body.readingReminders;
    }
    if (typeof body.recommendations === "boolean") {
      update.recommendations = body.recommendations;
    }
    if (typeof body.preferredTime === "string") {
      update.preferred_time = body.preferredTime;
    }
    if (typeof body.timezone === "string") {
      update.timezone = body.timezone;
    }

    // Backward-compatible snake_case keys
    if (typeof body.story_updates === "boolean") {
      update.story_updates = body.story_updates;
    }
    if (typeof body.community_activity === "boolean") {
      update.community_activity = body.community_activity;
    }
    if (typeof body.reading_reminders === "boolean") {
      update.reading_reminders = body.reading_reminders;
    }

    if (Object.keys(update).length === 0) {
      return json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    try {
      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const upsertUrl = new URL(
        `${baseUrl}/rest/v1/user_notification_preferences`,
      );
      upsertUrl.searchParams.set("on_conflict", "user_id");

      const upsertRes = await fetch(upsertUrl.toString(), {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify({
          user_id: Number(userId),
          ...update,
        }),
      });

      if (!upsertRes.ok) {
        return json(
          { error: "Failed to update notification preferences" },
          { status: 500 },
        );
      }

      const rows = (await upsertRes.json().catch(() => [])) as any[];
      const row =
        Array.isArray(rows) && rows.length > 0
          ? rows[0]
          : {
              user_id: Number(userId),
              ...update,
            };

      const payload = {
        storyUpdates: row.story_updates !== false,
        communityActivity: row.community_activity !== false,
        securityAlerts: row.security_alerts !== false,
        readingReminders: row.reading_reminders === true,
        recommendations: row.recommendations !== false,
        preferredTime: row.preferred_time || "evening",
        timezone: row.timezone || "pst",
      };

      return json(payload);
    } catch {
      return json(
        { error: "Failed to update notification preferences" },
        { status: 500 },
      );
    }
  },
);

// User privacy settings (Supabase-backed) - replaces Express /api/user/privacy-settings
router.get("/api/user/privacy-settings", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({ error: "Supabase not configured" }, { status: 500 });
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = await getSupabaseUserIdFromJwt(env, token);
  if (!Number.isFinite(userId || NaN)) {
    return json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const listUrl = new URL(`${baseUrl}/rest/v1/user_privacy_settings`);
    listUrl.searchParams.set(
      "select",
      "user_id,profile_visible,share_reading_history,anonymous_commenting,two_factor_auth_enabled,login_notifications,updated_at",
    );
    listUrl.searchParams.set("user_id", `eq.${userId}`);
    listUrl.searchParams.set("limit", "1");

    const res = await fetch(listUrl.toString(), { headers });
    if (!res.ok) {
      return json(
        { error: "Failed to load privacy settings" },
        { status: 500 },
      );
    }

    const rows = (await res.json().catch(() => [])) as any[];
    let row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!row) {
      const defaults = {
        user_id: Number(userId),
        profile_visible: true,
        share_reading_history: false,
        anonymous_commenting: false,
        two_factor_auth_enabled: false,
        login_notifications: true,
      };
      const insertRes = await fetch(
        `${baseUrl}/rest/v1/user_privacy_settings`,
        {
          method: "POST",
          headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(defaults),
        },
      );
      if (!insertRes.ok) {
        return json(
          { error: "Failed to create privacy settings" },
          { status: 500 },
        );
      }
      const inserted = (await insertRes.json().catch(() => [])) as any[];
      row =
        Array.isArray(inserted) && inserted.length > 0
          ? inserted[0]
          : defaults;
    }

    const payload = {
      profileVisible: row.profile_visible === true,
      shareReadingHistory: row.share_reading_history === true,
      anonymousCommenting: row.anonymous_commenting === true,
      twoFactorAuthEnabled: row.two_factor_auth_enabled === true,
      loginNotifications: row.login_notifications !== false,
    };

    return json(payload);
  } catch {
    return json(
      { error: "Failed to load privacy settings" },
      { status: 500 },
    );
  }
});

router.patch("/api/user/privacy-settings", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({ error: "Supabase not configured" }, { status: 500 });
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = await getSupabaseUserIdFromJwt(env, token);
  if (!Number.isFinite(userId || NaN)) {
    return json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const headers: Record<string, string> = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const body = (await (req as any).json?.().catch(() => ({}))) || {};

    const allowedKeys: Record<string, string> = {
      profileVisible: "profile_visible",
      shareReadingHistory: "share_reading_history",
      anonymousCommenting: "anonymous_commenting",
      twoFactorAuthEnabled: "two_factor_auth_enabled",
      loginNotifications: "login_notifications",
    };

    const updatePayload: Record<string, any> = {};
    for (const [key, dbKey] of Object.entries(allowedKeys)) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const value = (body as any)[key];
        if (typeof value !== "boolean") {
          return json(
            { error: `Field "${key}" must be a boolean` },
            { status: 400 },
          );
        }
        updatePayload[dbKey] = value;
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return json(
        { error: "No valid fields provided" },
        { status: 400 },
      );
    }

    // First try to PATCH an existing row
    const patchUrl = new URL(`${baseUrl}/rest/v1/user_privacy_settings`);
    patchUrl.searchParams.set("user_id", `eq.${userId}`);

    let row: any | null = null;

    try {
      const patchRes = await fetch(patchUrl.toString(), {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(updatePayload),
      });

      if (!patchRes.ok && patchRes.status !== 406) {
        return json(
          { error: "Failed to update privacy settings" },
          { status: 500 },
        );
      }

      const rows = (await patchRes.json().catch(() => [])) as any[];
      if (Array.isArray(rows) && rows.length > 0) {
        row = rows[0];
      }
    } catch {
      // If PATCH fails for any reason, we'll fall back to an insert below
    }

    // If no existing row was updated, insert a new one with defaults + patch
    if (!row) {
      const defaults = {
        user_id: Number(userId),
        profile_visible: true,
        share_reading_history: false,
        anonymous_commenting: false,
        two_factor_auth_enabled: false,
        login_notifications: true,
      };
      const insertBody = { ...defaults, ...updatePayload };

      const insertRes = await fetch(
        `${baseUrl}/rest/v1/user_privacy_settings`,
        {
          method: "POST",
          headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(insertBody),
        },
      );

      if (!insertRes.ok) {
        return json(
          { error: "Failed to update privacy settings" },
          { status: 500 },
        );
      }

      const inserted = (await insertRes.json().catch(() => [])) as any[];
      row =
        Array.isArray(inserted) && inserted.length > 0
          ? inserted[0]
          : insertBody;
    }

    const payload = {
      profileVisible: row.profile_visible === true,
      shareReadingHistory: row.share_reading_history === true,
      anonymousCommenting: row.anonymous_commenting === true,
      twoFactorAuthEnabled: row.two_factor_auth_enabled === true,
      loginNotifications: row.login_notifications !== false,
    };

    return json(payload);
  } catch {
    return json(
      { error: "Failed to update privacy settings" },
      { status: 500 },
    );
  }
});rivacy settings (Supabase-backed) - replaces Express /api/user/privacy-settings
router.get("/api/user/privacy-settings", async (req: Request, env: Env) =&gt; {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({ error: "Supabase not configured" }, { status: 500 });
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = await getSupabaseUserIdFromJwt(env, token);
  if (!Number.isFinite(userId || NaN)) {
    return json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const headers: Record&lt;string, string&gt; = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const listUrl = new URL(`${baseUrl}/rest/v1/user_privacy_settings`);
    listUrl.searchParams.set(
      "select",
      "user_id,profile_visible,share_reading_history,anonymous_commenting,two_factor_auth_enabled,login_notifications,updated_at",
    );
    listUrl.searchParams.set("user_id", `eq.${userId}`);
    listUrl.searchParams.set("limit", "1");

    const res = await fetch(listUrl.toString(), { headers });
    if (!res.ok) {
      return json(
        { error: "Failed to load privacy settings" },
        { status: 500 },
      );
    }

    const rows = (await res.json().catch(() =&gt; [])) as any[];
    let row = Array.isArray(rows) &amp;&amp; rows.length &gt; 0 ? rows[0] : null;

    if (!row) {
      const defaults = {
        user_id: Number(userId),
        profile_visible: true,
        share_reading_history: false,
        anonymous_commenting: false,
        two_factor_auth_enabled: false,
        login_notifications: true,
      };
      const insertRes = await fetch(
        `${baseUrl}/rest/v1/user_privacy_settings`,
        {
          method: "POST",
          headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(defaults),
        },
      );
      if (!insertRes.ok) {
        return json(
          { error: "Failed to create privacy settings" },
          { status: 500 },
        );
      }
      const inserted = (await insertRes.json().catch(() =&gt; [])) as any[];
      row =
        Array.isArray(inserted) &amp;&amp; inserted.length &gt; 0
          ? inserted[0]
          : defaults;
    }

    const payload = {
      profileVisible: row.profile_visible === true,
      shareReadingHistory: row.share_reading_history === true,
      anonymousCommenting: row.anonymous_commenting === true,
      twoFactorAuthEnabled: row.two_factor_auth_enabled === true,
      loginNotifications: row.login_notifications !== false,
    };

    return json(payload);
  } catch {
    return json(
      { error: "Failed to load privacy settings" },
      { status: 500 },
    );
  }
});

router.patch("/api/user/privacy-settings", async (req: Request, env: Env) =&gt; {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({ error: "Supabase not configured" }, { status: 500 });
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = await getSupabaseUserIdFromJwt(env, token);
  if (!Number.isFinite(userId || NaN)) {
    return json({ error: "User not authenticated" }, { status: 401 });
  }

  let body: any;
  try {
    body = (await (req as any).json?.().catch(() =&gt; ({}))) || {};
  } catch {
    body = {};
  }

  const patch: Record&lt;string, any&gt; = {};

  if (Object.prototype.hasOwnProperty.call(body, "profileVisible")) {
    patch.profile_visible = !!body.profileVisible;
  }
  if (Object.prototype.hasOwnProperty.call(body, "shareReadingHistory")) {
    patch.share_reading_history = !!body.shareReadingHistory;
  }
  if (Object.prototype.hasOwnProperty.call(body, "anonymousCommenting")) {
    patch.anonymous_commenting = !!body.anonymousCommenting;
  }
  if (Object.prototype.hasOwnProperty.call(body, "twoFactorAuthEnabled")) {
    patch.two_factor_auth_enabled = !!body.twoFactorAuthEnabled;
  }
  if (Object.prototype.hasOwnProperty.call(body, "loginNotifications")) {
    patch.login_notifications = !!body.loginNotifications;
  }

  if (Object.keys(patch).length === 0) {
    return json(
      { error: "No valid fields in request" },
      { status: 400 },
    );
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const headers: Record&lt;string, string&gt; = {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Check for existing row
    const listUrl = new URL(`${baseUrl}/rest/v1/user_privacy_settings`);
    listUrl.searchParams.set(
      "select",
      "user_id,profile_visible,share_reading_history,anonymous_commenting,two_factor_auth_enabled,login_notifications,updated_at",
    );
    listUrl.searchParams.set("user_id", `eq.${userId}`);
    listUrl.searchParams.set("limit", "1");

    const res = await fetch(listUrl.toString(), { headers });
    if (!res.ok) {
      return json(
        { error: "Failed to update privacy settings" },
        { status: 500 },
      );
    }

    const rows = (await res.json().catch(() =&gt; [])) as any[];
    const existing = Array.isArray(rows) &amp;&amp; rows.length &gt; 0 ? rows[0] : null;

    let row: any;

    if (existing) {
      const updateUrl = new URL(`${baseUrl}/rest/v1/user_privacy_settings`);
      updateUrl.searchParams.set("user_id", `eq.${userId}`);

      const updateRes = await fetch(updateUrl.toString(), {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(patch),
      });

      if (!updateRes.ok) {
        return json(
          { error: "Failed to update privacy settings" },
          { status: 500 },
        );
      }

      const updatedRows = (await updateRes.json().catch(() =&gt; [])) as any[];
      row =
        Array.isArray(updatedRows) &amp;&amp; updatedRows.length &gt; 0
          ? updatedRows[0]
          : existing;
    } else {
      const defaults = {
        user_id: Number(userId),
        profile_visible: true,
        share_reading_history: false,
        anonymous_commenting: false,
        two_factor_auth_enabled: false,
        login_notifications: true,
      };
      const insertBody = { ...defaults, ...patch };

      const insertRes = await fetch(
        `${baseUrl}/rest/v1/user_privacy_settings`,
        {
          method: "POST",
          headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(insertBody),
        },
      );

      if (!insertRes.ok) {
        return json(
          { error: "Failed to save privacy settings" },
          { status: 500 },
        );
      }

      const inserted = (await insertRes.json().catch(() =&gt; [])) as any[];
      row =
        Array.isArray(inserted) &amp;&amp; inserted.length &gt; 0
          ? inserted[0]
          : insertBody;
    }

    const payload = {
      profileVisible: row.profile_visible === true,
      shareReadingHistory: row.share_reading_history === true,
      anonymousCommenting: row.anonymous_commenting === true,
      twoFactorAuthEnabled: row.two_factor_auth_enabled === true,
      loginNotifications: row.login_notifications !== false,
    };

    return json(payload);
  } catch {
    return json(
      { error: "Failed to save privacy settings" },
      { status: 500 },
    );
  }
});

// User notification preferences (Supabase-backed) - replaces Express /api/user/notification-preferences
router.get(
  "/api/user/notification-preferences",
  async (req: Request, env: Env) =&gt; {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json({ error: "Supabase not configured" }, { status: 500 });
    }

    const token = getBearerToken(req);
    if (!token) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = await getSupabaseUserIdFromJwt(env, token);
    if (!Number.isFinite(userId || NaN)) {
      return json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const serviceKey =
        env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
      const headers: Record&lt;string, string&gt; = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const listUrl = new URL(
        `${baseUrl}/rest/v1/user_notification_preferences`,
      );
      listUrl.searchParams.set(
        "select",
        "user_id,story_updates,community_activity,security_alerts,reading_reminders,recommendations,preferred_time,timezone,updated_at",
      );
      listUrl.searchParams.set("user_id", `eq.${userId}`);
      listUrl.searchParams.set("limit", "1");

      const res = await fetch(listUrl.toString(), { headers });
      if (!res.ok) {
        return json(
          { error: "Failed to load notification preferences" },
          { status: 500 },
        );
      }

      const rows = (await res.json().catch(() =&gt; [])) as any[];
      let row = Array.isArray(rows) &amp;&amp; rows.length &gt; 0 ? rows[0] : null;

      if (!row) {
        const defaults = {
          user_id: Number(userId),
          story_updates: true,
          community_activity: true,
          security_alerts: true,
          reading_reminders: false,
          recommendations: true,
          preferred_time: "evening",
          timezone: "pst",
        };
        const insertRes = await fetch(
          `${baseUrl}/rest/v1/user_notification_preferences`,
          {
            method: "POST",
            headers: { ...headers, Prefer: "return=representation" },
            body: JSON.stringify(defaults),
          },
        );
        if (!insertRes.ok) {
          return json(
            { error: "Failed to create notification preferences" },
            { status: 500 },
          );
        }
        const inserted = (await insertRes.json().catch(() =&gt; [])) as any[];
        row =
          Array.isArray(inserted) &amp;&amp; inserted.length &gt; 0
            ? inserted[0]
            : defaults;
      }

      const payload = {
        storyUpdates: row.story_updates !== false,
        communityActivity: row.community_activity !== false,
        securityAlerts: row.security_alerts !== false,
        readingReminders: row.reading_reminders === true,
        recommendations: row.recommendations !== false,
        preferredTime: row.preferred_time || "evening",
        timezone: row.timezone || "pst",
      };

      return json(payload);
    } catch {
      return json(
        { error: "Failed to load notification preferences" },
        { status: 500 },
      );
    }
  },
);

router.patch(
  "/api/user/notification-preferences",
  async (req: Request, env: Env) =&gt; {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json({ error: "Supabase not configured" }, { status: 500 });
    }

    const token = getBearerToken(req);
    if (!token) {
      return json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = await getSupabaseUserIdFromJwt(env, token);
    if (!Number.isFinite(userId || NaN)) {
      return json({ error: "User not authenticated" }, { status: 401 });
    }

    let body: any;
    try {
      body = (await (req as any).json?.().catch(() =&gt; ({}))) || {};
    } catch {
      body = {};
    }

    const patch: Record&lt;string, any&gt; = {};

    const coerceBool = (value: any) =&gt; !!value;

    const applyBool = (keys: string[], column: string) =&gt; {
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          patch[column] = coerceBool((body as any)[key]);
          break;
        }
      }
    };

    applyBool(["storyUpdates", "story_updates"], "story_updates");
    applyBool(["communityActivity", "community_activity"], "community_activity");
    applyBool(["securityAlerts", "security_alerts"], "security_alerts");
    applyBool(["readingReminders", "reading_reminders"], "reading_reminders");
    applyBool(["recommendations"], "recommendations");

    if (Object.prototype.hasOwnProperty.call(body, "preferredTime")) {
      patch.preferred_time = String(body.preferredTime);
    }
    if (Object.prototype.hasOwnProperty.call(body, "timezone")) {
      patch.timezone = String(body.timezone);
    }

    if (Object.keys(patch).length === 0) {
      return json(
        { error: "No valid fields in request" },
        { status: 400 },
      );
    }

    try {
      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
      const serviceKey =
        env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
      const headers: Record&lt;string, string&gt; = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const listUrl = new URL(
        `${baseUrl}/rest/v1/user_notification_preferences`,
      );
      listUrl.searchParams.set(
        "select",
        "user_id,story_updates,community_activity,security_alerts,reading_reminders,recommendations,preferred_time,timezone,updated_at",
      );
      listUrl.searchParams.set("user_id", `eq.${userId}`);
      listUrl.searchParams.set("limit", "1");

      const res = await fetch(listUrl.toString(), { headers });
      if (!res.ok) {
        return json(
          { error: "Failed to update notification preferences" },
          { status: 500 },
        );
      }

      const rows = (await res.json().catch(() =&gt; [])) as any[];
      const existing = Array.isArray(rows) &amp;&amp; rows.length &gt; 0 ? rows[0] : null;

      let row: any;

      if (existing) {
        const updateUrl = new URL(
          `${baseUrl}/rest/v1/user_notification_preferences`,
        );
        updateUrl.searchParams.set("user_id", `eq.${userId}`);

        const updateRes = await fetch(updateUrl.toString(), {
          method: "PATCH",
          headers: { ...headers, Prefer: "return=representation" },
          body: JSON.stringify(patch),
        });

        if (!updateRes.ok) {
          return json(
            { error: "Failed to update notification preferences" },
            { status: 500 },
          );
        }

        const updatedRows = (await updateRes.json().catch(() =&gt; [])) as any[];
        row =
          Array.isArray(updatedRows) &amp;&amp; updatedRows.length &gt; 0
            ? updatedRows[0]
            : existing;
      } else {
        const defaults = {
          user_id: Number(userId),
          story_updates: true,
          community_activity: true,
          security_alerts: true,
          reading_reminders: false,
          recommendations: true,
          preferred_time: "evening",
          timezone: "pst",
        };
        const insertBody = { ...defaults, ...patch };

        const insertRes = await fetch(
          `${baseUrl}/rest/v1/user_notification_preferences`,
          {
            method: "POST",
            headers: { ...headers, Prefer: "return=representation" },
            body: JSON.stringify(insertBody),
          },
        );

        if (!insertRes.ok) {
          return json(
            { error: "Failed to save notification preferences" },
            { status: 500 },
          );
        }

        const inserted = (await insertRes.json().catch(() =&gt; [])) as any[];
        row =
          Array.isArray(inserted) &amp;&amp; inserted.length &gt; 0
            ? inserted[0]
            : insertBody;
      }

      const payload = {
        storyUpdates: row.story_updates !== false,
        communityActivity: row.community_activity !== false,
        securityAlerts: row.security_alerts !== false,
        readingReminders: row.reading_reminders === true,
        recommendations: row.recommendations !== false,
        preferredTime: row.preferred_time || "evening",
        timezone: row.timezone || "pst",
      };

      return json(payload);
    } catch {
      return json(
        { error: "Failed to save notification preferences" },
        { status: 500 },
      );
    }
  },
);

router.get("/api/notifications", async (req: Request, env: Env) =&gt; {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/user_notifications`);
    url.searchParams.set(
      "select",
      "id,user_id,type,title,message,metadata,is_read,created_at",
    );
    url.searchParams.set("order", "created_at.desc");
    url.searchParams.set("limit", "50");

    const resp = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (resp.status === 401 || resp.status === 403) {
      return json({ error: "Authentication required" }, { status: 401 });
    }

    if (!resp.ok) {
      return json(
        { error: "Failed to list notifications" },
        { status: 500 },
      );
    }

    const rows = (await resp.json().catch(() =&gt; [])) as any[];
    const notifications = rows.map((n) =&gt; {
      const meta =
        n &amp;&amp; typeof n.metadata === "object" &amp;&amp; n.metadata !== null ? n.metadata : {};
      return {
        id: n.id,
        type: String(n.type || "info"),
        title: String(n.title || "Notification"),
        message: String(n.message || ""),
        metadata: meta,
        isRead: !!(n.is_read ?? n.isRead),
        createdAt: n.created_at || n.createdAt || new Date().toISOString(),
        userId: typeof n.user_id === "number" ? n.user_id : null,
      };
    });

    return json({ notifications });
  } catch {
    return json(
      { error: "Failed to list notifications" },
      { status: 500 },
    );
  }
});

router.post("/api/notifications", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const type = typeof body.type === "string" && body.type.trim().length > 0 ? body.type : null;
    const title =
      typeof body.title === "string" && body.title.trim().length > 0 ? body.title : null;
    const message =
      typeof body.message === "string" && body.message.trim().length > 0 ? body.message : null;
    const metadata =
      body && typeof body.metadata === "object" && body.metadata !== null
        ? body.metadata
        : {};

    if (!type || !title || !message) {
      return json(
        { error: "type, title and message are required" },
        { status: 400 },
      );
    }

    const userId = await getSupabaseUserIdFromJwt(env, token);
    if (!userId) {
      return json({ error: "Authentication required" }, { status: 401 });
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/user_notifications`);

    const resp = await fetch(url.toString(), {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        type,
        title,
        message,
        metadata,
        is_read: false,
        created_at: new Date().toISOString(),
      }),
    });

    if (!resp.ok) {
      const errJson = (await resp.json().catch(() => ({}))) as any;
      return json(
        {
          error:
            errJson?.message ||
            errJson?.error ||
            "Failed to create notification",
        },
        { status: 500 },
      );
    }

    const rows = (await resp.json().catch(() => [])) as any[];
    const n = rows[0];
    const meta =
      n && typeof n.metadata === "object" && n.metadata !== null ? n.metadata : {};
    const notification = {
      id: n.id,
      type: String(n.type || type),
      title: String(n.title || title),
      message: String(n.message || message),
      metadata: meta,
      isRead: !!(n.is_read ?? n.isRead),
      createdAt: n.created_at || n.createdAt || new Date().toISOString(),
      userId: typeof n.user_id === "number" ? n.user_id : userId,
    };

    return json({ notification }, { status: 201 });
  } catch {
    return json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
});

router.patch("/api/notifications/:id/read", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  const token = getBearerToken(req);
  if (!token) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  const urlObj = new URL(req.url);
  const segments = urlObj.pathname.split("/").filter(Boolean);
  const idSegment = segments[segments.length - 2] === "read" ? segments[segments.length - 3] : null;
  const id = idSegment ? Number(idSegment) : NaN;
  if (!Number.isFinite(id) || id <= 0) {
    return json({ error: "Invalid id" }, { status: 400 });
  }

  let isRead = true;
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    if (typeof body.isRead === "boolean") {
      isRead = body.isRead;
    }
  } catch {
    // Default to marking as read
  }

  try {
    const userId = await getSupabaseUserIdFromJwt(env, token);
    if (!userId) {
      return json({ error: "Authentication required" }, { status: 401 });
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/user_notifications`);
    url.searchParams.set("id", `eq.${id}`);
    url.searchParams.set("user_id", `eq.${userId}`);

    const resp = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ is_read: isRead }),
    });

    if (!resp.ok) {
      const errJson = (await resp.json().catch(() => ({}))) as any;
      const status = resp.status === 404 ? 404 : 500;
      return json(
        {
          error:
            errJson?.message ||
            errJson?.error ||
            (status === 404 ? "Notification not found" : "Failed to update notification"),
        },
        { status },
      );
    }

    const rows = (await resp.json().catch(() => [])) as any[];
    const n = rows[0];
    if (!n) {
      return json({ error: "Notification not found" }, { status: 404 });
    }

    const meta =
      n && typeof n.metadata === "object" && n.metadata !== null ? n.metadata : {};
    const notification = {
      id: n.id,
      type: String(n.type || "info"),
      title: String(n.title || "Notification"),
      message: String(n.message || ""),
      metadata: meta,
      isRead: !!(n.is_read ?? n.isRead),
      createdAt: n.created_at || n.createdAt || new Date().toISOString(),
      userId: typeof n.user_id === "number" ? n.user_id : userId,
    };

    return json({ notification });
  } catch {
    return json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
});

// TIPS / DONATIONS: Supabase-backed logging of tip intent + author stats, fallback to legacy Express
router.post("/api/tips", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const authorIdRaw = body?.authorId;
    const authorId = Number(authorIdRaw);
    if (!Number.isFinite(authorId) || authorId <= 0) {
      return json({ error: "Invalid authorId" }, { status: 400 });
    }

    const amount = String(body?.amount ?? "0");
    const currency = String(body?.currency || "USD");
    const status = String(body?.status || "pending");
    const providerId =
      typeof body?.providerId === "string" && body.providerId.length > 0
        ? body.providerId
        : null;
    const message =
      typeof body?.message === "string" && body.message.length > 0 ? body.message : null;

    let userId: number | null = null;
    const token = getBearerToken(req);
    if (token) {
      try {
        const uid = await getSupabaseUserIdFromJwt(env, token);
        if (uid) userId = uid;
      } catch {
        // Non-fatal: anonymous tip intent
      }
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/author_tips`);

    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const resp = await fetch(url.toString(), {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        author_id: authorId,
        user_id: userId,
        amount,
        currency,
        status,
        provider_id: providerId,
        message,
      }),
    });

    if (!resp.ok) {
      const errJson = (await resp.json().catch(() => ({}))) as any;
      return json(
        {
          error:
            errJson?.message ||
            errJson?.error ||
            "Failed to record tip event",
        },
        { status: 500 },
      );
    }

    const rows = (await resp.json().catch(() => [])) as any[];
    const tip = rows[0] || null;
    return json({ success: true, tip }, { status: 201 });
  } catch {
    return json(
      { error: "Failed to record tip event" },
      { status: 500 },
    );
  }
});

router.get("/api/tips/author/:authorId", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  const urlObj = new URL(req.url);
  const segments = urlObj.pathname.split("/").filter(Boolean);
  const authorIdSegment = segments[segments.length - 1];
  const authorId = Number(authorIdSegment);
  if (!Number.isFinite(authorId) || authorId <= 0) {
    return json({ error: "Invalid authorId" }, { status: 400 });
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/author_tips`);
    url.searchParams.set("author_id", `eq.${authorId}`);
    url.searchParams.set("order", "created_at.desc");
    url.searchParams.set("limit", "50");

    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    const resp = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
    });

    if (!resp.ok) {
      return json(
        { error: "Failed to fetch author tips" },
        { status: 500 },
      );
    }

    const rows = (await resp.json().catch(() => [])) as any[];
    return json({
      authorId,
      totalTips: rows.length,
      tips: rows,
    });
  } catch {
    return json(
      { error: "Failed to fetch author tips" },
      { status: 500 },
    );
  }
});

// USER FEEDBACK: self-service endpoints backed by Supabase user_feedback, with legacy fallback
router.get("/api/user/feedback", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  const token = getBearerToken(req);
  if (!token) {
    // Mirror legacy behaviour: return empty data instead of 401
    return json({ feedback: [], isAuthenticated: false });
  }

  try {
    const userId = await getSupabaseUserIdFromJwt(env, token);
    if (!userId) {
      return json({ feedback: [], isAuthenticated: false });
    }

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/user_feedback`);
    url.searchParams.set(
      "select",
      "id,type,content,page,status,user_id,browser,operating_system,screen_resolution,user_agent,category,metadata,created_at",
    );
    url.searchParams.set("user_id", `eq.${userId}`);
    url.searchParams.set("order", "created_at.desc");
    url.searchParams.set("limit", "100");

    const resp = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (resp.status === 401 || resp.status === 403) {
      return json({ feedback: [], isAuthenticated: false });
    }

    if (!resp.ok) {
      return json({ feedback: [], isAuthenticated: false });
    }

    const rows = (await resp.json().catch(() => [])) as any[];

    const feedback = rows.map((row) => {
      const meta =
        row && typeof row.metadata === "object" && row.metadata !== null
          ? row.metadata
          : {};
      const browser = row.browser || meta.browser || "unknown";
      const operatingSystem = row.operating_system || meta.operatingSystem || "unknown";
      const screenResolution =
        row.screen_resolution || meta.screenResolution || "unknown";
      const userAgent = row.user_agent || meta.userAgent || "";

      return {
        id: row.id,
        type: row.type || "general",
        content: row.content || "",
        page: row.page || "unknown",
        category: row.category || "general",
        status: row.status || "pending",
        createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        metadata: {
          browser,
          operatingSystem,
          screenResolution,
          userAgent,
          name: meta.name,
          email: meta.email,
        },
        adminResponse:
          typeof meta.adminResponse === "string" ? meta.adminResponse : undefined,
      };
    });

    return json({ feedback, isAuthenticated: true });
  } catch {
    return json({ feedback: [], isAuthenticated: false });
  }
});

router.get("/api/user/feedback/stats", async (req: Request, env: Env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return proxyToBackend(req, env);
  }

  const token = getBearerToken(req);
  if (!token) {
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

  try {
    const userId = await getSupabaseUserIdFromJwt(env, token);
    if (!userId) {
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

    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    const url = new URL(`${baseUrl}/rest/v1/user_feedback`);
    url.searchParams.set(
      "select",
      "id,status,metadata,user_id,created_at",
    );
    url.searchParams.set("user_id", `eq.${userId}`);
    url.searchParams.set("order", "created_at.desc");
    url.searchParams.set("limit", "100");

    const resp = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!resp.ok) {
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

    const rows = (await resp.json().catch(() => [])) as any[];

    const total = rows.length;
    const pending = rows.filter((r) => r.status === "pending").length;
    const reviewed = rows.filter((r) => r.status === "reviewed").length;
    const resolved = rows.filter((r) => r.status === "resolved").length;
    const rejected = rows.filter((r) => r.status === "rejected").length;

    let respondedCount = 0;
    for (const r of rows) {
      const meta =
        r && typeof r.metadata === "object" && r.metadata !== null ? r.metadata : {};
      if (typeof meta.adminResponse === "string" && meta.adminResponse.length > 0) {
        respondedCount += 1;
      }
    }

    const responseRate = total > 0 ? (respondedCount / total) * 100 : 0;

    return json({
      stats: {
        total,
        pending,
        reviewed,
        resolved,
        rejected,
        responseRate,
      },
      isAuthenticated: true,
    });
  } catch {
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
});

// API DOMAIN FALLBACK: no legacy backend proxy; return 404 for unknown routes
router.all("*", async (_req: Request, _env: Env) => {
  return json({ error: "Not Found" }, { status: 404 });
});

// ============================================================================
// EXPORT DURABLE OBJECT CLASSES (same worker script)
// ============================================================================
export { RateLimitObject, IdempotencyObject, LocksObject } from "./durable-objects";

// ============================================================================
// SCHEDULED HANDLERS (Cron) + Default Export
// ============================================================================
export default {
  // itty-router v5 uses `router.fetch` (v4 used `router.handle`)
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return router.fetch(request, env, ctx);
  },

  async scheduled(_event: ScheduledEvent, env: Env) {
    try {
      let shouldRunSync = env.ENABLE_WORDPRESS_SCHEDULER === "true";

      // Allow dashboard toggle (wordpress_sync_enabled) to override env flag when available
      if (shouldRunSync && env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        try {
          const baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
          const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
          const headers: Record<string, string> = {
            apikey: env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${serviceKey}`,
            Accept: "application/json",
          };

          const settingsUrl = new URL(`${baseUrl}/rest/v1/site_settings`);
          settingsUrl.searchParams.set("select", "key,value");
          settingsUrl.searchParams.set("key", "eq.wordpress_sync_enabled");
          settingsUrl.searchParams.set("limit", "1");

          const res = await fetch(settingsUrl.toString(), { headers });
          if (res.ok) {
            const rows = (await res.json().catch(() => [])) as any[];
            if (Array.isArray(rows) && rows.length > 0) {
              const value = rows[0].value;
              if (value === "true") {
                shouldRunSync = true;
              } else if (value === "false") {
                shouldRunSync = false;
              }
            }
          }
        } catch {
          // Ignore setting lookup failures; fall back to env flag
        }
      }

      if (shouldRunSync) {
        try {
          await fetch("https://api.bubblescafe.space/api/wordpress/sync/manual", {
            method: "POST",
            headers: {
              "X-Scheduler": "true",
              "X-Sync-Key": env.WORDPRESS_SYNC_KEY || "scheduler",
            },
          });
        } catch {
          // Ignore sync failures; cron will try again on next run
        }
      }

      if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        const analyticsKeys = await env.ANALYTICS_KV.list();
        const batch = analyticsKeys.keys.slice(0, 100);

        for (const key of batch) {
          const eventData = await env.ANALYTICS_KV.get(key.name);
          if (eventData) {
            await callSupabaseRpc(env, "log_analytics_event", {
              event_type: key.name.split("-")[0],
              data: JSON.parse(eventData),
            });
            await env.ANALYTICS_KV.delete(key.name);
          }
        }
      }
    } catch {
      // Allow cron to fail silently to avoid retries storms
    }
  },
};