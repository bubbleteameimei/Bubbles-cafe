import express from "express";
import { createServer } from "http";
// Vite setup and static serving are imported dynamically by environment branch
import { db } from "./db";
import { posts } from "@shared/schema";
import { count, sql } from "drizzle-orm";

import helmet from "helmet";
import compression from "compression";

import session from "express-session";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { createLogger, requestLogger } from "./utils/debug-logger";
import { requestIdMiddleware } from "./utils/request-id";

import { registerWordPressSyncRoutes } from "./routes/wordpress-sync";
import { registerEmailServiceRoutes } from "./routes/email-service";
import { registerBookmarkRoutes } from "./routes/bookmark-routes";
import { registerPaymentRoutes } from "./routes/payment";
import { setCsrfToken, validateCsrfToken, csrfTokenToLocals } from "./middleware/csrf-protection";
import { runMigrations } from "./migrations";
import { setupCors } from "./cors-setup";

import { config } from './config';
import { wordpressScheduler } from './wordpress-scheduler';
import { applyPerformanceMiddleware } from './middleware';
import { applySecurityMiddleware } from './middleware/security-validation';
import { globalRateLimiter } from "./middlewares/rate-limiter";
import { apiCache } from './middlewares/api-cache';
import { browserCache, etagCache } from './middlewares/browser-cache';
import { idempotency } from './middleware/idempotency';
import { ssrStreamHandler, readerPreviewHandler, aboutPreviewHandler, storyPreviewHandler } from './ssr';
import path from "path";
import fs from "fs";

const app = express();
if (process.env.ENABLE_TRACING === 'true') {
  (async () => {
    try {
      const mod = await import('./utils/otel');
      (mod as any).startOtel?.('bubbles-cafe');
    } catch {}
  })();
}
app.set('trust proxy', 1);
app.disable('x-powered-by');
const isDev = config.isDev;
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const HOST = '0.0.0.0';

// Enforce HTTPS in production based on trust proxy and X-Forwarded-Proto
if (!isDev) {
  app.use((req, res, next) => {
    try {
      const xfp = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
      const secure = req.secure || xfp === 'https';
      if (!secure) {
        const host = String(req.headers.host || '');
        const location = `https://${host}${req.originalUrl || '/'}`;
        return res.redirect(308, location);
      }
    } catch {}
    next();
  });
}

let server: ReturnType<typeof createServer>;

app.use(requestIdMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(idempotency());

if (config.isDev && config.dev.requestLogging) {
  app.use(requestLogger);
}

setupCors(app);

// Increase body parser limit for file uploads
app.use((req, _res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  next();
});

// Fast-path health endpoint before session middleware to minimize overhead
// The DB check is bounded by a very small timeout so platform health checks never block.
app.get('/api/health', async (_req, res) => {
  const started = Date.now();
  try { res.setHeader('Cache-Control', 'no-store, max-age=0'); } catch {}

  const timeoutMs = Number(process.env.HEALTH_DB_TIMEOUT_MS || 200);

  // Only attempt a DB check if a URL is configured
  const hasDbUrl =
    !!(process.env.DATABASE_URL ||
      process.env.SUPABASE_POOLER_URL ||
      process.env.SUPABASE_CONNECTION_POOLER_URL ||
      process.env.DB_POOLER_URL);

  let dbStatus: 'connected' | 'error' | 'timeout' | 'disabled' = 'disabled';

  if (hasDbUrl) {
    try {
      const result = await Promise.race<string>([
        (async () => {
          try {
            await db.select().from(posts).limit(1);
            return 'connected';
          } catch {
            return 'error';
          }
        })(),
        new Promise<string>((resolve) => setTimeout(() => resolve('timeout'), timeoutMs)),
      ]);
      dbStatus = (result as any);
    } catch {
      dbStatus = 'error';
    }
  }

  res.json({
    status: 'ok',
    db: dbStatus,
    uptimeSec: Math.round(process.uptime()),
    latencyMs: Date.now() - started,
    now: new Date().toISOString(),
  });
});

// Alias for platforms expecting `/health` at root (no /api prefix)
// Keep this ultra-lightweight for external uptime pingers.
app.get('/health', (_req, res) => {
  try { res.setHeader('Cache-Control', 'no-store, max-age=0'); } catch {}
  res.json({ status: 'ok' });
});

// Favicon handler for legacy clients/bots that request /favicon.ico
// Serve client/public/favicon.png if present; otherwise fall back to generated PNG.
app.get('/favicon.ico', (_req, res) => {
  try { res.setHeader('Cache-Control', 'no-cache, must-revalidate'); } catch {}
  try {
    const candidatePaths = [
      // Prefer client/public/favicon.png during dev
      path.resolve(process.cwd(), 'client', 'public', 'favicon.png'),
      // Prefer dist/public/favicon.png in production builds if present
      path.resolve(process.cwd(), 'dist', 'public', 'favicon.png'),
    ];
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          res.type('image/png');
          return res.sendFile(p);
        }
      } catch {}
    }
  } catch {}
  // Fall back to generated 32x32 PNG
  res.redirect(301, '/icons/favicon-32x32.png');
});

