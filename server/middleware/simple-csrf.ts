/**
 * Simple CSRF Protection Middleware
 * 
 * A simpler approach to CSRF protection using Express middleware.
 * This replaces the more complex implementation with multiple layers.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const CSRF_COOKIE_NAME = 'csrf-token';

// Secure configuration based on environment
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  secure: isProduction, // HTTPS only in production
  sameSite: 'strict' as const, // Prevent CSRF attacks
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  httpOnly: false // Must be accessible by JavaScript for token submission
};

// Paths that should be excluded from CSRF validation
// Keep this list minimal for security
const EXCLUDED_PATHS = [
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-reset-token',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/social-login',
  '/api/posts', // Public read-only posts endpoint
  '/api/recommendations',
  '/api/user-feedback' // Public feedback endpoint
];

// Additional paths for development only
const DEV_EXCLUDED_PATHS = isProduction ? [] : [
  '/api/test',
  '/api/csrf-test'
];

const ALL_EXCLUDED_PATHS = [...EXCLUDED_PATHS, ...DEV_EXCLUDED_PATHS];

function isPathExcluded(path: string): boolean {
  // Check for exact matches first
  if (ALL_EXCLUDED_PATHS.includes(path)) {
    return true;
  }
  
  // Check for pattern matches (be very specific to avoid bypasses)
  const normalizedPath = path.replace(/^\/api/, ''); // Remove /api prefix if present
  
  // Only allow specific GET endpoints without CSRF
  if (normalizedPath.startsWith('/posts/') && normalizedPath.endsWith('/recommendations')) {
    return true;
  }
  
  return false;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function validateToken(sessionToken: string, requestToken: string): boolean {
  if (!sessionToken || !requestToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(sessionToken, 'hex'),
    Buffer.from(requestToken, 'hex')
  );
}

export function simpleCSRFProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Ensure we have a session and generate/refresh CSRF token
      if (!req.session) {
        return res.status(500).json({ message: 'Session not available' });
      }

      // Generate new token if none exists
      if (!req.session.csrfToken) {
        req.session.csrfToken = generateToken();
      }

      // Set CSRF token in cookie for client access
      res.cookie(CSRF_COOKIE_NAME, req.session.csrfToken, cookieOptions);

      // 2. Skip validation for safe methods
      if (SAFE_METHODS.includes(req.method)) {
        return next();
      }

      // 3. Check if the path should be excluded from CSRF validation
      if (isPathExcluded(req.path)) {
        return next();
      }

      // 4. For unsafe methods, validate CSRF token
      const requestToken = req.get('X-CSRF-Token') || 
                          req.body?.csrfToken || 
                          req.query?.csrfToken as string;

      if (!requestToken) {
        return res.status(403).json({ 
          message: 'CSRF token missing',
          code: 'CSRF_TOKEN_MISSING'
        });
      }

      if (!validateToken(req.session.csrfToken, requestToken)) {
        return res.status(403).json({ 
          message: 'CSRF token invalid',
          code: 'CSRF_TOKEN_INVALID'
        });
      }

      // Token is valid, proceed
      next();
    } catch (error) {
      console.error('CSRF protection error:', error);
      return res.status(500).json({ message: 'CSRF protection error' });
    }
  };
}

// Endpoint to get CSRF token for client-side use
export function getCSRFToken(req: Request, res: Response): void {
  if (!req.session?.csrfToken) {
    res.status(500).json({ message: 'CSRF token not available' });
    return;
  }
  
  res.json({ 
    csrfToken: req.session.csrfToken,
    cookieName: CSRF_COOKIE_NAME
  });
}