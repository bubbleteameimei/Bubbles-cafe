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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const isDev = process.env.NODE_ENV !== 'production';

// Set trust proxy first
app.set('trust proxy', 1);

// Enable Gzip compression
app.use(compression());

// Security headers with updated CSP for development
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Session setup with type-safe configuration
const PostgresSession = connectPgSimple(session);
const sessionConfig = {
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
  } as const,
  name: 'horror.session'
};

app.use(session(sessionConfig));

// Set up auth
setupAuth(app);

// Register API routes
const server = createServer(app);
registerRoutes(app);

// Development vs Production setup
async function startServer() {
  try {
    // Initialize database with seed data
    try {
      await seedDatabase();
      log("Database seeded successfully");
    } catch (error) {
      log("Error seeding database:", error);
      // Continue starting the server even if seeding fails
    }

    if (isDev) {
      // In development, set up Vite middleware
      await setupVite(app, server);
      log("Vite middleware setup complete");
    } else {
      // In production, serve static files
      serveStatic(app);
      log("Static file serving setup complete");
    }

    // Start the server
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);

      // Notify the workflow system that we're ready
      if (process.send) {
        process.send('ready');
        process.send({ port: PORT });
      }
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      log(`Server error: ${error.message}`);
      process.exit(1);
    });

  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received. Starting graceful shutdown...');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer().catch((error) => {
  log(`Critical error during server start: ${error.message}`);
  process.exit(1);
});