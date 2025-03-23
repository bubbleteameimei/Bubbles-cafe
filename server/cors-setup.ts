import { Express, Request, Response, NextFunction } from "express";
import { config } from "../shared/config";

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
    // Add your frontend URLs here
    "https://your-frontend-domain.vercel.app",
    // Development URLs
    "http://localhost:3000",
    "http://localhost:5173"
  ];

  // CORS middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    // Allow the specified origins
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    
    // Allow credentials
    res.setHeader("Access-Control-Allow-Credentials", "true");
    
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
      return res.status(200).end();
    }
    
    next();
  });

  console.log("CORS middleware configured for cross-domain deployment");
}