/**
 * Authentication Middleware
 * 
 * This module provides middleware functions for checking user authentication and authorization.
 */

import { Request, Response, NextFunction } from 'express';

// Check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized' });
};

// Check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
};

// Allow access for authenticated users or continue for public routes
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Even if not authenticated, allow the request to continue
  return next();
};

export default {
  isAuthenticated,
  isAdmin,
  optionalAuth
};