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

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.listen(startPort, '0.0.0.0', () => {
      const { port } = server.address() as { port: number };
      server.close(() => {
        log(`Found available port: ${port}`);
        resolve(port);
      });
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${startPort} is in use, trying next port`);
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
}

// Simplified port check function
async function waitForPort(port: number, retries = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    let attempts = 0;

    const tryConnect = () => {
      attempts++;
      log(`Attempt ${attempts}/${retries} to connect to port ${port}`);

      socket.connect(port, '0.0.0.0', () => {
        socket.destroy();
        log(`Successfully connected to port ${port}`);
        resolve();
      });
    };

    socket.on('error', (err) => {
      socket.destroy();

      if (attempts >= retries) {
        reject(new Error(`Failed to connect to port ${port} after ${retries} attempts`));
      } else {
        setTimeout(tryConnect, 1000);
      }
    });

    tryConnect();
  });
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

    const server = registerRoutes(app);
    app.use(errorHandler);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use environment port or default to 3000
    const startPort = parseInt(process.env.PORT || '3000', 10);

    // Print port immediately for workflow
    console.log(`PORT=${startPort}`);

    const PORT = await findAvailablePort(startPort);
    process.env.PORT = PORT.toString();

    return new Promise<void>((resolve, reject) => {
      server.listen(PORT, "0.0.0.0", async () => {
        try {
          log(`Server started on port ${PORT}`);
          await waitForPort(PORT);
          log(`Server is ready and accepting connections on port ${PORT}`);

          if (process.send) {
            process.send('ready');
          }

          resolve();
        } catch (error) {
          log(`Error during server startup: ${error}`);
          reject(error);
        }
      });

      server.on('error', (error: Error) => {
        log(`Server error: ${error}`);
        reject(error);
      });
    });
  } catch (error) {
    log(`Critical server error: ${error}`);
    process.exit(1);
  }
}

startServer().catch((error) => {
  log(`Server startup failed: ${error}`);
  process.exit(1);
});