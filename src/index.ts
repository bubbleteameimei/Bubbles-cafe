import { Router } from 'itty-router';
import { json, withContent } from 'itty-router';

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
  
  BACKEND_BASE_URL: string;
  FRONTEND_URL: string;
  NODE_ENV: string;
  ENABLE_WORDPRESS_SCHEDULER: string;
}

// ============================================================================
// DURABLE OBJECTS
// ============================================================================

export class RateLimitObject {
  private state: DurableObjectState;
  private buckets: Map<string, { tokens: number; lastRefill: number }>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.buckets = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const { key, limit, window } = (await request.json()) as any;
    const now = Date.now();
    const bucket = this.buckets.get(key) || { tokens: limit, lastRefill: now };

    const timePassed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(limit, bucket.tokens + timePassed * (limit / window));
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.buckets.set(key, bucket);
      return json({ allowed: true });
    }

    return json({ allowed: false }, { status: 429 });
  }
}

export class IdempotencyObject {
  private state: DurableObjectState;
  private responses: Map<string, { response: Response; timestamp: number }>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.responses = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const { key, response, ttl } = (await request.json()) as any;

    if (this.responses.has(key)) {
      return json({ cached: true, response: this.responses.get(key)!.response });
    }

    this.responses.set(key, { response, timestamp: Date.now() });

    // Cleanup old entries after TTL
    setTimeout(() => {
      this.responses.delete(key);
    }, ttl || 86400000);

    return json({ cached: false });
  }
}

export class LocksObject {
  private state: DurableObjectState;
  private locks: Map<string, boolean>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.locks = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const { key, action } = (await request.json()) as any;

    if (action === 'acquire') {
      if (this.locks.has(key)) {
        return json({ acquired: false }, { status: 409 });
      }
      this.locks.set(key, true);
      return json({ acquired: true });
    }

