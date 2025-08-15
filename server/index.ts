import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";
import { registerModularRoutes } from "./routes";
import { db } from "./db"; // Using the direct Neon database connection
import { posts } from "@shared/schema";
import { count } from "drizzle-orm";
import { seedDatabase } from "./seed";

import helmet from "helmet";
import compression from "compression";

import session from "express-session";
import { setupAuth } from "./auth";
import { setupOAuth } from "./oauth";
import { storage } from "./storage";
import { createLogger, requestLogger } from "./utils/debug-logger";
import { registerUserFeedbackRoutes } from "./routes/user-feedback";
import { registerRecommendationsRoutes } from "./routes/recommendations";


import { registerPrivacySettingsRoutes } from "./routes/privacy-settings";
import { registerWordPressSyncRoutes } from "./routes/wordpress-sync";
import { setupWordPressSyncSchedule } from "./wordpress-sync"; // Using the declaration file
import { registerAnalyticsRoutes } from "./routes/analytics"; // Analytics endpoints
import { registerEmailServiceRoutes } from "./routes/email-service"; // Email service routes
import { registerBookmarkRoutes } from "./routes/bookmark-routes"; // Bookmark routes
import { setCsrfToken, validateCsrfToken, csrfTokenToLocals, CSRF_TOKEN_NAME } from "./middleware/csrf-protection";
import { runMigrations } from "./migrations"; // Import our custom migrations
import { setupCors } from "./cors-setup";
import { handleError } from "./utils/error-handler";

import { config } from './config';

const app = express();
const isDev = config.isDev;
const PORT = config.port;
const HOST = '0.0.0.0';

// Create server instance outside startServer for proper cleanup
let server: ReturnType<typeof createServer>;

// Configure basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Configure CORS for cross-domain requests when deployed on Vercel/Render
setupCors(app);

// Session already handles cookies for us
// No additional cookie parser needed for CSRF protection

// Increase body parser limit for file uploads
app.use((req, _res, next) => {
  // Skip content-type check for multipart requests
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  next();
});

// Configure session
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.session.secure,
    httpOnly: true,
    sameSite: config.session.sameSite,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: storage.sessionStore
}));

// Setup CSRF protection
app.use(setCsrfToken(!isDev)); // Secure cookies in production
app.use(csrfTokenToLocals);

// Apply CSRF validation after routes that don't need it
app.use(validateCsrfToken({
  ignorePaths: [
    '/health', 
    '/api/health',
    '/api/auth/status', 
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password', // Allow password reset requests without CSRF protection
    '/api/auth/reset-password', // Allow password reset without CSRF protection
    '/api/auth/verify-reset-token', // Allow token verification without CSRF protection
    '/api/analytics/vitals', // Performance metrics endpoint
    '/api/wordpress/sync/status', // WordPress sync status check
    '/api/reader/bookmarks' // Allow anonymous bookmarks without CSRF protection
  ]
}));

// Setup authentication
app.use((req, _res, next) => next());
setupAuth(app);
setupOAuth(app);

// Add health check endpoint with CSRF token initialization
app.get('/health', (req, res) => {
  // Ensure a CSRF token is set
  if (!req.session.csrfToken) {
    const token = require('crypto').randomBytes(32).toString('hex');
    req.session.csrfToken = token;
    
    // Set the token as a cookie for client-side access
    res.cookie(CSRF_TOKEN_NAME, token, {
      httpOnly: false, // Must be accessible by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Required for cross-domain cookies
    });
  }
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    csrfToken: req.session.csrfToken 
  });
});

// Basic security headers
app.use(helmet({
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  }
}));

// Create a server logger
const serverLogger = createLogger('Server');

