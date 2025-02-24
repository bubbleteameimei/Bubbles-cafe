import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { setupAuth } from "./auth";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";
import { seedDatabase } from "./seed";
import { posts } from "@shared/schema";
import { count } from "drizzle-orm";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const isDev = process.env.NODE_ENV !== 'production';

// Declare server variable in module scope
let server: Server;

// Create public directories if they don't exist
const publicDir = path.join(__dirname, 'public');
const audioDir = path.join(publicDir, 'audio');

// Ensure directories exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Copy audio file if it doesn't exist in the target location
const sourceAudio = path.join(__dirname, '..', 'attached_assets', 'Audio.mp3');
const targetAudio = path.join(audioDir, 'ambient.mp3');
if (fs.existsSync(sourceAudio) && !fs.existsSync(targetAudio)) {
  fs.copyFileSync(sourceAudio, targetAudio);
  console.log('Audio file copied to public directory');
}

// Set trust proxy first
app.set('trust proxy', 1);

// Enable Gzip compression
app.use(compression());

// Security headers with updated CSP for audio
app.use(helmet({
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      mediaSrc: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Serve static files with proper cache control
app.use('/audio', express.static(audioDir, {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
  }
}));

// Rate limiter with adjusted settings for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Session setup with enhanced error handling
const PostgresSession = connectPgSimple(session);

try {
  const sessionConfig: session.SessionOptions = {
    store: new PostgresSession({
      conObject: {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      },
      createTableIfMissing: true,
      pruneSessionInterval: 60
    }),
    secret: process.env.SESSION_SECRET || process.env.REPL_ID || 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    },
    name: 'horror.session'
  };

  app.use(session(sessionConfig));
  console.log('Session middleware configured successfully');
} catch (error) {
  console.error(`Session setup failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

// Set up auth
setupAuth(app);

async function startServer() {
  try {
    console.log('Starting server initialization...');

    // Check if database needs seeding
    const [{ value: postsCount }] = await db.select({ value: count() }).from(posts);
    if (postsCount === 0) {
      console.log('Database is empty, starting seeding process...');
      await seedDatabase();
      console.log('Database seeding completed successfully');
    } else {
      console.log(`Database already contains ${postsCount} posts, skipping seeding`);
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
      server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running at http://0.0.0.0:${PORT}`);

        // Send port readiness signal
        if (process.send) {
          process.send({
            port: PORT,
            wait_for_port: true,
            ready: true
          });
        }

        resolve();
      });

      server.once('error', (err: Error) => {
        console.error(`Server error: ${err.message}`);
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Enhanced graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Starting graceful shutdown...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    console.log('Server not initialized');
    process.exit(0);
  }
});

// Start the server with enhanced error handling
startServer().catch((error) => {
  console.error(`Critical error during server start: ${error.message}`);
  process.exit(1);
});