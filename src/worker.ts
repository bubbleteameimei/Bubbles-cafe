// Minimal Cloudflare Worker entry for edge logic
// - Provides a health check route
// - Echoes request info
// - Example: proxy to backend or add custom logic as needed

export default {
  async fetch(request: Request, _env: Record<string, unknown>, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/__health") {
      return new Response(JSON.stringify({ ok: true, timestamp: Date.now() }), {
        headers: { "content-type": "application/json" },
      });
    }

    // Example edge logic: hello endpoint
    if (url.pathname === "/hello") {
      return new Response("Hello from Bubbles Cafe Worker", { headers: { "content-type": "text/plain" } });
    }

    // Default: echo method, path, and headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return new Response(
      JSON.stringify({
        method: request.method,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams.entries()),
        headers,
      }),
      { headers: { "content-type": "application/json" } }
    );
  },
};