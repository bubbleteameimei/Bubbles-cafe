/**
 * Type declarations for the application
 */

import 'express';

declare global {
  namespace Express {
    // Extend the Request interface
    interface Request {
      // Flag to explicitly skip CSRF validation for specific routes
      skipCSRF?: boolean;
      isAuthenticated: () => boolean;
      user?: any;
    }
  }
}

declare module 'drizzle-zod' {
  // Relaxed typing to accommodate schema helper across versions
  export function createInsertSchema<T>(table: any, fieldsConfig?: Record<string, any>, options?: Record<string, any>): any;
}