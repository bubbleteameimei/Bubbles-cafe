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
import { config, isDevelopment, isProduction } from "@shared/config";
import developmentConfig from "@shared/config/development";
import productionConfig from "@shared/config/production";
import { getFeatureFlags, getApiConfig } from "@shared/config/utils";

const app = express();
const activeConfig = isDevelopment() ? developmentConfig : productionConfig;
const features = getFeatureFlags();
const apiConfig = getApiConfig();

// Set trust proxy to true for proper header handling behind proxies
app.set('trust proxy', true);

// Create server instance outside startServer for proper cleanup
let server: ReturnType<typeof createServer>;

async function startServer() {
  try {
    // Detailed environment logging
    console.log('\n=== Server Configuration ===');
    console.log(`Environment: ${config.NODE_ENV}`);
    console.log(`Host: ${config.HOST}`);
    console.log(`Port: ${config.PORT}`);
    console.log('\n=== Feature Flags ===');
    console.log('Debug Logging:', features.enableDebugLogging);
    console.log('Detailed Errors:', features.enableDetailedErrors);
    console.log('Hot Reload:', features.enableHotReload);
    console.log('Cache Enabled:', features.enableCache);
    console.log('\n=== API Configuration ===');
    console.log('Timeout:', apiConfig.timeoutMs, 'ms');
    console.log('Retry Attempts:', apiConfig.retryAttempts);
    console.log('Base URL:', apiConfig.baseUrl);
    console.log('Rate Limit Max:', apiConfig.rateLimitMax);
    console.log('\n=========================\n');

    // Apply security headers based on environment
    if (isProduction()) {
      app.use(helmet(activeConfig.HELMET_OPTIONS));
    }

    // Serve static assets from attached_assets directory with environment-specific caching
    app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets'), {
      maxAge: isProduction() ? '1d' : 0,
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

    // Register routes and middleware based on environment
    if (isDevelopment()) {
      console.log('[Server] Setting up development environment');
      console.log('[Server] Registering API routes');
      registerRoutes(app);
      console.log("[Server] API routes registered successfully");

      if (activeConfig.VITE_DEV_SERVER_ENABLED) {
        console.log('[Server] Setting up Vite middleware');
        await setupVite(app, server);
        console.log("[Server] Vite middleware setup complete");
      }
    } else {
      console.log('[Server] Setting up production environment');
      serveStatic(app);
      console.log("[Server] Static file serving setup complete");
    }

    // Start listening with enhanced error handling and port notification
    return new Promise<void>((resolve, reject) => {
      server.listen(config.PORT, config.HOST, () => {
        console.log(`[Server] Server running at http://${config.HOST}:${config.PORT}`);
        console.log('[Server] Server started successfully');

        // Send port readiness signal with explicit wait_for_port flag
        if (process.send) {
          process.send({
            port: config.PORT,
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