// Ensure favicon.png is also served without cache to reflect updates immediately in Chrome
app.get('/favicon.png', (_req, res) => {
  try { res.setHeader('Cache-Control', 'no-cache, must-revalidate'); } catch {}
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), 'client', 'public', 'favicon.png'),
      path.resolve(process.cwd(), 'dist', 'public', 'favicon.png'),
    ];
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          res.type('image/png');
          return res.sendFile(p);
        }
      } catch {}
    }
  } catch {}
  res.status(404).end('Not Found');
});

// OG share image hard route to avoid 404 during crawler fetch
app.get('/og-image-1200x630.png', (_req, res) => {
  try { res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); } catch {}
  try {
    const candidates = [
      // Production build path
      path.resolve(process.cwd(), 'dist', 'public', 'og-image-1200x630.png'),
      // Dev/public path
      path.resolve(process.cwd(), 'client', 'public', 'og-image-1200x630.png'),
      // Root public fallback
      path.resolve(process.cwd(), 'public', 'og-image-1200x630.png'),
      // Extra fallbacks: allow asset to live under src/assets during dev
      path.resolve(process.cwd(), 'client', 'src', 'assets', 'og-image-1200x630.png'),
      path.resolve(process.cwd(), 'client', 'src', 'assets', 'images', 'og-image-1200x630.png'),
      path.resolve(process.cwd(), 'client', 'src', 'assets', 'img', 'og-image-1200x630.png'),
      path.resolve(process.cwd(), 'assets', 'og-image-1200x630.png'),
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          res.type('image/png');
          return res.sendFile(p);
        }
      } catch {}
    }
  } catch {}
  // Fall back to the 512x512 logo to avoid missing previews
  res.redirect(302, '/icons/icon-512x512.png');
});

// Trailing slash normalization (GET requests only, except root)
app.use((req, res, next) => {
  try {
    if (req.method === 'GET') {
      const original = req.originalUrl || req.url || '';
      const idx = original.indexOf('?');
      const pathOnly = idx >= 0 ? original.slice(0, idx) : original;
      const qs = idx >= 0 ? original.slice(idx) : '';
      if (pathOnly.length > 1 && /\/+$/.test(pathOnly)) {
        const normalized = pathOnly.replace(/\/+$/, '');
        return res.redirect(308, normalized + qs);
      }
    }
  } catch {}
  next();
});

// Alias canonicalization: use preferred URL structure
app.get('/stories', (_req, res) => res.redirect(308, '/index'));
app.get('/story/:slug', (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim();
    return res.redirect(308, `/reader/${encodeURIComponent(slug)}`);
  } catch {
    return res.redirect(308, '/reader');
  }
});



// Session
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.session.secure,
    httpOnly: true,
    sameSite: config.session.sameSite,
    maxAge: 24 * 60 * 60 * 1000
  },
  store: storage.sessionStore
}));

