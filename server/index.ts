import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { setupAuth } from "./auth";
import helmet from "helmet";
import compression from "compression";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import path from 'path';
import { fileURLToPath } from "url";
import fs from 'fs';

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const isDev = process.env.NODE_ENV !== 'production';

// Create public directory if it doesn't exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Session setup
const PostgresSession = connectPgSimple(session);
const sessionConfig = {
  store: new PostgresSession({
    conObject: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    },
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
};

app.use(session(sessionConfig));

// Security headers
app.use(helmet({
  contentSecurityPolicy: isDev ? false : undefined
}));

// Auth setup
setupAuth(app);

async function startServer() {
  try {
    console.log('Starting server...');
    const server = createServer(app);

    if (isDev) {
      // Set up Vite middleware
      await setupVite(app, server);

      // API routes after Vite
      app.use('/api', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        next();
      });
      registerRoutes(app);
    } else {
      serveStatic(app);
      registerRoutes(app);
    }

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      if (process.send) {
        process.send({ port: PORT, ready: true });
      }
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
}

startServer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});