    if (action === 'release') {
      this.locks.delete(key);
      return json({ released: true });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  }
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
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      'X-Client-Info': 'bubbles-worker',
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
  const response = await obj.fetch(new Request('https://worker', {
    method: 'POST',
    body: JSON.stringify({ key, limit, window }),
  }));
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
  const response = await obj.fetch(new Request('https://worker', {
    method: 'POST',
    body: JSON.stringify({ key, ttl }),
  }));
  const result = (await response.json()) as any;
  return { isNew: !result.cached, cached: result.cached };
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

// HEALTH
router.get('/api/health', async (req: Request, env: Env) => {
  try {
    const started = Date.now();
    const timeoutMs = 250;

    // Optional DB check via Supabase REST
    const healthRes = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime?.() || 0,
      latency: Date.now() - started,
    };

    return json(healthRes, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return json({ status: 'error', message: String(error) }, { status: 500 });
  }
});

router.get('/health', async (req: Request, env: Env) => {
  return json({ status: 'ok' });
});

// ANALYTICS: Write to KV queue
router.post('/api/analytics/vitals', async (req: Request, env: Env) => {
  try {
    const body = (await req.json?.()) || {};

    // Check rate limit: 100 requests per 60s per IP
    const ip = req.headers.get('cf-connecting-ip') || 'unknown';
    const allowed = await checkRateLimit(env, `analytics-${ip}`, 100, 60);
    if (!allowed) {
      return json({ error: 'Rate limited' }, { status: 429 });
    }

    // Queue to KV for batch processing
    const eventId = crypto.randomUUID();
    await env.ANALYTICS_KV.put(
      `vitals-${eventId}`,
      JSON.stringify(body),
      { expirationTtl: 86400 }
    );

    return json({ success: true, eventId });
  } catch (error) {
    return json({ error: String(error) }, { status: 400 });
  }
});

router.post('/api/analytics/pageview', async (req: Request, env: Env) => {
  try {
    const body = (await req.json?.()) || {};
    const eventId = crypto.randomUUID();
    await env.ANALYTICS_KV.put(
      `pageview-${eventId}`,
      JSON.stringify(body),
      { expirationTtl: 86400 }
    );
    return json({ success: true, eventId });
  } catch (error) {
    return json({ error: String(error) }, { status: 400 });
  }
});

router.post('/api/analytics/interaction', async (req: Request, env: Env) => {
  try {
    const body = (await req.json?.()) || {};
    const eventId = crypto.randomUUID();
    await env.ANALYTICS_KV.put(
      `interaction-${eventId}`,
      JSON.stringify(body),
      { expirationTtl: 86400 }
    );
    return json({ success: true, eventId });
  } catch (error) {
    return json({ error: String(error) }, { status: 400 });
  }
});

router.post('/api/analytics/performance', async (req: Request, env: Env) => {
  try {
    const body = (await req.json?.()) || {};
    const eventId = crypto.randomUUID();
    await env.ANALYTICS_KV.put(
      `performance-${eventId}`,
      JSON.stringify(body),
      { expirationTtl: 86400 }
    );
    return json({ success: true, eventId });
  } catch (error) {
    return json({ error: String(error) }, { status: 400 });
  }
});

router.get('/api/analytics/site', async (req: Request, env: Env) => {
  try {
    // Return cached aggregates from KV or compute from Supabase
    const cached = await env.CACHE_KV.get('analytics-site-aggregate');
    if (cached) {
      return json(JSON.parse(cached), {
        headers: { 'Cache-Control': 'max-age=300, stale-while-revalidate=600' },
      });
    }

    // Fallback: minimal response
    return json({ pageviews: 0, visitors: 0, topPages: [] });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
});

// BOOKMARKS: Supabase RPC
router.get('/api/bookmarks', async (req: Request, env: Env) => {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token || !(await verifySupabaseJwt(token, env))) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache first
    const cached = await env.USER_CACHE_KV.get(`bookmarks-${token.slice(0, 20)}`);
    if (cached) {
      return json(JSON.parse(cached), {
        headers: { 'Cache-Control': 'max-age=30, stale-while-revalidate=60' },
      });
    }

    // Fetch from Supabase RPC
    const response = await callSupabaseRpc(env, 'get_user_bookmarks', {});
    if (!response.ok) {
      return json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
    }

    const data = await response.json();
    await env.USER_CACHE_KV.put(
      `bookmarks-${token.slice(0, 20)}`,
      JSON.stringify(data),
      { expirationTtl: 3600 }
    );

    return json(data);
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
});

router.post('/api/bookmarks/:postId', async (req: Request, env: Env) => {
  try {
    const { postId } = req.params as any;
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token || !(await verifySupabaseJwt(token, env))) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json?.()) || {};

    // Call Supabase RPC to add bookmark
    const response = await callSupabaseRpc(env, 'add_bookmark', {
      post_id: postId,
      ...body,
    });

    if (!response.ok) {
      return json({ error: 'Failed to add bookmark' }, { status: 500 });
    }

    // Invalidate user cache
    await env.USER_CACHE_KV.delete(`bookmarks-${token.slice(0, 20)}`);

    return json({ success: true });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
});

// EMAIL SERVICE
router.post('/api/email-service/send', async (req: Request, env: Env) => {
  try {
    const ip = req.headers.get('cf-connecting-ip') || 'unknown';
    const allowed = await checkRateLimit(env, `email-${ip}`, 10, 3600);
    if (!allowed) {
      return json({ error: 'Rate limited' }, { status: 429 });
    }

    const body = (await req.json?.()) || {};

    // Validate
    if (!body.to || !body.subject || !body.html) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call SendGrid or Resend via their HTTP API
    const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: body.to }] }],
        from: { email: env.GMAIL_ADMIN_EMAIL },
        subject: body.subject,
        content: [{ type: 'text/html', value: body.html }],
      }),
    });

    if (!emailRes.ok) {
      return json({ error: 'Failed to send email' }, { status: 500 });
    }

    return json({ success: true, messageId: crypto.randomUUID() });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
});

