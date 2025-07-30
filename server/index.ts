import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";
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
import { queryPerformanceMiddleware, wrapDbWithProfiler } from "./middleware/query-performance";

const app = express();
const isDev = process.env.NODE_ENV !== "production";
// Use port 3002 to avoid conflicts with other running processes
const PORT = parseInt(process.env.PORT || "3002", 10);
const HOST = '0.0.0.0';

// Performance monitoring
const startupStart = performance.now();
console.log('🚀 Starting server initialization...');

// Create server instance outside startServer for proper cleanup
let server: ReturnType<typeof createServer>;

// Configure basic middleware with optimizations
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable compression for better performance
app.use(compression({
  level: 6, // Good balance between compression ratio and speed
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use default compression filter
    return compression.filter(req, res);
  }
}));

// Configure CORS for cross-domain requests when deployed on Vercel/Render
setupCors(app);

// Add query performance monitoring
app.use(queryPerformanceMiddleware);

// Initialize database profiling for performance monitoring
wrapDbWithProfiler(db);

// Session already handles cookies for us
// No additional cookie parser needed for CSRF protection

// Increase body parser limit for file uploads
app.use((req, res, next) => {
  // Skip content-type check for multipart requests
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  next();
});

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'horror-stories-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-domain cookies
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
    '/api/auth/forgot-password', // Allow password reset requests without CSRF protection (for testing)
    '/api/auth/reset-password', // Allow password reset without CSRF protection (for testing)
    '/api/auth/verify-reset-token', // Allow token verification without CSRF protection (for testing)
    '/api/feedback',
    '/api/posts',
    '/api/recommendations',
    '/api/analytics', // Exclude all analytics endpoints from CSRF checks
    '/api/analytics/vitals', // Explicitly exclude analytics/vitals endpoint 
    '/api/wordpress/sync',
    '/api/wordpress/sync/status',
    '/api/wordpress/posts',
    '/api/reader/bookmarks', // Allow anonymous bookmarks without CSRF protection
    '/admin-cleanup' // Special admin cleanup route that bypasses CSRF protection
  ]
}));

// Setup authentication
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
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    }
  }
}));

// Create a server logger
const serverLogger = createLogger('Server');

// Import our database setup utilities
import setupDatabase from '../scripts/setup-db';
import pushSchema from '../scripts/db-push';
import seedFromWordPressAPI from '../scripts/api-seed';

async function setupDatabaseAsync() {
  try {
    serverLogger.info('🗄️ Setting up database connection...');
    
    // Test database connection
    const testQuery = await db.select({ count: count() }).from(posts);
    serverLogger.info('✅ Database connection established', { 
      postsCount: testQuery[0]?.count || 0 
    });

    // Only seed if database is empty (prevent repeated seeding)
    if (!testQuery[0]?.count || testQuery[0].count === 0) {
      serverLogger.info('📦 Database appears empty, starting background seeding...');
      // Run seeding in background without blocking
      seedDatabase().catch(error => {
        serverLogger.error('❌ Background seeding failed:', error);
      });
    }
    
  } catch (error) {
    serverLogger.error('❌ Database setup failed:', error);
    // Don't crash server, continue with limited functionality
  }
}

async function startServer() {
  try {
    const startupStart = performance.now();
    serverLogger.info('🚀 Starting server initialization', {
      environment: process.env.NODE_ENV,
      host: HOST,
      port: PORT
    });

    // Setup routes quickly (synchronous)
    serverLogger.info('📍 Registering routes...');
    registerRoutes(app);
    registerUserFeedbackRoutes(app, storage);
    registerRecommendationsRoutes(app, storage);
    registerPrivacySettingsRoutes(app, storage);
    registerWordPressSyncRoutes(app);
    registerAnalyticsRoutes(app);
    registerEmailServiceRoutes(app);
    registerBookmarkRoutes(app);
    
    // Create server instance
    server = createServer(app);
    
    // Setup environment-specific middleware
    if (isDev) {
      app.use(requestLogger);
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    
    // Start listening immediately for faster startup
    server.listen(PORT, HOST, () => {
      const startupTime = performance.now() - startupStart;
      serverLogger.info(`✅ Server started successfully in ${startupTime.toFixed(2)}ms`, {
        url: `http://${HOST}:${PORT}`,
        environment: process.env.NODE_ENV
      });
    });

    // Setup database connection asynchronously (non-blocking)
    setupDatabaseAsync();
    
  } catch (error) {
    serverLogger.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  serverLogger.info('🛑 Received SIGTERM, shutting down gracefully...');
  server?.close(() => {
    serverLogger.info('✅ Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

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
process.on('unhandledRejection', (reason, promise) => {
  serverLogger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  });
});

export default app;