/**
 * CSRF Protection Middleware
 * 
 * This middleware provides CSRF protection using a double-submit pattern
 * with the session to store the token instead of relying on cookie-parser.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF token name
export const CSRF_TOKEN_NAME = 'XSRF-TOKEN';
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Extract the CSRF token from a request
 * Checks both headers and form body
 */
export function getTokenFromRequest(req: Request): string | null {
  // Check for token in headers
  const headerToken = req.headers[CSRF_HEADER_NAME.toLowerCase()];
  if (headerToken) {
    return Array.isArray(headerToken) ? headerToken[0] : headerToken;
  }

  // Check for token in body
  if (req.body && req.body._csrf) {
    return req.body._csrf;
  }

  return null;
}

/**
 * Set CSRF token in the session and as a cookie
 */
export function setCsrfToken(secureCookie = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if a token is already set
    if (req.session.csrfToken) {
      // Also set the token in the cookie for client-side access
      res.cookie(CSRF_TOKEN_NAME, req.session.csrfToken, {
        httpOnly: false, // Needs to be accessible by JavaScript
        secure: secureCookie,
        sameSite: 'lax'
      });
      return next();
    }

    // Generate a new token
    const token = generateToken();
    req.session.csrfToken = token;

    // Set the token as a cookie for client-side access
    res.cookie(CSRF_TOKEN_NAME, token, {
      httpOnly: false, // Needs to be accessible by JavaScript
      secure: secureCookie,
      sameSite: 'lax'
    });

    next();
  };
}

/**
 * Middleware to make CSRF token available in views
 */
export function csrfTokenToLocals(req: Request, res: Response, next: NextFunction) {
  // Only proceed if a session with a CSRF token exists
  if (req.session && req.session.csrfToken) {
    // Add to res.locals for template rendering
    res.locals.csrfToken = req.session.csrfToken;
  }
  next();
}

/**
 * Options for CSRF validation
 */
interface CsrfValidationOptions {
  ignorePaths?: string[];
  ignoreMethods?: string[];
}

/**
 * Validate CSRF token on non-GET requests
 */
export function validateCsrfToken(options: CsrfValidationOptions = {}) {
  const ignorePaths = options.ignorePaths || [];
  const ignoreMethods = options.ignoreMethods || ['GET', 'HEAD', 'OPTIONS'];

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip validation for ignored methods
    if (ignoreMethods.includes(req.method)) {
      return next();
    }

    // Skip validation for ignored paths
    if (ignorePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Ensure session exists and has a CSRF token
    if (!req.session || !req.session.csrfToken) {
      return res.status(403).json({
        error: 'CSRF token is missing from session'
      });
    }

    // Get token from request
    const requestToken = getTokenFromRequest(req);
    if (!requestToken) {
      return res.status(403).json({
        error: 'CSRF token is missing from request'
      });
    }

    // Validate token
    if (requestToken !== req.session.csrfToken) {
      return res.status(403).json({
        error: 'CSRF token validation failed'
      });
    }

    next();
  };
}

// Add type definitions
declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}