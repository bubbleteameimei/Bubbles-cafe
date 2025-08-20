import { Express, Request, Response, NextFunction } from "express";

/**
 * Sets up CORS for cross-domain deployment
 * This file should be imported and used in server/index.ts
 * when deploying the backend separately from the frontend
 * 
 * Usage:
 * import { setupCors } from "./cors-setup";
 * 
 * // Add after initializing Express
 * setupCors(app);
 */
export function setupCors(app: Express) {
  // List of allowed origins
  const allowedOrigins = [
    // Add frontend URL from environment variables for production
    process.env.FRONTEND_URL,
    // Development URLs
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
  ].filter(Boolean); // Filter out undefined values

  // CORS middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    console.log(`[CORS] Request from origin: ${origin || 'none'}, NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Special case: if FRONTEND_URL is set to '*', allow all origins
    if (process.env.FRONTEND_URL === '*') {
      res.setHeader("Access-Control-Allow-Origin", "*");
      console.log(`[CORS] Allowed all origins (wildcard mode)`);
      // Note: Cannot use credentials with wildcard origin
    } 
    // Allow specific origins and include credentials
    else if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      console.log(`[CORS] Allowed configured origin: ${origin}`);
    }
    // Check for Replit domains (works for both dev and prod)
    else if (origin && (
      /\.repl\.co$/.test(origin) || 
      /\.replit\.dev$/.test(origin) ||
      /\.replit\.app$/.test(origin) ||
      origin.includes('.replit.') ||
      origin.includes('repl.co')
    )) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      console.log(`[CORS] Allowed Replit domain: ${origin}`);
    }
    // If no match but we're not in production, allow the origin anyway for development convenience
    else if (origin && process.env.NODE_ENV !== 'production') {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      console.log(`[CORS] Allowed unlisted origin in development: ${origin}`);
    }
    // In production, be more restrictive but still log what's being blocked
    else if (origin && process.env.NODE_ENV === 'production') {
      console.warn(`[CORS] Blocked unauthorized origin in production: ${origin}`);
    }
    // No origin header (like direct API calls)
    else if (!origin) {
      // Allow requests without origin (like direct API calls, mobile apps, etc.)
      res.setHeader("Access-Control-Allow-Origin", "*");
      console.log(`[CORS] Allowed request without origin header`);
    }
    
    // Allow specific headers
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token"
    );
    
    // Allow specific methods
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    
    next();
  });

  console.log("CORS middleware configured for cross-domain deployment");
}