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
 * Storage-backed, fixed-window rate limiter.
 *
 * Semantics:
 * - Each (key, windowSeconds) pair gets a counter that resets at resetAt.
 * - State is stored in Durable Object storage so it survives restarts.
 */
export class RateLimitObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState, _env: unknown) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const key = typeof payload?.key === 'string' ? payload.key : String(payload?.key || '');
    const limit = Number(payload?.limit);
    const windowSeconds = Number(payload?.window);

    if (!key) return json({ error: 'Missing key' }, { status: 400 });
    if (!Number.isFinite(limit) || limit <= 0) return json({ error: 'Invalid limit' }, { status: 400 });
    if (!Number.isFinite(windowSeconds) || windowSeconds <= 0) {
      return json({ error: 'Invalid window' }, { status: 400 });
    }

    const now = Date.now();
    const storageKey = `rl:${windowSeconds}:${key}`;

    const data = (await this.state.storage.get(storageKey)) as
      | { count: number; resetAt: number }
      | undefined;

    let count = data?.count ?? 0;
    let resetAt = data?.resetAt ?? 0;

    if (!resetAt || resetAt <= now) {
      count = 0;
      resetAt = now + windowSeconds * 1000;
    }

    const allowed = count < limit;
    if (allowed) {
      count += 1;
      await this.state.storage.put(storageKey, { count, resetAt });
    }

    // Best-effort cleanup: set an alarm near the next reset.
    try {
      const currentAlarm = await this.state.storage.getAlarm();
      if (!currentAlarm || currentAlarm > resetAt) {
        await this.state.storage.setAlarm(resetAt);
      }
    } catch {
      // ignore alarm errors
    }

    return allowed ? json({ allowed: true }) : json({ allowed: false }, { status: 429 });
  }

  async alarm(): Promise<void> {
    // Opportunistic cleanup of expired counters.
    const now = Date.now();
    const list = await this.state.storage.list({ prefix: 'rl:' });
    const toDelete: string[] = [];

    for (const [k, v] of list.entries()) {
      const value = v as any;
      if (value && typeof value.resetAt === 'number' && value.resetAt <= now) {
        toDelete.push(String(k));
      }
    }

    if (toDelete.length) {
      await this.state.storage.delete(toDelete);
    }

    // No need to keep an alarm unless new keys are written.
    await this.state.storage.setAlarm(0);
  }
}

interface IdempotencyEntry {
  status: 'pending' | 'completed';
  response?: any;
  expiresAt: number;
}

/**
 * Storage-backed idempotency helper.
 *
 * Operations:
 * - check: creates a pending marker if no valid entry exists
 * - store: writes a completed response for the key
 */
export class IdempotencyObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState, _env: unknown) {
    this.state = state;
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
    const ttlMs = typeof ttlMsRaw === 'number' && ttlMsRaw > 0 ? ttlMsRaw : 86_400_000;

    if (!key) {
      return json({ error: 'Missing key' }, { status: 400 });
    }

    const now = Date.now();
    const storageKey = `idem:${key}`;

    const existing = (await this.state.storage.get(storageKey)) as IdempotencyEntry | undefined;
    if (existing && typeof existing.expiresAt === 'number' && existing.expiresAt <= now) {
      await this.state.storage.delete(storageKey);
    }

    if (operation === 'check') {
      const entry = (await this.state.storage.get(storageKey)) as IdempotencyEntry | undefined;
      if (entry && entry.status === 'completed' && entry.response != null && entry.expiresAt > now) {
        return json({ state: 'completed', response: entry.response });
      }
      if (entry && entry.status === 'pending' && entry.expiresAt > now) {
        return json({ state: 'pending' });
      }

      const expiresAt = now + ttlMs;
      await this.state.storage.put(storageKey, { status: 'pending', expiresAt } satisfies IdempotencyEntry);

      try {
        const currentAlarm = await this.state.storage.getAlarm();
        if (!currentAlarm || currentAlarm > expiresAt) {
          await this.state.storage.setAlarm(expiresAt);
        }
      } catch {
        // ignore
      }

      return json({ state: 'new' });
    }

    if (operation === 'store') {
      const response = payload?.response;
      const expiresAt = now + ttlMs;
      await this.state.storage.put(storageKey, {
        status: 'completed',
        response,
        expiresAt,
      } satisfies IdempotencyEntry);

      try {
        const currentAlarm = await this.state.storage.getAlarm();
        if (!currentAlarm || currentAlarm > expiresAt) {
          await this.state.storage.setAlarm(expiresAt);
        }
      } catch {
        // ignore
      }

      return json({ stored: true });
    }

    return json({ error: 'Invalid operation' }, { status: 400 });
  }

  async alarm(): Promise<void> {
    const now = Date.now();
    const list = await this.state.storage.list({ prefix: 'idem:' });
    const toDelete: string[] = [];

    for (const [k, v] of list.entries()) {
      const value = v as any;
      if (value && typeof value.expiresAt === 'number' && value.expiresAt <= now) {
        toDelete.push(String(k));
      }
    }

    if (toDelete.length) {
      await this.state.storage.delete(toDelete);
    }

    await this.state.storage.setAlarm(0);
  }
}

/**
 * Storage-backed lock manager with a TTL lease.
 */
export class LocksObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState, _env: unknown) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const key = typeof payload?.key === 'string' ? payload.key : String(payload?.key || '');
    const action = typeof payload?.action === 'string' ? payload.action : '';
    const ttlMsRaw = payload?.ttlMs;
    const ttlMs = typeof ttlMsRaw === 'number' && ttlMsRaw > 0 ? ttlMsRaw : 10 * 60 * 1000;

    if (!key) return json({ error: 'Missing key' }, { status: 400 });

    const now = Date.now();
    const storageKey = `lock:${key}`;

    if (action === 'acquire') {
      const existing = (await this.state.storage.get(storageKey)) as { expiresAt: number } | undefined;
      if (existing && typeof existing.expiresAt === 'number' && existing.expiresAt > now) {
        return json({ acquired: false }, { status: 409 });
      }

      const expiresAt = now + ttlMs;
      await this.state.storage.put(storageKey, { expiresAt });

      try {
        const currentAlarm = await this.state.storage.getAlarm();
        if (!currentAlarm || currentAlarm > expiresAt) {
          await this.state.storage.setAlarm(expiresAt);
        }
      } catch {
        // ignore
      }

      return json({ acquired: true, expiresAt });
    }

    if (action === 'release') {
      await this.state.storage.delete(storageKey);
      return json({ released: true });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  }

  async alarm(): Promise<void> {
    const now = Date.now();
    const list = await this.state.storage.list({ prefix: 'lock:' });
    const toDelete: string[] = [];

    for (const [k, v] of list.entries()) {
      const value = v as any;
      if (value && typeof value.expiresAt === 'number' && value.expiresAt <= now) {
        toDelete.push(String(k));
      }
    }

    if (toDelete.length) {
      await this.state.storage.delete(toDelete);
    }

    await this.state.storage.setAlarm(0);
  }
}

// Minimal default export for the worker runtime if this file is ever used as an entry.
// In our setup we re-export these classes from src/index.ts (the main worker).
export default {
  fetch: () => new Response("Durable Objects module loaded.", { status: 200 }),
};