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
    }
  }
}