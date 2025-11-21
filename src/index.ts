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
 * Proxy helper: forwards the incoming request to the legacy backend (Express) when needed.
 * This preserves full backend functionality (auth, search, comments, etc.) while the
 * Worker gradually takes over more routes.
 */
async function proxyToBackend(req: Request, env: Env): Promise<Response> {
  const backendBase = (env.BACKEND_BASE_URL || "").trim();
  if (!backendBase) {
    return json({ error: "Not Found" }, { status: 404 });
  }

  let backendUrl: URL;
  let incomingUrl: URL;
  try {
    backendUrl = new URL(backendBase);
    incomingUrl = new URL(req.url);
  } catch {
    return json({ error: "Not Found" }, { status: 404 });
  }

  // Avoid proxy loops (e.g. BACKEND_BASE_URL accidentally pointing back to this Worker)
  if (backendUrl.host === incomingUrl.host) {
    return json({ error: "Not Found" }, { status: 404 });
  }

  // Build target URL by combining backend base with the incoming path/query
  const target = new URL(incomingUrl.pathname + incomingUrl.search, backendUrl);

  // Clone the incoming request into a new Request with the target URL
  const init: RequestInit = {
    method: req.method,
    headers: new Headers(req.headers),
    redirect: "manual",
    // Body will be copied below for non-GET/HEAD
  };

  // Remove Cloudflare-specific hop-by-hop headers that shouldn't be forwarded
  init.headers.delete("host");
  init.headers.delete("cf-connecting-ip");
  init.headers.delete("cf-ipcountry");
  init.headers.delete("cf-ray");
  init.headers.delete("cf-worker");
  init.headers.delete("x-forwarded-host");

  // Add forwarding headers for backend visibility
  init.headers.set("x-forwarded-host", incomingUrl.host);
  init.headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

  if (req.method !== "GET" && req.method !== "HEAD") {
    // For non-GET/HEAD, clone the body stream
    init.body = req.body;
  }

  const proxiedRequest = new Request(target.toString(), init);

  return fetch(proxiedRequest);
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

// ANALYTICS: Write to KV queue
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

router.get("/api/analytics/site", async (_req: Request, env: Env) => {
  try {
    const cached = await env.CACHE_KV.get("analytics-site-aggregate");
    if (cached) {
      return json(JSON.parse(cached), {
        headers: { "Cache-Control": "max-age=300, stale-while-revalidate=600" },
      });
    }

    return json({ pageviews: 0, visitors: 0, topPages: [] });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
});

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

// PAYMENTS WEBHOOK: Idempotent processing
router.post("/api/payments/webhook", async (req: Request, env: Env) => {
  try {
    const body = await req.text();
    const eventId = JSON.parse(body).id;

    const { isNew } = await getOrCheckIdempotency(env, `webhook-${eventId}`, 86_400_000);
    if (!isNew) {
      return json({ success: true, cached: true });
    }

    const event = JSON.parse(body);
    if (event.type === "payment_intent.succeeded") {
      await callSupabaseRpc(env, "handle_payment_success", {
        event_id: eventId,
        data: event.data,
      });
    }

    return json({ success: true });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
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

    try {
      const wpRes = await fetch(
        `${env.WORDPRESS_API}?per_page=100&orderby=modified&order=desc`
      );
      if (!wpRes.ok) throw new Error("WordPress API failed");

      const posts = (await wpRes.json()) as any[];

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

      await env.SYNC_METADATA_KV.put(
        "last_sync_timestamp",
        new Date().toISOString()
      );
      await env.SYNC_METADATA_KV.put("last_sync_status", "success");

      return json({ success: true, postsProcessed: posts.length });
    } finally {
      await lock.fetch(
        new Request("https://worker", {
          method: "POST",
          body: JSON.stringify({ key: "wordpress-sync", action: "release" }),
        })
      );
    }
  } catch (error) {
    await env.SYNC_METADATA_KV.put(
      "last_sync_status",
      `error: ${String(error)}`
    );
    return json({ error: String(error) }, { status: 500 });
  }
});

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

// API DOMAIN REDIRECT / FALLBACK PROXY
router.all("*", async (req: Request, env: Env) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Non-API paths (including "/") should go to the frontend
  if (!path.startsWith("/api/") && path !== "/health") {
    const redirectUrl = new URL(path + url.search, env.FRONTEND_URL);
    return new Response(null, {
      status: 308,
      headers: { Location: redirectUrl.toString() },
    });
  }

  // For any unhandled /api/* routes, forward to the legacy backend.
  if (path.startsWith("/api/")) {
    return proxyToBackend(req, env);
  }

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
      if (env.ENABLE_WORDPRESS_SCHEDULER === "true") {
        await fetch("https://api.bubblescafe.space/api/wordpress/sync/manual", {
          method: "POST",
          headers: {
            "X-Scheduler": "true",
            "X-Sync-Key": env.WORDPRESS_SYNC_KEY || "scheduler",
          },
        });
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
    } catch (error) {
      // Allow cron to fail silently to avoid retries storms
    }
  },
};