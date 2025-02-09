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

const app = express();

// Set trust proxy first, before other middleware
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
      imgSrc: ["'self'", 'data:', 'https:'],
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
  let currentPort = startPort;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const server = createServer();
      await new Promise<number>((resolve, reject) => {
        server.once('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'EADDRINUSE') {
            server.close();
            currentPort++;
            attempts++;
            resolve(currentPort);
          } else {
            reject(err);
          }
        });

        server.listen(currentPort, '0.0.0.0', () => {
          const { port } = server.address() as { port: number };
          server.close(() => resolve(port));
        });
      });

      log(`Found available port: ${currentPort}`);
      return currentPort;
    } catch (error) {
      log(`Error checking port ${currentPort}:`, error instanceof Error ? error.message : String(error));
      currentPort++;
      attempts++;
    }
  }

  throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
}

async function waitForPort(port: number, retries = 45, delay = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    let attempts = 0;

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    const tryConnect = () => {
      attempts++;
      log(`Attempt ${attempts}/${retries} to connect to port ${port}`);

      socket.connect(port, '0.0.0.0', () => {
        log(`Successfully connected to port ${port}`);
        cleanup();
        resolve();
      });
    };

    socket.on('error', (err) => {
      socket.destroy();
      if (attempts >= retries) {
        cleanup();
        reject(new Error(`Failed to connect to port ${port} after ${retries} attempts: ${err.message}`));
      } else {
        setTimeout(tryConnect, delay);
      }
    });

    tryConnect();
  });
}

// Error handling middleware
function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  const errorDetails = {
    status,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    code: err.code,
  };

  log('Error occurred:', JSON.stringify(errorDetails, null, 2));

  res.status(status).json({
    status,
    message: isDevelopment ? err.message : 'An error occurred',
    ...(isDevelopment && { details: err.details }),
  });
}

async function startServer() {
  try {
    // First check database connection
    await db.execute(sql`SELECT 1`);
    log("Database connection verified");

    // Seed database with posts
    try {
      await seedDatabase();
      log("Database seeded successfully!");
    } catch (err) {
      log(`Error seeding database: ${err}`);
      // Continue even if seeding fails
    }

    const server = registerRoutes(app);
    app.use(errorHandler);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const startPort = parseInt(process.env.PORT || '5000', 10);
    const PORT = await findAvailablePort(startPort);

    return new Promise<void>((resolve, reject) => {
      const serverInstance = server.listen(PORT, "0.0.0.0", async () => {
        try {
          log(`Server starting on port ${PORT}`);

          // Wait for port to be actually ready
          await waitForPort(PORT);
          log(`Port ${PORT} is ready and accepting connections`);

          // Print port in the exact format expected by Replit
          console.log(`PORT=${PORT}`);
          process.env.PORT = PORT.toString();

          if (process.send) {
            process.send('ready');
          }

          resolve();
        } catch (error) {
          log(`Error during server startup: ${error}`);
          serverInstance.close();
          reject(error);
        }
      });

      serverInstance.on('error', (err: any) => {
        log(`Server error: ${err.message}`);
        reject(err);
      });

      // Handle graceful shutdown
      const cleanup = () => {
        serverInstance.close(() => {
          log('Server closed');
          process.exit(0);
        });
      };

      process.on('SIGTERM', cleanup);
      process.on('SIGINT', cleanup);
    });
  } catch (error) {
    log(`Critical server error: ${error instanceof Error ? error.stack : String(error)}`);
    process.exit(1);
  }
}

startServer().catch((error) => {
  log(`Server startup failed: ${error}`);
  process.exit(1);
});