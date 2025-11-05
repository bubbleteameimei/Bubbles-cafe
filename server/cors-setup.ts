import { Express, Request, Response, NextFunction } from "express";

/**
 * Sets up CORS for cross-domain deployment
 * This file should be imported and used in server/index.ts
 * when deploying the backend separately from the frontend
 * 
 * Usage:
 * import { setupCors } from "./cors-setup";
 * 
 * // Add after initializing Express
 * setupCors(app);
 */
export function setupCors(app: Express) {
  // List of allowed origins
  const allowedOrigins = [
    // Production frontend URL
    process.env.FRONTEND_URL,
    // Public backend base URL (permit for non-browser clients and occasional same-origin fetches)
    process.env.BACKEND_BASE_URL,
    // Allow Google Identity Services origin for redirect/One Tap posts
    "https://accounts.google.com",
    // Development URLs
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
  ].filter((v): v is string => typeof v === 'string' && v.length > 0); // ensure string[]

  // Normalize helper to compare by origin string
  const normalize = (s: string) => {
    try {
      const u = new URL(s);
      return `${u.protocol}//${u.host}`;
    } catch {
      return s;
    }
  };
  const normalizedAllowed = new Set<string>(allowedOrigins.map((s) => normalize(s)));

  // Replit preview allowlist patterns
  const isReplitOrigin = (o?: string) => !!o && (
    /\.repl\.co$/.test(o) || /\.replit\.dev$/.test(o) || /\.replit\.app$/.test(o) || o.includes('.replit.') || o.includes('repl.co')
  );

  // Vercel preview domains (*.vercel.app, *.vercel.dev)
  const isVercelOrigin = (o?: string) => !!o && (
    /\.vercel\.app$/.test(o) || /\.vercel\.dev$/.test(o)
  );

  // CORS middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin ? String(req.headers.origin) : undefined;

    console.log(`[CORS] Request from origin: ${origin || 'none'}, NODE_ENV: ${process.env.NODE_ENV}`);

    // Helper to compute naive registrable domain (eTLD+1) for same-site allowances.
    const getRoot = (host?: string): string | null => {
      if (!host) return null;
      try {
        const h = host.toLowerCase().split(':')[0].trim();
        const parts = h.split('.');
        if (parts.length < 2) return h; // localhost or simple host
        return parts.slice(-2).join('.');
      } catch {
        return null;
      }
    };

    const originNormalized = origin ? normalize(origin) : undefined;
    const originHost = (() => {
      try { return origin ? new URL(origin).host : undefined; } catch { return undefined; }
    })();
    const originRoot = getRoot(originHost);
    const apiHostHeader = String(req.headers.host || '');
    const apiHost = apiHostHeader.split(',')[0].trim();
    const apiRoot = getRoot(apiHost);

    // Allow specific origins and include credentials
    if (origin && normalizedAllowed.has(originNormalized!)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      console.log(`[CORS] Allowed configured origin: ${origin}`);
    }
    // Same-site family: allow origins that share the same registrable domain as the API host (e.g., bubblescafe.space <-> api.bubblescafe.space)
    else if (origin && originRoot && apiRoot && originRoot === apiRoot) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      console.log(`[CORS] Allowed same-site origin: ${origin} (root: ${originRoot})`);
    }
    // Check for Replit domains (works for both dev and prod)
    else if (isReplitOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin as string);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      console.log(`[CORS] Allowed Replit domain: ${origin}`);
    }
    // Allow Vercel preview domains (works in production previews)
    else if (isVercelOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin as string);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      console.log(`[CORS] Allowed Vercel preview domain: ${origin}`);
    }
    // If no match but we're not in production, allow the origin anyway for development convenience
    else if (origin && process.env.NODE_ENV !== 'production') {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      console.log(`[CORS] Allowed unlisted origin in development: ${origin}`);
    }
    // In production, be more restrictive but still log what's being blocked
    else if (origin && process.env.NODE_ENV === 'production') {
      console.warn(`[CORS] Blocked unauthorized origin in production: ${origin}`);
    }
    // No origin header (like direct API calls)
    else if (!origin) {
      // No credentials for wildcard; do not set credentials when origin is absent
      res.setHeader("Access-Control-Allow-Origin", "*");
      console.log(`[CORS] Allowed request without origin header`);
    }

    // Allow specific headers
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token"
    );

    // Allow specific methods
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    next();
  });

  console.log("CORS middleware configured for cross-domain deployment");
}