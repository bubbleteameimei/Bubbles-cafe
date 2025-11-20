// durable-objects.ts (The NEW Durable Object Host File)

// Note: json() is an itty-router utility, but DOs should use standard Response/JSON.stringify
const json = (data: any, init?: ResponseInit) => new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    status: init?.status || 200,
});

// ============================================================================
// DURABLE OBJECTS
// ============================================================================

export class RateLimitObject {
  private state: DurableObjectState;
  private buckets: Map<string, { tokens: number; lastRefill: number }>;

  // Added 'env: any' for correct constructor signature
  constructor(state: DurableObjectState, env: any) { 
    this.state = state;
    this.buckets = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const { key, limit, window } = (await request.json()) as any;
    const now = Date.now();
    const bucket = this.buckets.get(key) || { tokens: limit, lastRefill: now };

    const timePassed = (now - bucket.lastRefill) / 1000;
    // Calculate new tokens based on time passed and refill rate (limit/window)
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
  // response type changed to any for JSON compatibility
  private responses: Map<string, { response: any; timestamp: number }>; 

  // Added 'env: any' for correct constructor signature
  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.responses = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const { key, response, ttl } = (await request.json()) as any;

    if (this.responses.has(key)) {
      return json({ cached: true, response: this.responses.get(key)!.response });
    }

    this.responses.set(key, { response, timestamp: Date.now() });

    // NOTE on TTL: setTimeout is unreliable in DOs. For real production, 
    // you should use state.storage.put() and state.storage.setAlarm() 
    // for cleanup, but we keep your original logic structure here.
    setTimeout(() => {
      this.responses.delete(key);
    }, ttl || 86400000);

    return json({ cached: false });
  }
}

export class LocksObject {
  private state: DurableObjectState;
  private locks: Map<string, boolean>;

  // Added 'env: any' for correct constructor signature
  constructor(state: DurableObjectState, env: any) {
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
// MODULE EXPORT (Required)
// ============================================================================

// The named exports are what Cloudflare looks for based on the class_name bindings.
export { RateLimitObject, IdempotencyObject, LocksObject };

// Minimal default export for the worker runtime.
export default {
  fetch: () => new Response("Durable Object Host is running.", { status: 200 })
}
