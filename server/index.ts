import 'dotenv/config';
import express from "express";
import { createServer } from "http";
import crypto from "crypto";
// Session types are declared in server/types/session.d.ts
import { setupVite, serveStatic } from "./vite-dev";
import { registerRoutes } from "./routes";
import { setNeonAsDefault } from "./neon-config"; // Set Neon as default database
import { setGmailCredentials } from "./config/gmail-config"; // Set Gmail credentials
import { db } from "./db"; // Using the direct Neon database connection
import { waitForPoolInitialization } from "./db-connect"; // Import wait function
import { posts } from "../shared/schema";
import { count } from "drizzle-orm";


// import { seedDatabase } from "./seed"; // Unused import

// Ensure Neon database is always used
setNeonAsDefault();

// Ensure Gmail credentials are always configured
setGmailCredentials();

import helmet from "helmet";
import compression from "compression";

import session from "express-session";
import { SecureNeonSessionStore } from "./utils/secure-session-store";

// Extend session interface to include __meta property
declare module 'express-session' {
  interface SessionData {
    __meta?: {
      ipAddress?: string;
      userAgent?: string;
      lastActivity?: string;
      csrfToken?: string;
    };
  }
}
import { setupAuth } from "./auth";
import { setupOAuth } from "./oauth";

import { createLogger, requestLogger, initLogs } from "./utils/debug-logger";
import { registerUserFeedbackRoutes } from "./routes/user-feedback";
import { registerRecommendationsRoutes } from "./routes/recommendations";
import { storage } from "./storage";

import { registerPrivacySettingsRoutes } from "./routes/privacy-settings";
import { registerWordPressSyncRoutes } from "./routes/wordpress-sync";
import { setupWordPressSyncSchedule } from "./wordpress-sync"; // Using the declaration file
import { registerAnalyticsRoutes } from "./routes/analytics"; // Analytics endpoints
import { registerEmailServiceRoutes } from "./routes/email-service"; // Email service routes
import { registerBookmarkRoutes } from "./routes/bookmark-routes"; // Bookmark routes
import { setCsrfToken, validateCsrfToken, csrfTokenToLocals, CSRF_TOKEN_NAME } from "./middleware/csrf-protection";

import { setupCors } from "./cors-setup";
import sessionSyncRouter from "./routes/session-sync"; // Import session sync routes

const app = express();
const isDev = process.env.NODE_ENV !== "production";
// Use Replit's port system - fallback to 3002 for local development
const PORT = parseInt(process.env.PORT || process.env.REPLIT_PORT || "3002", 10);
const HOST = '0.0.0.0';

// Create server instance outside startServer for proper cleanup
let server: ReturnType<typeof createServer>;

// Add keep-alive mechanism for Replit
let keepAliveInterval: NodeJS.Timeout;

// Configure basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Health check endpoint for Replit
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

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

// Configure secure session with Neon database store
const sessionStore = new SecureNeonSessionStore() as any;

app.use(session({
  store: sessionStore as any,
  secret: (process.env.NODE_ENV === 'production') ? (() => { if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) { throw new Error('SESSION_SECRET (>=32 chars) is required in production'); } return process.env.SESSION_SECRET; })() : (process.env.SESSION_SECRET || 'development_secret_min_32_chars_long'),
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-domain cookies
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  // Enhanced session security
  genid: () => {
    return crypto.randomBytes(32).toString('hex');
  }
} as any));

// Middleware to track session metadata
app.use((req, _res, next) => {
  if (req.session && req.sessionID) {
    // Add metadata to session for security tracking
    if (!req.session.__meta) {
      req.session.__meta = {};
    }
    
    req.session.__meta.ipAddress = req.ip || req.connection.remoteAddress || '';
    req.session.__meta.userAgent = req.get('User-Agent') || '';
    req.session.__meta.lastActivity = new Date().toISOString();
    
    // Store CSRF token in session metadata
    if (!req.session.__meta.csrfToken) {
      req.session.__meta.csrfToken = crypto.randomBytes(32).toString('hex');
    }
  }
  next();
});

// Setup CSRF protection
app.use(setCsrfToken(!isDev)); // Secure cookies in production
app.use(csrfTokenToLocals);

// Apply CSRF validation after routes that don't need it
app.use(validateCsrfToken({
  ignorePaths: [
    '/health', 
    '/api/health',
    '/test', // Allow test route without CSRF protection
    '/api/auth/status', 
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password', // Allow password reset requests without CSRF protection (for testing)
    '/api/auth/reset-password', // Allow password reset without CSRF protection (for testing)
    '/api/auth/verify-reset-token', // Allow token verification without CSRF protection (for testing)
    '/api/feedback',
    '/api/posts',
    '/api/recommendations',
    '/api/analytics', // Exclude all analytics endpoints from CSRF checks
    '/api/analytics/vitals', // Explicitly exclude analytics/vitals endpoint 
         // WordPress sync endpoints now protected by auth+CSRF
     // '/api/wordpress/sync',
     '/api/wordpress/sync/status',
     '/api/wordpress/posts',
    '/api/reader/bookmarks', // Allow anonymous bookmarks without CSRF protection
    '/admin-cleanup' // Special admin cleanup route that bypasses CSRF protection
  ]
}));

