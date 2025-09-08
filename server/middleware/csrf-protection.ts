/**
 * CSRF Protection Middleware
 * 
 * This middleware provides CSRF protection using a double-submit pattern
 * with the session to store the token instead of relying on cookie-parser.
 * 
 * SECURITY FIX: Tokens are no longer exposed via non-httpOnly cookies.
 * Instead, tokens are delivered through a secure endpoint that requires
 * proper authentication or session validation.
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
 * Get CSRF token from session for API endpoint
 */
export function getCsrfToken(req: Request, res: Response) {
  // Ensure we have a session
  if (!req.session) {
    return res.status(500).json({
      error: 'Session not available',
      code: 'SESSION_UNAVAILABLE'
    });
  }

  // Generate token if it doesn't exist
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    csrfToken: req.session.csrfToken
  });
  return;
}

/**
 * Set CSRF token in the session ONLY (no cookie exposure)
 * SECURITY FIX: Tokens are no longer exposed via cookies
 */
export function setCsrfToken(secureCookie = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if a token is already set
    if (req.session.csrfToken) {
      return next();
    }

    // Generate a new token and store ONLY in session
    const token = generateToken();
    req.session.csrfToken = token;

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
    
    // Skip if the bypass flag is set by another middleware
    if ((req as any)._csrfBypassApproved === true) {
      console.log(`CSRF validation skipped for ${req.method} ${req.path} (bypass flag set)`);
      return next();
    }

    // Do not bypass CSRF validation when Authorization headers are present
    // This server relies on session-based auth; bearer tokens are not a CSRF bypass mechanism here

    // Allowlist only specific endpoints to bypass CSRF header
    const allowlist = new Set<string>([
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/social-login',
      '/api/user/privacy-settings'
    ]);
    if (allowlist.has(req.path)) {
      return next();
    }

    // Skip validation for ignored paths
    // Get the path without the leading '/api' prefix since our routes are mounted at '/api'
    const apiPath = req.path;
    const relPath = req.path.replace(/^\/api/, '');
    const endpointPath = req.originalUrl.split('?')[0]; // Use originalUrl to handle cases where path might be rewritten

    // Debug output only in development to avoid log flooding
    if (process.env.NODE_ENV !== 'production') {
      console.log(`CSRF checking path: ${req.method} ${req.path} (API relative: ${relPath})`);
      console.log(`Ignore paths:`, ignorePaths);
    }
    
    // Fix: Check multiple path formats to handle various middleware configurations
    if (
      ignorePaths.some(path => 
        apiPath === path || 
        relPath === path || 
        endpointPath === path ||
        apiPath.startsWith(path) || 
        relPath.startsWith(path) ||
        endpointPath.startsWith(path) ||
        // Handle special case for bypass endpoint
        req.path.endsWith('/csrf-test-bypass') ||
        // Do NOT exempt comment write endpoints in production; keep only GETs exempt in route handlers if needed
        // Special cases for analytics endpoints that are exempt from CSRF
        req.path.includes('/analytics/vitals') ||
        req.path.includes('/analytics/pageview') ||
        req.path.includes('/analytics/interaction') ||
        req.path.includes('/analytics/performance') ||
        // Special case for reader bookmarks endpoints
        req.path.includes('/reader/bookmarks') ||
        // Special cases for newsletter endpoints
        req.path.includes('/newsletter-direct/subscribe') ||
        req.path.includes('/newsletter/subscribe') ||
        req.path.includes('/newsletter/unsubscribe')
      )
    ) {
      console.log(`CSRF validation skipped for ${req.method} ${req.path} (matches ignore path)`);
      return next();
    }

    // Ensure session exists and has a CSRF token; if not, attempt to initialize transparently
    if (!req.session || !req.session.csrfToken) {
      console.warn(`CSRF validation failed: Token missing from session for ${req.method} ${req.path}`);
      return res.status(403).json({
        error: 'CSRF token is missing from session',
        code: 'CSRF_SESSION_MISSING',
        hint: 'Fetch a CSRF token from /api/csrf-token before making state-changing requests',
        path: req.path,
        method: req.method
      });
    }

    // Get token from request
    const requestToken = getTokenFromRequest(req);
    if (!requestToken) {
      console.warn(`CSRF validation failed: Token missing from request for ${req.method} ${req.path}`);
      return res.status(403).json({
        error: 'CSRF token is missing from request',
        code: 'CSRF_TOKEN_MISSING',
        path: req.path,
        method: req.method
      });
    }

    // Validate token
    if (requestToken !== req.session.csrfToken) {
      console.warn(`CSRF validation failed: Token mismatch for ${req.method} ${req.path}`);
      return res.status(403).json({
        error: 'CSRF token validation failed',
        code: 'CSRF_TOKEN_INVALID',
        path: req.path,
        method: req.method
      });
    }

    // Token is valid
    next();
  };
}