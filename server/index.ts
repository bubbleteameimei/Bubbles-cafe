import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { setupAuth } from "./auth";
import { createServer } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";
import { seedDatabase } from "./seed";
import { posts } from "@shared/schema";
import { count } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const isDev = process.env.NODE_ENV !== 'production';

// Declare server variable in the module scope
let server: ReturnType<typeof createServer>;

// Enhanced logging for startup process
function enhancedLog(message: string, type: 'info' | 'error' | 'debug' = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

// Set trust proxy first
app.set('trust proxy', 1);

// Enable Gzip compression
app.use(compression());

// Security headers with updated CSP for development
app.use(helmet({
  contentSecurityPolicy: isDev ? false : undefined,
  crossOriginEmbedderPolicy: false // Allow embedding resources from other origins in development
}));

// Rate limiter with adjusted settings for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Session setup with enhanced error handling
const PostgresSession = connectPgSimple(session);

try {
  const sessionConfig: session.SessionOptions = {
    store: new PostgresSession({
      conObject: {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      },
      createTableIfMissing: true,
      pruneSessionInterval: 60
    }),
    secret: process.env.SESSION_SECRET || process.env.REPL_ID || 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    },
    name: 'horror.session'
  };

  app.use(session(sessionConfig));
  enhancedLog('Session middleware configured successfully', 'debug');
} catch (error) {
  enhancedLog(`Session setup failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
  process.exit(1);
}

// Set up auth
setupAuth(app);

async function startServer() {
  try {
    enhancedLog('Starting server initialization...', 'info');

    // Check if database needs seeding
    const [{ value: postsCount }] = await db.select({ value: count() }).from(posts);
    if (postsCount === 0) {
      enhancedLog('Database is empty, starting seeding process...', 'info');
      await seedDatabase();
      enhancedLog('Database seeding completed successfully', 'info');
    } else {
      enhancedLog(`Database already contains ${postsCount} posts, skipping seeding`, 'info');
    }

    // Create server instance
    server = createServer(app);

    // Register routes and middleware
    if (isDev) {
      enhancedLog('Registering API routes', 'debug');
      registerRoutes(app);
      enhancedLog("API routes registered successfully", 'info');

      enhancedLog('Setting up Vite middleware', 'debug');
      await setupVite(app, server);
      enhancedLog("Vite middleware setup complete", 'info');
    } else {
      enhancedLog('Setting up static file serving', 'debug');
      serveStatic(app);
      enhancedLog("Static file serving setup complete", 'info');
    }

    // Start listening with enhanced error handling and port notification
    return new Promise<void>((resolve, reject) => {
      server.listen(PORT, "0.0.0.0", () => {
        enhancedLog(`Server running at http://0.0.0.0:${PORT}`, 'info');

        // Explicitly notify about port readiness
        process.send?.({
          port: PORT,
          wait_for_port: true,
          ready: true
        });

        resolve();
      });

      server.once('error', (err) => {
        enhancedLog(`Server error: ${err.message}`, 'error');
        reject(err);
      });
    });
  } catch (error) {
    enhancedLog(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  }
}

// Enhanced graceful shutdown
process.on('SIGTERM', () => {
  enhancedLog('SIGTERM received. Starting graceful shutdown...', 'info');
  if (server) {
    server.close(() => {
      enhancedLog('Server closed', 'info');
      process.exit(0);
    });
  } else {
    enhancedLog('Server not initialized', 'info');
    process.exit(0);
  }
});

// Start the server with enhanced error handling
startServer().catch((error) => {
  enhancedLog(`Critical error during server start: ${error.message}`, 'error');
  process.exit(1);
});