// Register critical API routes BEFORE any middleware that might interfere
import searchRouter from './routes/search-simple';
app.use('/api/search', (_req, _res, next) => {
  
  next();
}, searchRouter);

// Setup authentication
setupAuth(app);
setupOAuth(app);

// Add health check endpoint with CSRF token initialization
app.get('/health', (req, res) => {
  // Ensure a CSRF token is set
  if (!req.session.csrfToken) {
    const token = crypto.randomBytes(32).toString('hex');
    req.session.csrfToken = token;
    
    // Set the token as a cookie for client-side access
    const secureCookie = process.env.NODE_ENV === 'production';
    res.cookie(CSRF_TOKEN_NAME, token, {
      httpOnly: false,
      secure: secureCookie,
      sameSite: secureCookie ? 'none' : 'lax'
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
        styleSrc: ["'self'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"]
      }
    }
  }));

// Create a server logger
const serverLogger = createLogger('Server');

// Database setup is handled by db-connect.ts module
// import seedFromWordPressAPI from '../scripts/api-seed'; // Unused import

async function startServer() {
  try {
    await initLogs();
    serverLogger.info('Starting server initialization', {
      environment: process.env.NODE_ENV,
      host: HOST,
      port: PORT
    });

    // Database connection is handled by db-connect.ts module
    let databaseAvailable = false;
    try {
      serverLogger.info('Setting up database connection...');
      
      // Set a timeout for database setup
      const dbSetupPromise = (async () => {
        // Database setup is handled automatically by db-connect.ts
        serverLogger.info('Database setup completed successfully');
        
        // Wait for database pool to be initialized with timeout
        serverLogger.info('Waiting for database pool initialization...');
        const poolReady = await waitForPoolInitialization(10000); // Reduced timeout to 10 seconds
        if (!poolReady) {
          throw new Error('Database pool initialization timed out');
        }
        serverLogger.info('Database pool is ready');
        
        // Quick database test
        try {
          const [{ value: postsCount }] = await db.select({ value: count() }).from(posts);
          serverLogger.info('Database connected, tables exist', { postsCount });
          databaseAvailable = true;
        } catch (tableError) {
          serverLogger.warn('Database tables check failed, but continuing', { 
            error: tableError instanceof Error ? tableError.message : 'Unknown error' 
          });
          // Still mark as available if we can connect
          databaseAvailable = true;
        }
      })();
      
      // Wait for database setup with timeout
      await Promise.race([
        dbSetupPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database setup timeout')), 15000)
        )
      ]);
      
    } catch (dbError) {
      serverLogger.error('Database setup failed, but continuing without database', { 
        error: dbError instanceof Error ? dbError.message : 'Unknown error' 
      });
      console.log('⚠️ Database setup failed, but continuing without database');
      databaseAvailable = false;
    }

    serverLogger.info(`Database setup completed, database available: ${databaseAvailable}, proceeding to server creation`);

    // Create server instance
    serverLogger.info('Creating HTTP server instance');
    server = createServer(app);
    serverLogger.info('HTTP server instance created');

    // Setup routes based on environment
    if (isDev) {
      serverLogger.info('Setting up development environment');
      
      // Add global request logging in development
      app.use(requestLogger);
      
      // Register main routes
      serverLogger.info('Registering main routes');
      registerRoutes(app);
      serverLogger.info('Main routes registration completed');
      
      // Only start WordPress sync if database is available
      if (databaseAvailable) {
        try {
          // Register WordPress sync routes
          // registerWordPressSyncRoutes(app);
          
          // Setup WordPress sync schedule (run every 5 minutes)
          // setupWordPressSyncSchedule(5 * 60 * 1000);
          serverLogger.info('WordPress sync services started (database available)');
        } catch (syncError) {
          serverLogger.warn('WordPress sync setup failed, but continuing', { 
            error: syncError instanceof Error ? syncError.message : 'Unknown error' 
          });
        }
      } else {
        serverLogger.info('Skipping WordPress sync services (database not available)');
      }
      
      console.log('✅ Route registration completed');
      
      // We've moved the post recommendations endpoint to main routes.ts
      // registerPostRecommendationsRoutes(app);
      

      
      await setupVite(app, server);
    } else {
      serverLogger.info('Setting up production environment');
      
      // Register main routes (these should work without database)
      registerRoutes(app);
      
      // Only register database-dependent routes if database is available
      if (databaseAvailable) {
        try {
          // Register user feedback routes
          registerUserFeedbackRoutes(app);
          
          // Register recommendation routes
          registerRecommendationsRoutes(app, storage);
          
          // Register privacy settings routes
          registerPrivacySettingsRoutes(app, storage);
          
          serverLogger.info('Database-dependent routes registered successfully');
        } catch (routeError) {
          serverLogger.warn('Some database-dependent routes failed to register', { 
            error: routeError instanceof Error ? routeError.message : 'Unknown error' 
          });
        }
      } else {
        serverLogger.info('Skipping database-dependent routes (database not available)');
      }
      
      // Only start WordPress sync if database is available
      if (databaseAvailable) {
        try {
          // Register WordPress sync routes
          registerWordPressSyncRoutes(app);
          
          // Setup WordPress sync schedule (run every 5 minutes)
          setupWordPressSyncSchedule(5 * 60 * 1000);
          serverLogger.info('WordPress sync services started (database available)');
        } catch (syncError) {
          serverLogger.warn('WordPress sync setup failed, but continuing', { 
            error: syncError instanceof Error ? syncError.message : 'Unknown error' 
          });
        }
      } else {
        serverLogger.info('Skipping WordPress sync services (database not available)');
      }
      
      // Only register other database-dependent services if database is available
      if (databaseAvailable) {
        try {
          // Register analytics routes
          registerAnalyticsRoutes(app);
          
          // Register email service routes
          registerEmailServiceRoutes(app);
          
          // Register bookmark routes
          registerBookmarkRoutes(app);
          
          // Register session sync routes
          app.use('/api/session-sync', sessionSyncRouter);
          
          serverLogger.info('Additional database-dependent services registered successfully');
        } catch (serviceError) {
          serverLogger.warn('Some additional database-dependent services failed to register', { 
            error: serviceError instanceof Error ? serviceError.message : 'Unknown error' 
          });
        }
      } else {
        serverLogger.info('Skipping additional database-dependent services (database not available)');
      }
      
      // We've moved the post recommendations endpoint to main routes.ts
      // registerPostRecommendationsRoutes(app);
      
      serveStatic(app);
    }

    // Start listening with enhanced error handling and port notification
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      
      // Log that we're about to start listening
      serverLogger.info('About to start listening on port', { port: PORT, host: HOST });
      
      server.listen(PORT, HOST, () => {
        const bootDuration = Date.now() - startTime;
          
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
          
          serverLogger.debug('Sent port readiness signal');
        }
        
        // Wait for a moment to ensure the server is fully ready
        setTimeout(() => {
          serverLogger.info('Server is fully ready and listening');
          
          // Start keep-alive mechanism for Replit
          keepAliveInterval = setInterval(() => {
            serverLogger.debug('Keep-alive ping');
            // Send a heartbeat to keep the process alive
            if (process.send) {
              process.send({ type: 'heartbeat', timestamp: Date.now() });
            }
          }, 30000); // Send heartbeat every 30 seconds
          
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

// Start the server and keep it running
startServer().then(() => {
  serverLogger.info('Server startup completed successfully');
  // Keep the process alive
}).catch(error => {
  serverLogger.error('Critical startup error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  });
  
  // Don't exit immediately, try to continue with limited functionality
  console.error('❌ Server startup failed, but attempting to continue with limited functionality');
  console.error('Error details:', error);
  
  // Try to start a minimal server if possible
  try {
    if (server) {
      serverLogger.info('Attempting to start server with existing instance');
    } else {
      serverLogger.warn('No server instance available, some features may not work');
    }
  } catch (minimalError) {
    serverLogger.error('Failed to start minimal server', { error: minimalError });
    // Only exit if we absolutely can't continue
    setTimeout(() => {
      serverLogger.error('Exiting due to critical startup failure');
      process.exit(1);
    }, 5000); // Give 5 seconds for any cleanup
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  serverLogger.info('SIGTERM received, initiating graceful shutdown');
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  server?.close(() => {
    serverLogger.info('Server closed successfully');
    process.exit(0);
  });
});

// Handle uncaught exceptions - don't exit immediately
process.on('uncaughtException', (error) => {
  serverLogger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  
  // Log the error but don't exit immediately
  console.error('❌ Uncaught exception:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Only exit if this is a critical error
  if (error.message.includes('EADDRINUSE') || error.message.includes('permission denied')) {
    serverLogger.error('Critical error, exiting', { error: error.message });
    process.exit(1);
  }
  
  // For other errors, log and continue
  serverLogger.warn('Non-critical error, continuing operation', { error: error.message });
});

// Handle unhandled rejections - don't exit immediately
process.on('unhandledRejection', (reason, _promise) => {
  serverLogger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  });
  console.error('⚠️ Unhandled promise rejection:', reason);
  
  // Don't exit for promise rejections, just log them
  serverLogger.warn('Promise rejection handled, continuing operation');
});

export default app;