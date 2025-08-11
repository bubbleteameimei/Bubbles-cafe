import { Express, Request, Response, NextFunction } from "express";
// import { config } from "../shared/config"; // Unused import

/**
 * Sets up CORS for cross-domain deployment
 * Use env FRONTEND_URL or FRONTEND_URLS (comma-separated) to configure allowed origins
 */
export function setupCors(app: Express) {
  // Collect allowed origins from env (support comma-separated list)
  const envOriginsRaw = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  // Normalize by stripping trailing slashes
  const normalize = (o: string) => o.replace(/\/$/, '');
  const envOrigins = Array.from(new Set(envOriginsRaw.map(normalize)));

  // Pre-compute hosts for sub-domain matching
  const envHosts = envOrigins
    .map(o => {
      try {
        return new URL(o).host;
      } catch {
        return undefined;
      }
    })
    .filter(Boolean) as string[];

  // Development defaults
  const devOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
  ];

  const isProd = process.env.NODE_ENV === 'production';

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = (req.headers.origin || '').replace(/\/$/, '');

    // Always vary on Origin for proxies/CDNs
    res.setHeader('Vary', 'Origin');

    // Allow list logic
    const allowedOrigins = isProd ? envOrigins : [...envOrigins, ...devOrigins];

    // Helper: determine if the request origin is permitted (supports sub-domains)
    const isAllowed = (originToCheck: string): boolean => {
      if (!originToCheck) return false;
      try {
        const { host } = new URL(originToCheck);
        // Direct host match or sub-domain of an allowed host
        return envHosts.some(allowedHost => host === allowedHost || host.endsWith(`.${allowedHost}`));
      } catch {
        return false;
      }
    };

    if (process.env.FRONTEND_URL === '*') {
      // Wildcard: no credentials per spec
      res.setHeader("Access-Control-Allow-Origin", "*");
      // Do not set Allow-Credentials with wildcard
    } else if (origin && (allowedOrigins.includes(origin) || isAllowed(origin))) {
      // Echo allowed origin and enable credentials
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else if (origin && !isProd) {
      // In dev, allow any origin for convenience
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else if (origin && isProd) {
      // In production, log blocked origins for debugging with allow-list context
      console.warn(`[CORS] Blocked unauthorized origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
    }

    // Allow specific headers
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token"
    );
    // Allow client JS to read Set-Cookie header (needed for CSRF/session)
    res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");

    // Allow specific methods
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    // Handle preflight
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    next();
  });
}