/**
 * Simple CSRF Protection Middleware
 * 
 * A simpler approach to CSRF protection using Express middleware.
 * This replaces the more complex implementation with multiple layers.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF token name
export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

// List of paths to exclude from CSRF protection
const DEFAULT_EXCLUDED_PATHS = [
  '/health',
  '/api/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-reset-token',
  '/api/feedback',
  '/api/posts',
  '/api/reader/bookmarks',
  '/api/analytics',
  '/api/wordpress/sync',
  '/api/contact',
  '/api/newsletter/subscribe',
  '/api/newsletter/unsubscribe'
];

// List of methods that don't need CSRF protection
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates CSRF protection middleware
 */
export function createCsrfMiddleware(options: {
  ignorePaths?: string[],
  cookie?: {
    secure?: boolean,
    sameSite?: 'lax' | 'strict' | 'none'
  }
} = {}) {
  // Combine default excluded paths with any additional ones provided
  const ignorePaths = [...DEFAULT_EXCLUDED_PATHS, ...(options.ignorePaths || [])];
  
  // Set cookie options with sensible defaults
  const cookieOptions = {
    secure: options.cookie?.secure ?? (process.env.NODE_ENV === 'production'),
    sameSite: options.cookie?.sameSite ?? (process.env.NODE_ENV === 'production' ? 'none' : 'lax')
  };

  return (req: Request, res: Response, next: NextFunction) => {
    // 1. For all requests, ensure a CSRF token exists in the session and as a cookie
    if (!req.session.csrfToken) {
      const token = generateToken();
      req.session.csrfToken = token;
      
      res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Must be accessible by JavaScript
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite
      });
    } else {
      // Refresh the cookie with the existing token
      res.cookie(CSRF_COOKIE_NAME, req.session.csrfToken, {
        httpOnly: false,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite
      });
    }

    // 2. Skip validation for safe methods like GET, HEAD, OPTIONS
    if (SAFE_METHODS.includes(req.method)) {
      return next();
    }

    // 3. Check if the path should be excluded from CSRF validation
    // Log path info for debugging
    console.log(`CSRF checking path: ${req.method} ${req.path} (API full: ${req.originalUrl})`);
    console.log(`Ignore paths:`, ignorePaths);
    
    const shouldExcludePath = ignorePaths.some(path => 
      req.path === path || 
      req.path.startsWith(path) ||
      req.originalUrl === path ||
      req.originalUrl.startsWith(path) ||
      // Handle the case where API path might be mapped differently
      req.originalUrl.includes(path)
    );

    if (shouldExcludePath) {
      return next();
    }

    // 4. Validate CSRF token for all other requests
    const requestToken = req.headers[CSRF_HEADER_NAME.toLowerCase()] as string || 
                         (req.body && req.body._csrf);

    if (!requestToken) {
      return res.status(403).json({
        error: 'CSRF token missing',
        path: req.path
      });
    }

    if (requestToken !== req.session.csrfToken) {
      return res.status(403).json({
        error: 'Invalid CSRF token',
        path: req.path
      });
    }

    next();
  };
}