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

// BOOKMARKS: proxy to legacy backend for full feature set (tags, notes, migration, etc.)
router.get("/api/bookmarks", async (req: Request, env: Env) => {
  return proxyToBackend(req, env);
});

router.post("/api/bookmarks/:postId", async (req: Request, env: Env) => {
  return proxyToBackend(req, env);
});

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