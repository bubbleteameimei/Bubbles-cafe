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
const HOST = '0.0.0.0';

// Set trust proxy to true for proper header handling behind proxies
app.set('trust proxy', true);

// Create server instance outside startServer for proper cleanup
let server: ReturnType<typeof createServer>;

async function startServer() {
  try {
    console.log('[Server] Starting server initialization...');
    console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
    console.log(`[Server] Host: ${HOST}`);
    console.log(`[Server] Port: ${PORT}`);

    // Serve static assets from attached_assets directory
    app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets'), {
      maxAge: '1d',
      fallthrough: false
    }));

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

    // Register routes and middleware
    if (isDev) {
      console.log('[Server] Setting up development environment');
      console.log('[Server] Registering API routes');
      registerRoutes(app);
      console.log("[Server] API routes registered successfully");

      console.log('[Server] Setting up Vite middleware');
      await setupVite(app, server);
      console.log("[Server] Vite middleware setup complete");
    } else {
      console.log('[Server] Setting up production environment');
      serveStatic(app);
      console.log("[Server] Static file serving setup complete");
    }

    // Start listening with enhanced error handling and port notification
    return new Promise<void>((resolve, reject) => {
      server.listen(PORT, HOST, () => {
        console.log(`[Server] Server running at http://${HOST}:${PORT}`);
        console.log('[Server] Server started successfully');

        // Send port readiness signal with explicit wait_for_port flag
        if (process.send) {
          process.send({
            port: PORT,
            wait_for_port: true,
            ready: true
          });
          console.log('[Server] Sent port readiness signal');
        }

        resolve();
      });

      // Add error event handler
      server.on('error', (error: Error) => {
        console.error('[Server] Server error:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`[Server] Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Start the server
startServer().catch(err => {
  console.error('[Server] Critical startup error:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM signal received: closing HTTP server');
  server?.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});

export default app;