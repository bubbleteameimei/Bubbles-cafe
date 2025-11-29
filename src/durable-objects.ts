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

/**
 * Best-effort, in-memory token bucket rate limiter.
 *
 * Notes:
 * - State is held only in memory on the DO instance; it is not persisted to
 *   Durable Object storage and will be reset if the instance is evicted or
 *   restarted.
 * - This is intended as a lightweight protection layer, not a strict global
 *   rate limiter. It should not be relied on for hard security guarantees.
 */
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

/**
 * Simple idempotency helper that tracks whether a key has been seen recently.
 *
 * Notes:
 * - Entries are kept in memory only and cleared with `setTimeout`, which is
 *   best-effort in the Workers runtime and may not survive instance restarts.
 * - For stronger guarantees, move this state into Durable Object storage and
 *   use alarms for cleanup.
 */
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
    const ttlMsRaw = payload?.ttlMs ?? payload?.ttl;
    const ttlMs =
      typeof ttlMsRaw === 'number' && ttlMsRaw > 0 ? ttlMsRaw : 86_400_000; // default 24h

    if (!key) {
      return json({ error: 'Missing key' }, { status: 400 });
    }

    const now = Date.now();

    if (operation === 'check') {
      const entry = this.responses.get(key);

      if (entry && entry.expiresAt <= now) {
        this.responses.delete(key);
      } else if (entry && entry.status === 'completed' && entry.response != null) {
        return json({ state: 'completed', response: entry.response });
      } else if (entry && entry.status === 'pending') {
        return json({ state: 'pending' });
      }

      const expiresAt = now + ttlMs;
      this.responses.set(key, { status: 'pending', expiresAt });

      // Best-effort cleanup
      setTimeout(() => {
        const current = this.responses.get(key);
        if (current && current.expiresAt <= Date.now()) {
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

    // Backwards-compatible behavior: if no explicit operation is provided,
    // behave like a simple \"seen\" cache keyed by `key` and `ttlMs`.
    if (!operation) {
      const existing = this.responses.get(key);
      const isValid = existing && existing.expiresAt > now;
      if (isValid) {
        return json({ cached: true, response: existing.response ?? null });
      }

      const expiresAt = now + ttlMs;
      this.responses.set(key, { status: 'completed', response: payload?.response, expiresAt });

      setTimeout(() => {
        const current = this.responses.get(key);
        if (current && current.expiresAt <= Date.now()) {
          this.responses.delete(key);
        }
      }, ttlMs);

      return json({ cached: false });
    }

    return json({ error: 'Invalid operation' }, { status: 400 });
  }
}

/**
 * Lightweight in-memory lock manager.
 *
 * Notes:
 * - Locks are scoped to the lifetime of the DO instance and are not persisted.
 *   They will be released automatically if the instance is evicted or
 *   restarted.
 * - This is designed to prevent concurrent work within a single instance, not
 *   to provide a global, strongly consistent locking mechanism.
 */
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