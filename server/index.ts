import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from "./routes";
import { db } from "./db";
import { posts } from "@shared/schema";
import { count } from "drizzle-orm";
import { seedDatabase } from "./seed";
import path from "path";
import helmet from "helmet";
import { config } from "@shared/config";

const app = express();
const isDev = process.env.NODE_ENV !== "production";
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = '0.0.0.0';

// Create server instance outside startServer for proper cleanup
let server: ReturnType<typeof createServer>;

// Configure basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic security headers
app.use(helmet({
  contentSecurityPolicy: false
}));

async function startServer() {
  try {
    console.log('\n=== Starting Server ===');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Host: ${HOST}`);
    console.log(`Port: ${PORT}`);

    // Check database connection first
    const [{ value: postsCount }] = await db.select({ value: count() }).from(posts);
    console.log(`Database connected, found ${postsCount} posts`);

    if (postsCount === 0) {
      console.log('Seeding database...');
      await seedDatabase();
      console.log('Database seeding completed');
    }

    // Create server instance
    server = createServer(app);

    // Setup routes based on environment
    if (isDev) {
      console.log('Setting up development environment');
      registerRoutes(app);
      await setupVite(app, server);
    } else {
      console.log('Setting up production environment');
      serveStatic(app);
    }

    // Start listening with enhanced error handling and port notification
    return new Promise<void>((resolve, reject) => {
      server.listen(PORT, HOST, () => {
        console.log(`\nServer is running at http://${HOST}:${PORT}`);

        // Send port readiness signal with explicit wait_for_port flag
        if (process.send) {
          process.send({
            port: PORT,
            wait_for_port: true,
            ready: true
          });
          console.log('Sent port readiness signal');
        }

        resolve();
      });

      server.on('error', (error: Error & { code?: string }) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use`);
        }
        reject(error);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  console.error('Critical startup error:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server?.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;