import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from "./routes";
import { db } from "./db";
import { posts } from "@shared/schema";
import { count } from "drizzle-orm";
import { seedDatabase } from "./seed";
import path from "path";

const app = express();
const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 5000;

// Create server instance outside startServer for proper cleanup
let server: ReturnType<typeof createServer>;

async function startServer() {
  try {
    console.log('Starting server initialization...');

    // Serve static assets from attached_assets directory
    app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets'), {
      maxAge: '1d',
      fallthrough: false
    }));

    // Check if database needs seeding
    const [{ value: postsCount }] = await db.select({ value: count() }).from(posts);
    if (postsCount === 0) {
      console.log('Database is empty, starting seeding process...');
      await seedDatabase();
      console.log('Database seeding completed successfully');
    } else {
      console.log(`Database already contains ${postsCount} posts, skipping seeding`);
    }

    // Clean up existing server if any
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log('Closed existing server instance');
          resolve();
        });
      });
    }

    // Create server instance
    server = createServer(app);

    // Register routes and middleware
    if (isDev) {
      console.log('Registering API routes');
      registerRoutes(app);
      console.log("API routes registered successfully");

      console.log('Setting up Vite middleware');
      await setupVite(app, server);
      console.log("Vite middleware setup complete");
    } else {
      console.log('Setting up static file serving');
      serveStatic(app);
      console.log("Static file serving setup complete");
    }

    // Start listening with enhanced error handling and port notification
    return new Promise<void>((resolve, reject) => {
      server.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server running at http://0.0.0.0:${PORT}`);
        console.log('Debug: Server started successfully and waiting for connections');

        // Send port readiness signal
        if (process.send) {
          process.send({
            port: PORT,
            wait_for_port: true,
            ready: true
          });
          console.log('Debug: Sent port readiness signal to parent process');
        }

        resolve();
      });

      server.once('error', (err: Error) => {
        if ((err as any).code === 'EADDRINUSE') {
          console.log(`Port ${PORT} is busy, attempting to close existing connections...`);
          require('child_process').exec(`lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`, async (error: Error) => {
            if (error) {
              console.error('Failed to kill process:', error);
              reject(error);
            } else {
              console.log(`Successfully freed port ${PORT}, retrying server start...`);
              // Wait a moment before retrying
              setTimeout(() => {
                startServer().then(resolve).catch(reject);
              }, 1000);
            }
          });
        } else {
          console.error(`Server error: ${err.message}`);
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server?.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});