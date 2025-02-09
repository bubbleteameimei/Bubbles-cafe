import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { createServer, Socket } from "net";
import { db } from "./db";
import { sql } from "drizzle-orm";

const app = express();

// Set trust proxy first, before other middleware
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware with enhanced security details
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Capture response for logging
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      // Safely log response data
      if (capturedJsonResponse) {
        // Remove sensitive data before logging
        const sanitizedResponse = { ...capturedJsonResponse };
        delete sanitizedResponse.password;
        delete sanitizedResponse.token;
        logLine += ` :: ${JSON.stringify(sanitizedResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

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

async function checkDatabaseConnection(): Promise<void> {
  try {
    await db.execute(sql`SELECT 1`);
    log("Database connection successful");
  } catch (error) {
    log("Database connection failed:", error instanceof Error ? error.message : String(error));
    throw error;
  }
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
    await checkDatabaseConnection();
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
          // This must be printed exactly as is: PORT=number
          console.log(`PORT=${PORT}`);

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