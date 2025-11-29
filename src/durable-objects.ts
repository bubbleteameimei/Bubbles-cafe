// src/durable-objects.ts
// Minimal JSON helper (avoid extra deps inside DOs)
const json = (data: any, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    status: init?.status || 200,
  });

// ============================================================================
// DURABLE OBJECTS
// ============================================================================

export class RateLimitObject {
  private state: DurableObjectState;
  private buckets: Map<string, { tokens: number; lastRefill: number }>;

  constructor(state: DurableObjectState, env: unknown) {
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

interface IdempotencyEntry {
  status: 'pending' | 'completed';
  response?: any;
  expiresAt: number;
}

export class IdempotencyObject {
  private state: DurableObjectState;
  private responses: Map<string, IdempotencyEntry>;

  constructor(state: DurableObjectState, env: unknown) {
    this.state = state;
    this.responses = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const operation = payload?.operation;
    const keyValue = payload?.key;
    const key = typeof keyValue === 'string' ? keyValue : String(keyValue || '');
    const ttlMsRaw = payload?.ttlMs;
    const ttlMs =
      typeof ttlMsRaw === 'number' && ttlMsRaw > 0 ? ttlMsRaw : 86_400_000; // default 24h
    if (!key) {
      return json({ error: 'Missing key' }, { status: 400 });
    }

    const now = Date.now();
    const existing = this.responses.get(key);
    if (existing && existing.expiresAt <= now) {
      this.responses.delete(key);
    }

    if (operation === 'check') {
      const entry = this.responses.get(key);
      if (entry && entry.status === 'completed' && entry.response != null) {
        return json({ state: 'completed', response: entry.response });
      }
      if (entry && entry.status === 'pending') {
        return json({ state: 'pending' });
      }

      const expiresAt = now + ttlMs;
      this.responses.set(key, { status: 'pending', expiresAt });

      // Note: setTimeout is not reliable for long TTLs; for production,
      // use Durable Object storage + alarms.
      setTimeout(() => {
        const current = this.responses.get(key);
        if (current && current.status === 'pending' && current.expiresAt <= Date.now()) {
          this.responses.delete(key);
        }
      }, ttlMs);

      return json({ state: 'new' });
    }

    if (operation === 'store') {
      const response = payload?.response;
      const expiresAt = now + ttlMs;
      this.responses.set(key, { status: 'completed', response, expiresAt });

      // Best-effort cleanup
      setTimeout(() => {
        const current = this.responses.get(key);
        if (current && current.expiresAt <= Date.now()) {
          this.responses.delete(key);
        }
      }, ttlMs);

      return json({ stored: true });
    }

    return json({ error: 'Invalid operation' }, { status: 400 });
  }
}

export class LocksObject {
  private state: DurableObjectState;
  private locks: Map<string, boolean>;

  constructor(state: DurableObjectState, env: unknown) {
    this.state = state;
    this.locks = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const { key, action } = (await request.json()) as any;

    if (action === "acquire") {
      if (this.locks.has(key)) {
        return json({ acquired: false }, { status: 409 });
      }
      this.locks.set(key, true);
      return json({ acquired: true });
    }

    if (action === "release") {
      this.locks.delete(key);
      return json({ released: true });
    }

    return json({ error: "Invalid action" }, { status: 400 });
  }
}

// Minimal default export for the worker runtime if this file is ever used as an entry.
// In our setup we re-export these classes from src/index.ts (the main worker).
export default {
  fetch: () => new Response("Durable Objects module loaded.", { status: 200 }),
};