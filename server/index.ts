import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { db } from "./db";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { setupAuth } from "./auth";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { posts } from "@shared/schema";
import { count } from "drizzle-orm";
import path from 'path';
import { fileURLToPath } from "url";
import fs from 'fs';

// Create express app
const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const isDev = process.env.NODE_ENV !== 'production';

// Declare server variable in module scope
let server: Server;

// Create public directory if it doesn't exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Set trust proxy first
app.set('trust proxy', 1);


async function startServer() {
  try {
    console.log('Starting server initialization...');

    // Basic middleware setup
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(compression());

    // Security headers
    app.use(helmet({
      contentSecurityPolicy: isDev ? false : {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:", "ws:", "wss:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        }
      },
      crossOriginEmbedderPolicy: false
    }));

    // Rate limiter
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isDev ? 1000 : 100,
      standardHeaders: true,
      legacyHeaders: false
    });

    // Session setup
    const PostgresSession = connectPgSimple(session);
    console.log('Setting up PostgreSQL session store...');

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
      },
      name: 'horror.session'
    };

    app.use(session(sessionConfig));
    console.log('Session middleware configured');

    // Set up auth
    console.log('Setting up authentication...');
    setupAuth(app);

    // Create server instance
    console.log('Creating HTTP server...');
    server = createServer(app);

    if (isDev) {
      // Setup development middleware
      console.log('Setting up Vite middleware...');
      await setupVite(app, server);
      console.log('Vite middleware setup complete');

      // API routes
      app.use('/api', apiLimiter);
      app.use('/api', (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Content-Type', 'application/json');
        next();
      });

      console.log('Registering API routes...');
      registerRoutes(app);
      console.log('API routes registered');
    } else {
      // Production setup
      console.log('Setting up static file serving...');
      serveStatic(app);
      app.use('/api', apiLimiter);
      registerRoutes(app);
    }

    // Start listening
    return new Promise<void>((resolve, reject) => {
      try {
        console.log('Attempting to start server...');
        server.listen(PORT, "0.0.0.0", () => {
          console.log(`Server is now running at http://0.0.0.0:${PORT}`);
          if (process.send) {
            process.send({
              port: PORT,
              wait_for_port: true,
              ready: true
            });
          }
          resolve();
        });

        server.on('error', (err) => {
          console.error('Server startup error:', err);
          reject(err);
        });
      } catch (error) {
        console.error('Critical error during server startup:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    throw error;
  }
}

// Start the server
console.log('Beginning server startup process...');
startServer().catch((error) => {
  console.error('Fatal error during server start:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Starting graceful shutdown...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    console.log('Server not initialized');
    process.exit(0);
  }
});