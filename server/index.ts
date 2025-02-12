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

const app = express();
const BASE_PORT = Number(process.env.PORT) || 3000;
const MAX_PORT = BASE_PORT + 10; // Try up to 10 ports

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

async function startServer() {
  try {
    // Verify database connection
    log("Verifying database connection...");
    await db.execute(sql`SELECT 1`);
    log("Database connection verified successfully");

    // Seed database
    try {
      await seedDatabase();
      log("Database seeded successfully!");
    } catch (err) {
      log(`Warning: Error seeding database: ${err}`);
    }

    // Set up auth and routes
    setupAuth(app);
    const server = registerRoutes(app);
    app.use(errorHandler);

    // Set up Vite or static serving
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Try ports sequentially until one works
    let currentPort = BASE_PORT;
    const tryPort = () => {
      server.listen(currentPort, "0.0.0.0", () => {
        log(`Server started on port ${currentPort}`);
        if (process.send) {
          process.send('ready');
          process.send({ port: currentPort });
        }
      }).on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          log(`Port ${currentPort} is in use`);
          if (currentPort < MAX_PORT) {
            currentPort++;
            tryPort();
          } else {
            log('No available ports found');
            process.exit(1);
          }
        } else {
          log(`Server error: ${error.message}`);
          process.exit(1);
        }
      });
    };

    tryPort();

  } catch (error) {
    log(`Critical server error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Error handlers
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  log(`Unhandled Rejection: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

startServer();