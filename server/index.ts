import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { createServer, Socket } from "net";
import { db } from "./db";
import { sql } from "drizzle-orm";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { setupAuth } from "./auth";

const app = express();

// Set trust proxy first, before other middleware
app.set('trust proxy', 1);

// Log port immediately for workflow
const startPort = parseInt(process.env.PORT || '3000', 10);
console.log(`Initial PORT=${startPort}`);

// Enable Gzip compression
app.use(compression());

// Security headers with updated CSP for image loading
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

// Apply rate limiting to all routes
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up authentication with proper session secret
process.env.SESSION_SECRET = process.env.SESSION_SECRET || process.env.REPLIT_ID || 'development-secret';

// API request logging middleware
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

async function findAvailablePort(startPort: number, maxRetries = 10): Promise<number> {
  return new Promise((resolve, reject) => {
    let currentPort = startPort;
    let attempts = 0;

    const tryPort = () => {
      const server = createServer();

      const cleanup = () => {
        try {
          server.close();
        } catch (err) {
          // Ignore cleanup errors
        }
      };

      server.on('error', (err: NodeJS.ErrnoException) => {
        cleanup();
        if (err.code === 'EADDRINUSE') {
          log(`Port ${currentPort} is in use`);

          if (attempts >= maxRetries) {
            reject(new Error(`Could not find an available port after ${maxRetries} attempts`));
            return;
          }

          attempts++;
          currentPort++;
          setTimeout(tryPort, 100); // Add small delay between attempts
        } else {
          reject(err);
        }
      });

      server.listen(currentPort, '0.0.0.0', () => {
        const { port } = server.address() as { port: number };
        cleanup();
        log(`Found available port: ${port}`);
        resolve(port);
      });
    };

    tryPort();
  });
}

async function waitForPort(port: number, retries = 10, timeout = 2000): Promise<void> {
  let attempts = 0;

  const tryConnect = async (): Promise<void> => {
    attempts++;
    log(`Attempt ${attempts}/${retries} to connect to port ${port}`);

    return new Promise((resolve, reject) => {
      const socket = new Socket();
      let isHandled = false;

      const handleResult = (err?: Error) => {
        if (isHandled) return;
        isHandled = true;

        cleanup();

        if (err) {
          if (attempts >= retries) {
            reject(new Error(`Failed to connect to port ${port} after ${retries} attempts: ${err.message}`));
          } else {
            setTimeout(() => {
              tryConnect().then(resolve).catch(reject);
            }, 1000);
          }
        } else {
          log(`Successfully connected to port ${port}`);
          resolve();
        }
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        socket.removeAllListeners();
        socket.destroy();
      };

      const timeoutId = setTimeout(() => {
        handleResult(new Error('Connection timeout'));
      }, timeout);

      socket.once('error', (err) => {
        handleResult(err);
      });

      socket.once('connect', () => {
        handleResult();
      });

      socket.connect(port, '0.0.0.0');
    });
  };

  return tryConnect();
}

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

async function startServer() {
  try {
    // Verify database connection
    await db.execute(sql`SELECT 1`);
    log("Database connection verified");

    // Seed database if needed
    try {
      await seedDatabase();
      log("Database seeded successfully!");
    } catch (err) {
      log(`Error seeding database: ${err}`);
    }

    // Set up auth before routes
    setupAuth(app);

    const server = registerRoutes(app);
    app.use(errorHandler);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Find an available port starting from the environment port or default
    const PORT = await findAvailablePort(startPort);
    process.env.PORT = PORT.toString();
    log(`Selected port: ${PORT}`);

    return new Promise<void>((resolve, reject) => {
      const startupTimeout = setTimeout(() => {
        reject(new Error(`Server startup timed out after 30 seconds`));
      }, 30000);

      server.listen(PORT, "0.0.0.0", async () => {
        try {
          log(`Server started on port ${PORT}`);
          await waitForPort(PORT);
          log(`Server is ready and accepting connections on port ${PORT}`);
          clearTimeout(startupTimeout);

          // Signal to parent process that server is ready
          if (process.send) {
            log('Sending ready signal to parent process');
            process.send('ready');
            process.send({ port: PORT });
          }

          resolve();
        } catch (error) {
          clearTimeout(startupTimeout);
          const err = error instanceof Error ? error : new Error(String(error));
          log(`Error during server startup: ${err.message}`);
          reject(err);
        }
      });

      server.on('error', (error: NodeJS.ErrnoException) => {
        clearTimeout(startupTimeout);
        if (error.code === 'EADDRINUSE') {
          log(`Port ${PORT} is already in use. Trying another port...`);
          findAvailablePort(PORT + 1)
            .then(newPort => {
              process.env.PORT = newPort.toString();
              server.listen(newPort, "0.0.0.0");
            })
            .catch(reject);
        } else {
          log(`Server error: ${error.message}`);
          reject(error);
        }
      });
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log(`Critical server error: ${err.message}`);
    process.exit(1);
  }
}

// Add process error handlers
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer().catch((error) => {
  log(`Server startup failed: ${error}`);
  process.exit(1);
});