// CSRF protection (skip health endpoints to avoid touching session)
app.use(setCsrfToken(!isDev, { ignorePaths: ['/api/health'] }));
app.use(csrfTokenToLocals);

app.use(validateCsrfToken({
  ignorePaths: [
    '/api/health',
    '/api/auth/status',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-reset-token',
    '/api/auth/callback',
    '/api/auth/supabase/login',
    '/api/auth/supabase/callback',
    '/api/analytics/vitals',
    '/api/analytics/performance',
    '/api/analytics/pageview',
    '/api/analytics/interaction',
    '/api/wordpress/sync/status',
    '/api/errors',
    '/api/payments/webhook'
  ]
}));

// Apply additional security validations and headers after session & CSRF
app.use(applySecurityMiddleware());

// Setup authentication
app.use((req, _res, next) => next());
setupAuth(app);

app.use('/api', globalRateLimiter);

if (config.cache.api) {
  app.use('/api', apiCache(config.cache.ttlMs));
}

app.use(helmet({
  // Harden CSP while keeping required functionality for inline pre-paint script and font loader
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      // Allow inline styles applied by the pre-paint script; external styles from Google Fonts
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "fonts.googleapis.com"],
      fontSrc: ["'self'", "https:", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      // Permit the inline theme bootstrap and Google Identity scripts
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://apis.google.com"
      ],
      // Allow HTTPS connections (API, Supabase, WordPress, third-party fonts)
      connectSrc: [
        "'self'",
        "https:"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      frameAncestors: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Enforce HSTS in production (one year, include subdomains)
if (!isDev) {
  app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: false
  }));
}

app.use((req, res, next) => {
  try {
    const accept = String(req.headers.accept || "");
    const isHtml = accept.includes("text/html");
    const path = (req.path || "");
    if (
      req.method === "GET" &&
      (isHtml ||
        path === "/" ||
        path.startsWith("/reader") ||
        path.startsWith("/index") ||
        path.startsWith("/about") ||
        path.startsWith("/contact") ||
        path.startsWith("/privacy") ||
        path.startsWith("/community") ||
        path.startsWith("/community-story") ||
        path.startsWith("/best-stories") ||
        path.startsWith("/curated") ||
        path.startsWith("/editors-picks") ||
        path.startsWith("/edens-hollow") ||
        path.startsWith("/submit-story"))
    ) {
      res.setHeader("X-Robots-Tag", "index, follow");
    } else if (
      req.method === "GET" &&
      (path.startsWith("/admin") ||
        path.startsWith("/search") ||
        path.startsWith("/auth") ||
        path.startsWith("/reset-password") ||
        path.startsWith("/settings") ||
        path.startsWith("/profile") ||
        path.startsWith("/bookmarks") ||
        path.startsWith("/notifications") ||
        path.startsWith("/recommendations") ||
        path.startsWith("/user"))
    ) {
      // Prevent indexing of utility and user-specific pages; allow following links where appropriate
      const disallowFollow = path.startsWith("/admin") || path.startsWith("/auth");
      res.setHeader("X-Robots-Tag", disallowFollow ? "noindex, nofollow" : "noindex, follow");
    }
  } catch {}
  next();
});

if (config.cache.browser) {
  app.use(etagCache());
  app.use(browserCache());
}

const serverLogger = createLogger('Server');

