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
  '/api/newsletter/unsubscribe',
  '/api/newsletter-direct/subscribe', // Add our direct newsletter endpoint
  '/api/fresh-newsletter/subscribe', // Add our fresh newsletter endpoint
  '/api/check-email-config',
  '/api/performance/metrics',
  // Add dynamic routes for post reactions - both with and without /api prefix
  '/api/posts/:postId/reaction',
  '/posts/:postId/reaction',
  // Add our new CSRF-free endpoint prefix
  '/api/no-csrf',
  '/no-csrf',
  '/api/no-csrf/posts'
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

    // 2. Skip validation for safe methods or if explicitly flagged to skip CSRF
    if (SAFE_METHODS.includes(req.method) || (req as any).skipCSRF === true) {
      return next();
    }

    // 3. Check if the path should be excluded from CSRF validation
    // For debugging - grab different versions of the path for comparison
    const fullPath = req.originalUrl;
    const apiPath = req.path;
    
    // Log the path for debugging
    console.log(`Full path: ${fullPath}, API path: ${apiPath}, Original URL: ${req.originalUrl}, Base URL: ${req.baseUrl}`);
    
    // Extract the API-relative path without the /api prefix if it exists
    let relPath = apiPath;
    if (relPath.startsWith('/api/')) {
      relPath = relPath.substring(4); // Remove /api prefix
    }
    
    // Special case for reaction URLs - explicitly check for reaction pattern for both apiPath and fullPath
    const reactionPattern = /posts\/\d+\/reaction/;
    const reactionsPattern = /posts\/\d+\/reactions/;
    const bypassPattern = /csrf-test-bypass\/react\/\d+/;
    const noCsrfPattern = /no-csrf/;
    
    if (reactionPattern.test(apiPath) || reactionPattern.test(fullPath) || 
        reactionsPattern.test(apiPath) || reactionsPattern.test(fullPath) ||
        bypassPattern.test(apiPath) || bypassPattern.test(fullPath) ||
        noCsrfPattern.test(apiPath) || noCsrfPattern.test(fullPath)) {
      console.log(`CSRF bypassed for special URL: ${apiPath} (fullPath: ${fullPath})`);
      return next();
    }
    
    console.log(`CSRF checking path: ${req.method} ${apiPath} (API relative: ${relPath})`);
    console.log(`Ignore paths:`, ignorePaths);
    
    const shouldExcludePath = ignorePaths.some(ignorePath => {
      // Direct path match against all path variations
      if (apiPath === ignorePath || fullPath === ignorePath || relPath === ignorePath) {
        console.log(`CSRF direct path match: ${ignorePath}`);
        return true;
      }
      
      // Check for path with parameters (e.g., /api/posts/:postId/reaction)
      if (ignorePath.includes(':')) {
        // Convert pattern like /api/posts/:postId/reaction to regex
        const regexPattern = ignorePath.replace(/:[^/]+/g, '([^/]+)');
        const regex = new RegExp(`^${regexPattern}$`);
        
        // Test against all path variations
        const matchesFullPath = regex.test(fullPath);
        const matchesApiPath = regex.test(apiPath);
        const matchesRelPath = regex.test(relPath);
        
        if (matchesFullPath || matchesApiPath || matchesRelPath) {
          console.log(`CSRF path parameter match: ${ignorePath} matches ${matchesFullPath ? 'fullPath' : (matchesApiPath ? 'apiPath' : 'relPath')}`);
          return true;
        }
        
        // Additional check for paths that might not match exactly due to query parameters
        const fullPathWithoutQuery = fullPath.split('?')[0];
        const apiPathWithoutQuery = apiPath.split('?')[0];
        const relPathWithoutQuery = relPath.split('?')[0];
        
        const matchesWithoutQuery = 
          regex.test(fullPathWithoutQuery) || 
          regex.test(apiPathWithoutQuery) || 
          regex.test(relPathWithoutQuery);
          
        if (matchesWithoutQuery) {
          console.log(`CSRF path parameter match (without query): ${ignorePath}`);
          return true;
        }
      }
      
      // Handle path segments - check if there's a pattern that belongs to a route group
      // For example, if "/api/posts" is in ignore list, also ignore "/api/posts/123/reaction"
      if (apiPath.startsWith(ignorePath + '/') || 
          fullPath.startsWith(ignorePath + '/') || 
          (ignorePath.startsWith('/api/') && fullPath.includes(ignorePath))) {
        console.log(`CSRF path segment match: ${ignorePath} is a prefix of the request path`);
        return true;
      }
      
      return false;
    });

    if (shouldExcludePath) {
      return next();
    }

    // 4. Validate CSRF token for all other requests
    const requestToken = req.headers[CSRF_HEADER_NAME.toLowerCase()] as string || 
                         (req.body && req.body._csrf);

    if (!requestToken) {
      console.log(`CSRF validation failed: Token missing from request for ${req.method} ${req.path}`);
      return res.status(403).json({
        error: 'CSRF token is missing from request',
        code: 'CSRF_TOKEN_MISSING',
        path: req.path,
        method: req.method,
        headers: Object.keys(req.headers)
      });
    }

    if (requestToken !== req.session.csrfToken) {
      console.log(`CSRF validation failed: Token mismatch for ${req.method} ${req.path}`);
      console.log(`  Expected: ${req.session.csrfToken.substring(0, 10)}...`);
      console.log(`  Received: ${requestToken.substring(0, 10)}...`);
      
      return res.status(403).json({
        error: 'Invalid CSRF token (mismatch)',
        code: 'CSRF_TOKEN_INVALID',
        path: req.path,
        method: req.method
      });
    }

    next();
  };
}