// Import our database setup utilities
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

    // Setup database connection first
    try {
      // Ensure DATABASE_URL is properly set
      serverLogger.info('Setting up database connection...');
      await setupDatabase();
      
      // Check database connection
      try {
        // This may fail if tables don't exist yet
        const [{ value: postsCount }] = await db.select({ value: count() }).from(posts);
        serverLogger.info('Database connected, tables exist', { postsCount });
        
        // Run migrations to ensure all tables defined in the schema exist
        serverLogger.info('Running database migrations to create missing tables...');
        await runMigrations();
        serverLogger.info('Database migrations completed');
    
        if (postsCount === 0) {
          serverLogger.info('Tables exist but no posts - seeding database from WordPress API...');
          await seedFromWordPressAPI();
          serverLogger.info('Database seeding from WordPress API completed');
        }
      } catch (tableError) {
        serverLogger.warn('Database tables check failed, attempting to create schema', { 
          error: tableError instanceof Error ? tableError.message : 'Unknown error' 
        });
        
        // If tables don't exist, push the schema
        serverLogger.info('Creating database schema...');
        await pushSchema();
        serverLogger.info('Schema created, seeding data from WordPress API...');
        
        try {
          await seedFromWordPressAPI();
          serverLogger.info('Database seeding from WordPress API completed');
        } catch (seedError) {
          serverLogger.error('Error seeding from WordPress API, falling back to XML seeding', {
            error: seedError instanceof Error ? seedError.message : 'Unknown error'
          });
          
          // Fall back to XML seeding if WordPress API fails
          await seedDatabase();
          serverLogger.info('Database seeding from XML completed');
        }
      }
    } catch (dbError) {
      serverLogger.error('Critical database setup error', { 
        error: dbError instanceof Error ? dbError.message : 'Unknown error' 
      });
      throw dbError;
    }

    // Create server instance
    server = createServer(app);

    // Setup routes based on environment
    if (isDev) {
      serverLogger.info('Setting up development environment');
      
      // Add global request logging in development
      app.use(requestLogger);
      
      // Register modular routes (replaces legacy monolithic routes)
      const { registerModularRoutes } = await import('./routes');
      registerModularRoutes(app);
      registerEmailServiceRoutes(app);
      registerBookmarkRoutes(app);
      registerWordPressSyncRoutes(app);

      // Setup WordPress sync schedule (run every 5 minutes)
      setupWordPressSyncSchedule(5 * 60 * 1000);

      await setupVite(app, server);
    } else {
      serverLogger.info('Setting up production environment');
      
      // Register modular routes (replaces legacy monolithic routes)
      const { registerModularRoutes } = await import('./routes');
      registerModularRoutes(app);
      registerEmailServiceRoutes(app);
      registerBookmarkRoutes(app);
      registerWordPressSyncRoutes(app);

      // Setup WordPress sync schedule (run every 5 minutes)
      setupWordPressSyncSchedule(5 * 60 * 1000);

      serveStatic(app);
    }

    // Start listening with enhanced error handling and port notification
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      
      // Log that we're about to start listening
      console.log(`Attempting to start server on http://${HOST}:${PORT}...`);
      
      server.listen(PORT, HOST, () => {
        const bootDuration = Date.now() - startTime;
        console.log(`✅ Server started successfully on http://${HOST}:${PORT} in ${bootDuration}ms`);
        serverLogger.info('Server started successfully', { 
          url: `http://${HOST}:${PORT}`,
          bootTime: `${bootDuration}ms`
        });

        // Send port readiness signal
        if (process.send) {
          process.send({
            port: PORT,
            wait_for_port: true,
            ready: true
          });
          console.log('Sent port readiness signal to process');
          serverLogger.debug('Sent port readiness signal');
        }
        
        // Wait for a moment to ensure the server is fully ready
        setTimeout(() => {
          console.log('Server is now fully ready to accept connections');
        }, 1000);

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
  } catch (error) {
    serverLogger.error('Critical startup error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  serverLogger.error('Critical startup error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  serverLogger.info('SIGTERM received, initiating graceful shutdown');
  server?.close(() => {
    serverLogger.info('Server closed successfully');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  serverLogger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  
  // Give time for the error to be logged before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, _promise) => {
  serverLogger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  });
});

export default app;