// One-off baseline normalization utility
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
function seededRandom(n: number) {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}
async function normalizeBaselines(force: boolean): Promise<void> {
  const whereClause = force
    ? sql`TRUE`
    : sql`
        COALESCE(baseline_likes, 0) = 0 OR
        COALESCE(baseline_dislikes, 0) = 0 OR
        baseline_likes < 100 OR baseline_likes > 200 OR
        baseline_dislikes < 3 OR baseline_dislikes > 7
      `;
  const result = await db.execute(sql`
    SELECT id, slug, baseline_likes AS "baselineLikes", baseline_dislikes AS "baselineDislikes"
    FROM posts
    WHERE ${whereClause}
  `);
  const rows = (result as any).rows || [];
  for (const row of rows) {
    const id = Number(row.id);
    const slug = String(row.slug || `post-${id}`);
    // Deterministic per-slug baseline in desired ranges
    const seedNum = slug ? hashSeed(slug) : id;
    const seed = seedNum * 12345;
    const likesBase = Math.floor(seededRandom(seed) * (200 - 100 + 1)) + 100;
    const dislikesBase = Math.floor(seededRandom(seed + 999) * (7 - 3 + 1)) + 3;
    await db.execute(sql`
      UPDATE posts
      SET baseline_likes = ${likesBase}, baseline_dislikes = ${dislikesBase}
      WHERE id = ${id}
    `);
  }
}

import setupDatabase from '../scripts/setup-db';
import pushSchema from '../scripts/db-push';
import seedFromWordPressAPI from '../scripts/api-seed';

