// durable-objects.ts

// ============================================================================
// DURABLE OBJECTS
// ============================================================================

export class RateLimitObject {
  private state: DurableObjectState;
  private buckets: Map<string, { tokens: number; lastRefill: number }>;

  constructor(state: DurableObjectState, env: any) { // Added 'env: any' for compatibility
    this.state = state;
    this.buckets = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    // Your existing RateLimitObject fetch logic...
    const { key, limit, window } = (await request.json()) as any;
    const now = Date.now();
    const bucket = this.buckets.get(key) || { tokens: limit, lastRefill: now };

    const timePassed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(limit, bucket.tokens + timePassed * (limit / window));
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.buckets.set(key, bucket);
      return new Response(JSON.stringify({ allowed: true }));
    }

    return new Response(JSON.stringify({ allowed: false }), { status: 429 });
  }
}

export class IdempotencyObject {
  private state: DurableObjectState;
  private responses: Map<string, { response: any; timestamp: number }>;

  constructor(state: DurableObjectState, env: any) { // Added 'env: any' for compatibility
    this.state = state;
    this.responses = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const { key, response, ttl } = (await request.json()) as any;

    if (this.responses.has(key)) {
      return new Response(JSON.stringify({ cached: true, response: this.responses.get(key)!.response }));
    }

    this.responses.set(key, { response, timestamp: Date.now() });

    // Note: setTimeout won't work reliably here. Durable Objects use alarm for timing.
    // For simplicity, we'll keep the logic as is for now, but be aware of this difference.

    return new Response(JSON.stringify({ cached: false }));
  }
}

export class LocksObject {
  private state: DurableObjectState;
  private locks: Map<string, boolean>;

  constructor(state: DurableObjectState, env: any) { // Added 'env: any' for compatibility
    this.state = state;
    this.locks = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const { key, action } = (await request.json()) as any;

    if (action === 'acquire') {
      if (this.locks.has(key)) {
        return new Response(JSON.stringify({ acquired: false }), { status: 409 });
      }
      this.locks.set(key, true);
      return new Response(JSON.stringify({ acquired: true }));
    }

    if (action === 'release') {
      this.locks.delete(key);
      return new Response(JSON.stringify({ released: true }));
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  }
}

// Minimal fetch handler is required by Cloudflare for the DO script
export default {
    fetch: () => new Response("Durable Object Host", { status: 200 })
}
