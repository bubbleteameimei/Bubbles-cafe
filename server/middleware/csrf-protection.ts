/**
 * CSRF Protection Middleware
 */
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const CSRF_TOKEN_NAME = 'XSRF-TOKEN';
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getTokenFromRequest(req: Request): string | null {
  const headerToken = req.headers[CSRF_HEADER_NAME.toLowerCase()];
  if (headerToken) {
    return Array.isArray(headerToken) ? headerToken[0] : headerToken;
  }
  if (req.body && req.body._csrf) {
    return req.body._csrf;
  }
  return null;
}

export function getCsrfToken(req: Request, res: Response) {
  if (!req.session) {
    return res.status(500).json({
      error: 'Session not available',
      code: 'SESSION_UNAVAILABLE'
    });
  }
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
 * Optional ignorePaths to avoid touching session for endpoints like health checks.
 */
export function setCsrfToken(secureCookie = false, options?: { ignorePaths?: string[] }) {
  const ignorePaths = options?.ignorePaths || [];
  return (req: Request, _res: Response, next: NextFunction) => {
    const path = req.path;
    const original = req.originalUrl.split('?')[0];
    // Skip for ignored paths and if already set
    if (
      (req.session && req.session.csrfToken) ||
      ignorePaths.some(p => path === p || original === p || path.startsWith(p) || original.startsWith(p))
    ) {
      return next();
    }
    const token = generateToken();
    req.session.csrfToken = token;
    next();
  };
}

export function csrfTokenToLocals(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.csrfToken) {
    res.locals.csrfToken = req.session.csrfToken;
  }
  next();
}

interface CsrfValidationOptions {
  ignorePaths?: string[];
  ignoreMethods?: string[];
}

export function validateCsrfToken(options: CsrfValidationOptions = {}) {
  const ignorePaths = options.ignorePaths || [];
  const ignoreMethods = options.ignoreMethods || ['GET', 'HEAD', 'OPTIONS'];

  return (req: Request, res: Response, next: NextFunction) => {
    if (ignoreMethods.includes(req.method)) {
      return next();
    }
    if ((req as any)._csrfBypassApproved === true) {
      console.log(`CSRF validation skipped for ${req.method} ${req.path} (bypass flag set)`);
      return next();
    }

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

    const apiPath = req.path;
    const relPath = req.path.replace(/^\/api/, '');
    const endpointPath = req.originalUrl.split('?')[0];

    if (process.env.NODE_ENV !== 'production') {
      console.log(`CSRF checking path: ${req.method} ${req.path} (API relative: ${relPath})`);
      console.log(`Ignore paths:`, ignorePaths);
    }
    
    if (
      ignorePaths.some(path => 
        apiPath === path || 
        relPath === path || 
        endpointPath === path ||
        apiPath.startsWith(path) || 
        relPath.startsWith(path) ||
        endpointPath.startsWith(path) ||
        req.path.endsWith('/csrf-test-bypass') ||
        req.path.includes('/analytics/vitals') ||
        req.path.includes('/analytics/pageview') ||
        req.path.includes('/analytics/interaction') ||
        req.path.includes('/analytics/performance') ||
        req.path.includes('/reader/bookmarks') ||
        req.path.includes('/newsletter-direct/subscribe') ||
        req.path.includes('/newsletter/subscribe') ||
        req.path.includes('/newsletter/unsubscribe')
      )
    ) {
      console.log(`CSRF validation skipped for ${req.method} ${req.path} (matches ignore path)`);
      return next();
    }

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

    if (requestToken !== req.session.csrfToken) {
      console.warn(`CSRF validation failed: Token mismatch for ${req.method} ${req.path}`);
      return res.status(403).json({
        error: 'CSRF token validation failed',
        code: 'CSRF_TOKEN_INVALID',
        path: req.path,
        method: req.method
      });
    }

    next();
  };
}