async function startServer() {
  try {
    serverLogger.info('Starting server initialization', {
      environment: process.env.NODE_ENV,
      host: HOST,
      port: PORT
    });

    server = createServer(app);

    if (isDev) {
      serverLogger.info('Setting up development environment');

      const { registerModularRoutes } = await import('./routes');
      registerModularRoutes(app);
      registerEmailServiceRoutes(app);
      registerBookmarkRoutes(app);
      registerWordPressSyncRoutes(app);
      registerPaymentRoutes(app);

      app.use('/api/*', (_req, res) => res.status(404).json({ error: 'Not found' }));

      if (config.wordpress.schedulerEnabled) {
        wordpressScheduler.start();
      }

      const { setupVite } = await import('./vite');
      await setupVite(app, server);
      // Serve minimal server-rendered head for key pages so social crawlers see OG meta without JS
      app.get('/reader/:slug', readerPreviewHandler);
      app.get('/story/:slug', storyPreviewHandler);
      app.get('/about', aboutPreviewHandler);
      app.get('/ssr', ssrStreamHandler);
    } else {
      serverLogger.info('Setting up production environment');

      const { registerModularRoutes } = await import('./routes');
      registerModularRoutes(app);
      registerEmailServiceRoutes(app);
      registerBookmarkRoutes(app);
      registerWordPressSyncRoutes(app);
      registerPaymentRoutes(app);

      app.use('/api/*', (_req, res) => res.status(404).json({ error: 'Not found' }));

      if (config.wordpress.schedulerEnabled) {
        wordpressScheduler.start();
      }

      

      const { serveStatic } = await import('./vite');

      // Redirect non-API traffic reaching the API domain to the canonical frontend
      // This prevents loading the SPA from api.bubblescafe.space and avoids broken vendor paths (e.g., /_vercel/*)
      try {
        const frontendBase = (process.env.FRONTEND_URL || 'https://bubblescafe.space').replace(/\/$/, '');
        const apiHost = (() => {
          try {
            const u = new URL(process.env.BACKEND_BASE_URL || 'https://api.bubblescafe.space');
            return u.host.toLowerCase();
          } catch {
            return 'api.bubblescafe.space';
          }
        })();

        app.use((req, res, next) => {
          try {
            const host = String(req.headers.host || '').toLowerCase();
            if (host === apiHost || host.startsWith(apiHost + ':')) {
              const p = req.path || '';
              // Allow health and API endpoints to proceed on the API domain
              if (p === '/health' || p.startsWith('/api')) return next();
              // Redirect everything else (static/SPA routes) to the public frontend
              const location = frontendBase + (req.originalUrl || '/');
              return res.redirect(308, location);
            }
          } catch {}
          next();
        });
      } catch {}

      // Canonicalize legacy routes
      app.get('/auth-success', (_req, res) => res.redirect(308, '/auth/success'));
      app.get('/admin/posts', (_req, res) => res.redirect(308, '/admin/manage-posts'));

      // Key pages: respond with SSR head first so crawlers get OG meta
      app.get('/reader/:slug', readerPreviewHandler);
      app.get('/story/:slug', storyPreviewHandler);
      app.get('/about', aboutPreviewHandler);
      serveStatic(app);
      if (process.env.ENABLE_SSR === 'true') {
        app.get('/ssr', ssrStreamHandler);
      }
    }

    const listeningPromise = new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      try { process.stderr.write(`Starting server on http://${HOST}:${PORT}...\n`); } catch {}

      server.listen(PORT, HOST, () => {
        const bootDuration = Date.now() - startTime;
        try {
          process.stderr.write(`Server listening on http://${HOST}:${PORT} (boot ${bootDuration}ms)\n`);
        } catch {}
        serverLogger.info('Server started successfully', { 
          url: `http://${HOST}:${PORT}`,
          bootTime: `${bootDuration}ms`,
          pid: process.pid
        });

        if (process.send) {
          try {
            process.send({
              port: PORT,
              wait_for_port: true,
              ready: true
            });
          } catch {}
          serverLogger.debug('Sent port readiness signal', { port: PORT });
        }

        // Keep-warm pings to avoid cold starts and keep Supabase connection hot
        try {
          const enabled = (process.env.ENABLE_WARM_PINGS ?? (config.isProd ? 'true' : 'false')) === 'true';
          if (enabled) {
            const intervalSec = Number(process.env.WARM_PING_INTERVAL_SECONDS || 900); // default 15 minutes
            const healthUrl = (process.env.HEALTH_PING_URL || '').trim() ||
              `http://127.0.0.1:${PORT}/api/health`;
            serverLogger.info('Warm pings enabled', { intervalSec, healthUrl });

            setInterval(async () => {
              try {
                const controller = new AbortController();
                const timeout = Number(process.env.WARM_PING_TIMEOUT_MS || 4000);
                const timer = setTimeout(() => controller.abort(), timeout);
                const res = await fetch(healthUrl, {
                  method: 'GET',
                  signal: controller.signal,
                  cache: 'no-store',
                  // keepalive hints the runtime to allow the request even when shutting down
                  keepalive: true as any
                });
                clearTimeout(timer);
                if (!res.ok) {
                  serverLogger.warn('Warm ping returned non-200', { status: res.status });
                }
              } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                serverLogger.warn('Warm ping failed', { error: msg });
              }
            }, Math.max(60, intervalSec) * 1000); // do not allo <w 60s to avoid spa_codemmnewi</ng
          }
        } catch (e) {
          serverLogger.warn('Failed to set up warm pings', { error: e instanceof Error ? e.message : String(e) });
        }

        resolve();
      });

      server.on('error', (error: Error & { code?: string }) => {
        if (error.code === 'EADDRINUSE') {
          serverLogger.error('Port already in use', { port: PORT });
        } else {
          serverLogger.error('Server error', { 
            error: error.message,
            code: error.code,
            stack: error.stack 
          });
        }
        reject(error);
      });
    });

    (async () => {
      try {
        serverLogger.info('Setting up database connection...');
        await setupDatabase();

        try {
          applyPerformanceMiddleware(app, db);
        } catch (e) {
          try { process.stderr.write(`Performance middleware setup failed: ${e instanceof Error ? e.message : String(e)}\n`); } catch {}
        }

        try {
          serverLogger.info('Running database migrations...');
          await runMigrations();
          serverLogger.info('Database migrations completed');

          const [{ value: postsCount }] = await db.select({ value: count() }).from(posts);
          serverLogger.info('Database connected, tables exist', { postsCount });
          // Run baseline normalization (default enabled; can be disabled via RUN_BASELINE_NORMALIZE=false)
          try {
            const runNormalize = String(process.env.RUN_BASELINE_NORMALIZE ?? 'true').toLowerCase() === 'true';
            const forceNormalize = String(process.env.RUN_BASELINE_NORMALIZE_FORCE ?? 'true').toLowerCase() === 'true';
            if (runNormalize) {
              serverLogger.info('Running baseline normalization', { force: forceNormalize });
              await normalizeBaselines(forceNormalize);
              serverLogger.info('Baseline normalization completed');
            }
          } catch (normErr) {
            serverLogger.warn('Baseline normalization failed', { error: normErr instanceof Error ? normErr.message : String(normErr) });
          }

          if (postsCount === 0) {
            serverLogger.info('No posts found - seeding from WordPress API...');
            try {
              await seedFromWordPressAPI();
              serverLogger.info('Initial API seeding completed');
            } catch (seedError) {
              serverLogger.error('WordPress API seeding failed', {
                error: seedError instanceof Error ? seedError.message : 'Unknown error'
              });
            }
          }
        } catch (dbError) {
          serverLogger.error('Database setup failed', { 
            error: dbError instanceof Error ? dbError.message : 'Unknown error' 
          });

          serverLogger.info('Attempting to create database schema...');
          try {
            await pushSchema();
            serverLogger.info('Schema created successfully');

            // Ensure post-schema migrations (including column renames) are applied
            serverLogger.info('Running migrations after schema creation...');
            try {
              await runMigrations();
              serverLogger.info('Post-schema migrations completed');
            } catch (migErr) {
              serverLogger.error('Post-schema migrations failed', {
                error: migErr instanceof Error ? migErr.message : 'Unknown error'
              });
            }

            // Re-check posts count before deciding to seed
            try {
              const [{ value: postsCountAfter }] = await db.select({ value: count() }).from(posts);
              serverLogger.info('Database connected after schema creation', { postsCount: postsCountAfter });
              // Run baseline normalization after schema creation (default enabled)
              try {
                const runNormalize = String(process.env.RUN_BASELINE_NORMALIZE ?? 'true').toLowerCase() === 'true';
                const forceNormalize = String(process.env.RUN_BASELINE_NORMALIZE_FORCE ?? 'true').toLowerCase() === 'true';
                if (runNormalize) {
                  serverLogger.info('Running baseline normalization', { force: forceNormalize });
                  await normalizeBaselines(forceNormalize);
                  serverLogger.info('Baseline normalization completed');
                }
              } catch (normErr) {
                serverLogger.warn('Baseline normalization failed', { error: normErr instanceof Error ? normErr.message : String(normErr) });
              }
              
              if (postsCountAfter === 0) {
                serverLogger.info('Seeding from WordPress API after schema creation...');
                try {
                  await seedFromWordPressAPI();
                  serverLogger.info('API seeding completed after schema creation');
                } catch (seedErr) {
                  serverLogger.error('API seeding failed after schema creation', {
                    error: seedErr instanceof Error ? seedErr.message : 'Unknown error'
                  });
                }
              } else {
                serverLogger.info('Skipping seeding: posts already present');
              }
            } catch (countErr) {
              serverLogger.error('Failed to read posts count after schema creation', {
                error: countErr instanceof Error ? countErr.message : 'Unknown error'
              });
            }
          } catch (finalError) {
            serverLogger.error('Critical database setup failure', {
              error: finalError instanceof Error ? finalError.message : 'Unknown error'
            });
          }
        }
      } catch (dbError) {
        serverLogger.error('Critical database setup error', { 
          error: dbError instanceof Error ? dbError.message : 'Unknown error' 
        });
      }
    })();

    return listeningPromise;
  } catch (error) {
    serverLogger.error('Critical startup error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

startServer().catch(error => {
  serverLogger.error('Critical startup error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  });
});

process.on('SIGTERM', () => {
  serverLogger.info('SIGTERM received, initiating graceful shutdown');
  server?.close(() => {
    serverLogger.info('Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  serverLogger.info('SIGINT received, initiating graceful shutdown');
  server?.close(() => {
    serverLogger.info('Server closed successfully');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  serverLogger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, _promise) => {
  const errorMessage = reason instanceof Error ? reason.message : String(reason);
  const errorStack = reason instanceof Error ? reason.stack : undefined;

  serverLogger.error('Unhandled promise rejection', {
    reason: errorMessage,
    stack: errorStack
  });
});

export default app;