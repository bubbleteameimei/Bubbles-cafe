import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { createServer, Socket } from "net";
import { db } from "./db";
import { sql } from "drizzle-orm";

const app = express();
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

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(startPort, '0.0.0.0', () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });

    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

async function waitForPort(port: number, retries = 45, delay = 1500): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    let attempts = 0;

    const tryConnect = () => {
      attempts++;
      log(`Attempt ${attempts}/${retries} to connect to port ${port}`);

      socket.connect(port, '0.0.0.0', () => {
        log(`Successfully connected to port ${port} after ${attempts} attempts`);
        socket.end();
        socket.destroy();
        resolve();
      });
    };

    socket.on('error', (err) => {
      socket.destroy();
      if (attempts >= retries) {
        const errorMsg = `Failed to connect to port ${port} after ${retries} attempts: ${err.message}`;
        log(errorMsg);
        reject(new Error(errorMsg));
      } else {
        log(`Connection attempt ${attempts} failed, retrying in ${delay}ms...`);
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

// Error handling middleware with enhanced security and logging
function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Detailed error logging for debugging
  const errorDetails = {
    status,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    code: err.code,
  };

  log('Error occurred:', JSON.stringify(errorDetails, null, 2));

  // Send safe response to client
  res.status(status).json({
    status,
    message: isDevelopment ? err.message : 'An error occurred. Please try again later.',
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

    // Use the enhanced error handler
    app.use(errorHandler);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const startPort = parseInt(process.env.PORT || '5000', 10);
    const PORT = await findAvailablePort(startPort);

    return new Promise<void>((resolve, reject) => {
      server.listen(PORT, "0.0.0.0", async () => {
        log(`Server starting on port ${PORT}`);

        try {
          // Wait for the port to be actually ready with increased retries
          await waitForPort(PORT);
          log(`Port ${PORT} is confirmed ready and accepting connections`);

          // Signal that we're ready to accept connections
          if (process.send) {
            process.send('ready');
          }

          // Log the port in workflow-friendly format
          console.log(`Server started successfully and listening on port ${PORT}`);
          console.log(`PORT=${PORT}`);
          resolve();
        } catch (error) {
          log(`Failed to verify port availability: ${error}`);
          reject(error);
        }
      }).on('error', (err: any) => {
        log(`Server error: ${err.message}`);
        reject(err);
      });
    });
  } catch (error) {
    log(`Critical server error: ${error instanceof Error ? error.stack : String(error)}`);
    process.exit(1);
  }
}

// Start server and handle any errors
startServer().catch((error) => {
  log(`Server startup failed: ${error}`);
  process.exit(1);
});