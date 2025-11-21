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

/**
 * Proxy helper: forwards the incoming request to the legacy backend (Express) when needed.
 * This preserves full backend functionality (auth, search, comments, etc.) while the
 * Worker gradually takes over more routes.
 */
async function proxyToBackend(req: Request, env: Env): Promise<Response> {etOrCheckIdempotency(
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

// POSTS: proxy to backend for full-featured API (listing, pagination, summaries, etc.)
router.get("/api/posts", async (req: Request, env: Env) => {
  return proxyToBackend(req, env);
});

router.get("/api/posts/community", async (req: Request, env: Env) => {
  return proxyToBackend(req, env);
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