import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { db } from "./db";
import { sql } from "drizzle-orm";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { setupAuth } from "./auth";
import { createServer } from "http";

const app = express();
const BASE_PORT = Number(process.env.PORT) || 3000;
const MAX_PORT = BASE_PORT + 10;

// Set trust proxy first
app.set('trust proxy', 1);

// Enable Gzip compression
app.use(compression());

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
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Set up session secret
process.env.SESSION_SECRET = process.env.SESSION_SECRET || process.env.REPLIT_ID || 'development-secret';

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

let server: ReturnType<typeof registerRoutes> | null = null;

// Check if a port is available
async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const testServer = createServer();
    testServer.once('error', () => {
      resolve(false);
    });
    testServer.once('listening', () => {
      testServer.close();
      resolve(true);
    });
    testServer.listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(): Promise<number> {
  let currentPort = BASE_PORT;
  while (currentPort <= MAX_PORT) {
    log(`Checking port ${currentPort}...`);
    if (await isPortAvailable(currentPort)) {
      return currentPort;
    }
    currentPort++;
  }
  throw new Error('No available ports found');
}

async function startServer() {
  try {
    log("Starting server initialization...");

    // Verify database connection with retry logic
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

    // Seed database
    try {
      await seedDatabase();
      log("Database seeded successfully!");
    } catch (err) {
      log(`Warning: Error seeding database: ${err}`);
    }

    // Set up auth and routes
    log("Setting up authentication and routes...");
    setupAuth(app);
    server = registerRoutes(app);
    app.use(errorHandler);

    // Set up Vite or static serving
    if (app.get("env") === "development") {
      log("Setting up Vite development server...");
      await setupVite(app, server);
    } else {
      log("Setting up static file serving...");
      serveStatic(app);
    }

    // Find available port and start server
    const port = await findAvailablePort();

    await new Promise<void>((resolve, reject) => {
      server?.listen(port, "0.0.0.0", () => {
        log(`Server started successfully on port ${port}`);
        if (process.send) {
          process.send('ready');
          process.send({ port });
        }
        resolve();
      }).on('error', (error: Error) => {
        log(`Failed to start server: ${error.message}`);
        reject(error);
      });
    });

  } catch (error) {
    log(`Critical server error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Graceful shutdown handler
function gracefulShutdown(signal: string) {
  return () => {
    log(`Received ${signal}. Starting graceful shutdown...`);
    if (server) {
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });

      // Force close after timeout
      setTimeout(() => {
        log('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };
}

// Error handlers and graceful shutdown
process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (error) => {
  log(`Unhandled Rejection: ${error instanceof Error ? error.message : String(error)}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

startServer();