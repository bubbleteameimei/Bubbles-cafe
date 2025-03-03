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
const PORT = parseInt(process.env.PORT || "5000", 10);

// Create server instance outside startServer for proper cleanup
let server: ReturnType<typeof createServer>;

async function startServer() {
  try {
    console.log('[Server] Starting initialization...');
    console.log(`[Server] Target port: ${PORT}`);

    // Check if database needs seeding
    const [{ value: postsCount }] = await db.select({ value: count() }).from(posts);
    if (postsCount === 0) {
      console.log('[Server] Database is empty, starting seeding process...');
      await seedDatabase();
      console.log('[Server] Database seeding completed successfully');
    } else {
      console.log(`[Server] Database already contains ${postsCount} posts, skipping seeding`);
    }

    // Create server instance
    server = createServer(app);
    console.log('[Server] HTTP server instance created');

    // Register routes and middleware
    if (isDev) {
      console.log('[Server] Registering API routes in development mode');
      registerRoutes(app);
      console.log("[Server] API routes registered successfully");

      console.log('[Server] Setting up Vite middleware');
      await setupVite(app, server);
      console.log("[Server] Vite middleware setup complete");
    } else {
      console.log('[Server] Setting up static file serving for production');
      serveStatic(app);
      console.log("[Server] Static file serving setup complete");
    }

    // Start listening with enhanced error handling and port notification
    return new Promise<void>((resolve, reject) => {
      const startServerOnPort = () => {
        console.log(`[Server] Attempting to bind to port ${PORT}...`);
        server.listen(PORT, '0.0.0.0', () => {
          console.log(`[Server] Successfully bound to port ${PORT}`);
          console.log(`[Server] Server running at http://0.0.0.0:${PORT}`);

          // Send port readiness signal
          if (process.send) {
            console.log('[Server] Sending port readiness signal to parent process');
            process.send({
              port: PORT,
              wait_for_port: true,
              ready: true
            });
            console.log('[Server] Port readiness signal sent successfully');
          }

          resolve();
        });
      };

      server.once('error', (err: Error) => {
        if ((err as any).code === 'EADDRINUSE') {
          console.log(`[Server] Port ${PORT} is busy, attempting to free it...`);
          require('child_process').exec(`lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`, (error: Error) => {
            if (error) {
              console.error('[Server] Failed to kill process:', error);
              reject(error);
            } else {
              console.log(`[Server] Successfully freed port ${PORT}, retrying in 1 second...`);
              setTimeout(startServerOnPort, 1000);
            }
          });
        } else {
          console.error('[Server] Unexpected error:', err.message);
          reject(err);
        }
      });

      startServerOnPort();
    });
  } catch (error) {
    console.error(`[Server] Critical error: ${error instanceof Error ? error.message : String(error)}`);
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