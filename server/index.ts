import express from "express";
import { createServer } from "http";
// Vite setup and static serving are imported dynamically by environment branch
import { db } from "./db";
import { posts } from "@shared/schema";
import { count } from "drizzle-orm";

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
import { globalRateLimiter } from "./middlewares/rate-limiter";
import { apiCache } from './middlewares/api-cache';
import { browserCache, etagCache } from './middlewares/browser-cache';
import { idempotency } from './middleware/idempotency';
import { ssrStreamHandler } from './ssr';

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
app.get('/api/health', async (_req, res) => {
  let dbStatus: 'connected' | 'error' = 'connected';
  try {
    await db.select().from(posts).limit(1);
  } catch {
    // swallow errors to avoid failing platform health checks
    dbStatus = 'error';
  }
  // Always return 200 with minimal payload, include db status for diagnostics
  res.json({ status: 'ok', db: dbStatus });
});

// Alias for platforms expecting `/health` at root (no /api prefix)
app.get('/health', async (_req, res) => {
  let dbStatus: 'connected' | 'error' = 'connected';
  try {
    await db.select().from(posts).limit(1);
  } catch {
    dbStatus = 'error';
  }
  res.json({ status: 'ok', db: dbStatus });
});

// Favicon fallback for legacy clients/bots that request /favicon.ico
// Redirects permanently to the 32x32 PNG used site-wide.
app.get('/favicon.ico', (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
  } catch {}
  res.redirect(301, '/icons/favicon-32x32.png');
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
    '/api/wordpress/sync/status',
    '/api/errors',
    '/api/payments/webhook'
  ]
}));

// Setup authentication
app.use((req, _res, next) => next());
setupAuth(app);

app.use('/api', globalRateLimiter);

if (config.cache.api) {
  app.use('/api', apiCache(config.cache.ttlMs));
}

app.use(helmet({
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com"],
      connectSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  }
}));

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
        path.startsWith("/stories") ||
        path.startsWith("/about") ||
        path.startsWith("/contact") ||
        path.startsWith("/privacy") ||
        path.startsWith("/community") ||
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
                const res = await fetch(healthUrl, { method: 'GET' });
                if (!res.ok) {
                  serverLogger.warn('Warm ping returned non-200', { status: res.status });
                }
              } catch (e) {
                serverLogger.warn('Warm ping failed', { error: e instanceof Error ? e.message : String(e) });
              }
            }, Math.max(60, intervalSec) * 1000); // do not allow < 60s to avoid spamming
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