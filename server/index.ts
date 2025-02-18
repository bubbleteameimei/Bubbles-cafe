import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { setupAuth } from "./auth";
import { createServer } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const isDev = process.env.NODE_ENV !== 'production';

// Declare server variable in the module scope
let server: ReturnType<typeof createServer>;

// Enhance logging for startup process
function enhancedLog(message: string, type: 'info' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

// Set trust proxy first
app.set('trust proxy', 1);

// Enable Gzip compression
app.use(compression());

// Security headers with updated CSP for development
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Session setup
const PostgresSession = connectPgSimple(session);
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

// Set up auth
setupAuth(app);

async function startServer() {
  try {
    enhancedLog('Starting server initialization...');

    // Find available port
    const availablePort = await findAvailablePort(PORT);
    enhancedLog(`Found available port: ${availablePort}`);

    if (isDev) {
      // Register API routes BEFORE Vite middleware
      registerRoutes(app);
      enhancedLog("API routes registered successfully");

      // Setup Vite middleware AFTER API routes
      await setupVite(app, server);
      enhancedLog("Vite middleware setup complete");
    } else {
      serveStatic(app);
      enhancedLog("Static file serving setup complete");
    }

    // Start listening
    await new Promise<void>((resolve, reject) => {
      server.listen(availablePort, "0.0.0.0", () => {
        enhancedLog(`Server running on port ${availablePort} in ${process.env.NODE_ENV || 'development'} mode`);

        // Notify the workflow system about the port first
        if (process.send) {
          process.send({ 
            port: availablePort,
            wait_for_port: true 
          });
          enhancedLog('Sent port information to workflow system');
        }

        resolve();
      });

      server.once('error', reject);
    });
    if (process.send) {
          process.send('ready');
          enhancedLog('Sent ready signal to workflow system');
        }

  } catch (error) {
    enhancedLog(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  }
}

// Function to find an available port
function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const testServer = createServer();
    testServer.listen(startPort, () => {
      const { port } = testServer.address() as { port: number };
      testServer.close(() => resolve(port));
    });
    testServer.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve, reject);
      } else {
        reject(err);
      }
    });
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  enhancedLog('SIGTERM received. Starting graceful shutdown...');
  if (server) {
    server.close(() => {
      enhancedLog('Server closed');
      process.exit(0);
    });
  } else {
    enhancedLog('Server not initialized');
    process.exit(0);
  }
});

// Initialize server before starting
server = createServer(app);

// Start the server
startServer().catch((error) => {
  enhancedLog(`Critical error during server start: ${error.message}`, 'error');
  process.exit(1);
});