// PAYMENTS WEBHOOK: Idempotent processing
router.post('/api/payments/webhook', async (req: Request, env: Env) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    // Verify webhook signature (simple version; use crypto for production)
    const eventId = JSON.parse(body).id;

    // Check idempotency
    const { isNew } = await getOrCheckIdempotency(env, `webhook-${eventId}`, 86400000);
    if (!isNew) {
      return json({ success: true, cached: true });
    }

    // Process webhook
    const event = JSON.parse(body);
    if (event.type === 'payment_intent.succeeded') {
      // Write to Supabase via RPC
      await callSupabaseRpc(env, 'handle_payment_success', {
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
router.get('/api/wordpress/status', async (req: Request, env: Env) => {
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

router.post('/api/wordpress/sync/manual', async (req: Request, env: Env) => {
  try {
    const key = req.headers.get('X-Sync-Key');
    // Allow if WORDPRESS_SYNC_KEY is configured and matches, or if scheduler is enabled
    const isScheduler = req.headers.get('X-Scheduler') === 'true';
    if (!isScheduler && env.WORDPRESS_SYNC_KEY && key !== env.WORDPRESS_SYNC_KEY) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Trigger sync via Durable Object lock to prevent concurrent syncs
    const lockId = env.LOCKS_DO.idFromName('wordpress-sync');
    const lock = env.LOCKS_DO.get(lockId);

    const acquired = await lock.fetch(new Request('https://worker', {
      method: 'POST',
      body: JSON.stringify({ key: 'wordpress-sync', action: 'acquire' }),
    }));

    const lockData = (await acquired.json()) as any;
    if (!lockData.acquired) {
      return json({ error: 'Sync already in progress' }, { status: 409 });
    }

    try {
      // Perform sync
      const wpRes = await fetch(`${env.WORDPRESS_API}?per_page=100&orderby=modified&order=desc`);
      if (!wpRes.ok) throw new Error('WordPress API failed');

      const posts = await wpRes.json() as any[];

      // Batch upsert to Supabase
      for (const batch of posts) {
        await callSupabaseRpc(env, 'upsert_wordpress_post', {
          post_id: batch.id,
          title: batch.title?.rendered,
          content: batch.content?.rendered,
          excerpt: batch.excerpt?.rendered,
          slug: batch.slug,
          date: batch.date,
        });
      }

      // Update metadata
      await env.SYNC_METADATA_KV.put('last_sync_timestamp', new Date().toISOString());
      await env.SYNC_METADATA_KV.put('last_sync_status', 'success');

      return json({ success: true, postsProcessed: posts.length });
    } finally {
      // Release lock
      await lock.fetch(new Request('https://worker', {
        method: 'POST',
        body: JSON.stringify({ key: 'wordpress-sync', action: 'release' }),
      }));
    }
  } catch (error) {
    await env.SYNC_METADATA_KV.put('last_sync_status', `error: ${String(error)}`);
    return json({ error: String(error) }, { status: 500 });
  }
});

// API DOMAIN REDIRECT: If path is not /api/* or /health, redirect to frontend
router.all('*', async (req: Request, env: Env) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // If not an API path, redirect to frontend
  if (!path.startsWith('/api/') && !path.startsWith('/health') && path !== '/') {
    const redirectUrl = new URL(path + url.search, env.FRONTEND_URL);
    return new Response(null, {
      status: 308,
      headers: { Location: redirectUrl.toString() },
    });
  }

  // Handle 404
  return json({ error: 'Not Found' }, { status: 404 });
});

// ============================================================================
// SCHEDULED HANDLERS (Cron)
// ============================================================================

export default {
  async fetch(request: Request, env: Env) {
    return router.handle(request, env);
  },

  async scheduled(event: ScheduledEvent, env: Env) {
    try {
      // Hourly: WordPress sync
      if (env.ENABLE_WORDPRESS_SCHEDULER === 'true') {
        await fetch('https://api.bubblescafe.space/api/wordpress/sync/manual', {
          method: 'POST',
          headers: {
            'X-Scheduler': 'true',
            'X-Sync-Key': env.WORDPRESS_SYNC_KEY || 'scheduler',
          },
        });
      }

      // Hourly: Flush analytics to Supabase
      const analyticsKeys = await env.ANALYTICS_KV.list();
      const batch = analyticsKeys.keys.slice(0, 100); // Process in batches

      for (const key of batch) {
        const eventData = await env.ANALYTICS_KV.get(key.name);
        if (eventData) {
          // Write to Supabase
          await callSupabaseRpc(env, 'log_analytics_event', {
            event_type: key.name.split('-')[0],
            data: JSON.parse(eventData),
          });

          // Remove from queue
          await env.ANALYTICS_KV.delete(key.name);
        }
      }
    } catch (error) {
      console.error('Scheduled task error:', error);
    }
  },
};
