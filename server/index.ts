import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { sql } from "drizzle-orm";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { setupAuth } from "./auth";
import { createServer } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// Set trust proxy first
app.set('trust proxy', 1);

// Enable Gzip compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https:'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" }
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
  }
});

app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Session configuration
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
  },
  name: 'horror.session'
} as session.SessionOptions;

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  if (sessionConfig.cookie) {
    sessionConfig.cookie.secure = true;
  }
}

app.use(session(sessionConfig));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API request logging
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    });
  }
  next();
});

// Error handling middleware
function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV !== 'production';
  log('Error occurred:', err);
  res.status(status).json({
    status,
    message: isDevelopment ? err.message : 'An error occurred',
    ...(isDevelopment && { details: err.stack }),
  });
}

let server: ReturnType<typeof registerRoutes>;

// Start server with port binding
async function startServer() {
  try {
    log("Starting server initialization...");

    // Verify database connection
    log("Verifying database connection...");
    let retries = 5;
    while (retries > 0) {
      try {
        await db.execute(sql`SELECT 1`);
        log("Database connection verified successfully");
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        log(`Database connection failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Set up auth and routes
    log("Setting up authentication and routes...");
    setupAuth(app);
    server = registerRoutes(app);
    app.use(errorHandler);

    // Set up Vite or static serving
    if (process.env.NODE_ENV === "development") {
      log("Setting up Vite development server...");
      await setupVite(app, server);
    } else {
      log("Setting up static file serving...");
      serveStatic(app);
    }

    // Start server with port binding
    return new Promise<void>((resolve, reject) => {
      const httpServer = server.listen(PORT, "0.0.0.0", () => {
        log(`Server started successfully on port ${PORT}`);

        // Notify the workflow system that we're ready
        if (process.send) {
          process.send('ready');
          process.send({ port: PORT });
        }

        resolve();
      });

      httpServer.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          log(`Port ${PORT} is already in use`);
          reject(new Error(`Port ${PORT} is already in use`));
        } else {
          log(`Failed to start server: ${error.message}`);
          reject(error);
        }
      });

      // Add proper shutdown handling
      httpServer.on('close', () => {
        log('Server closed');
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Critical server error: ${errorMessage}`);

    if (process.send) {
      process.send('error');
      process.send({ error: errorMessage });
    }

    throw error;
  }
}

// Graceful shutdown handler
function handleShutdown(signal: string) {
  log(`Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      log('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
  handleShutdown('uncaughtException');
});

process.on('unhandledRejection', (error) => {
  log(`Unhandled Rejection: ${error instanceof Error ? error.message : String(error)}`);
  handleShutdown('unhandledRejection');
});

// Start the server
startServer().catch((error) => {
  log(`Failed to start server: ${error.message}`);
  process.exit(1);
});