import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'change-this-secret';
const TOKEN_VALIDITY_MINUTES = 30;
const TOKEN_HEADER = 'X-CSRF-Token';

interface TokenData {
  nonce: string;
  timestamp: number;
  signature: string;
}

/**
 * Generate a stateless CSRF token signed with HMAC
 * Format: nonce.timestamp.signature
 */
export function generateCsrfToken(): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000);
  const message = `${nonce}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(message)
    .digest('hex');
  return `${nonce}.${timestamp}.${signature}`;
}

/**
 * Verify and decode a CSRF token
 */
export function verifyAndDecodeCsrfToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [nonce, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Check timestamp validity (30 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp > TOKEN_VALIDITY_MINUTES * 60) {
      console.warn(`CSRF token expired: ${now - timestamp}s old`);
      return false;
    }

    // Verify signature
    const message = `${nonce}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(message)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('CSRF token verification error:', error);
    return false;
  }
}

/**
 * Get CSRF token from request (header or body)
 */
export function getTokenFromRequest(req: Request): string | null {
  const headerToken = req.headers[TOKEN_HEADER.toLowerCase()];
  if (headerToken) {
    return Array.isArray(headerToken) ? headerToken[0] : headerToken;
  }
  if (req.body?._csrf) {
    return req.body._csrf;
  }
  return null;
}

/**
 * API endpoint: GET /api/csrf-token
 * Returns a fresh CSRF token
 */
export function getCsrfTokenHandler(req: Request, res: Response) {
  const token = generateCsrfToken();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    csrfToken: token,
  });
}

/**
 * Middleware: Validate CSRF token on state-changing requests
 * Safe methods (GET, HEAD, OPTIONS) are skipped
 * Public endpoints (auth, health) are whitelisted
 */
export function validateCsrfToken(options: { ignorePaths?: string[]; ignoreMethods?: string[] } = {}) {
  const ignorePaths = new Set([
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/google-callback',
    '/api/health',
    '/api/csrf-token',
    '/api/analytics',
    '/api/wordpress',
    ...(options.ignorePaths || []),
  ]);

  const ignoreMethods = new Set(['GET', 'HEAD', 'OPTIONS', ...(options.ignoreMethods || [])]);

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF check for safe methods
    if (ignoreMethods.has(req.method)) {
      return next();
    }

    // Skip CSRF check for whitelisted paths (including base routes)
    const isIgnoredPath = ignorePaths.has(req.path) || Array.from(ignorePaths).some(p => req.path.startsWith(p));
    if (isIgnoredPath) {
      return next();
    }

    // Get token from request
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(403).json({
        error: 'CSRF token is missing',
        code: 'CSRF_TOKEN_MISSING',
        hint: 'Include X-CSRF-Token header or _csrf in body',
      });
    }

    // Verify token signature and timestamp
    if (!verifyAndDecodeCsrfToken(token)) {
      return res.status(403).json({
        error: 'CSRF token is invalid or expired',
        code: 'CSRF_TOKEN_INVALID',
        hint: 'Get a fresh token from /api/csrf-token',
      });
    }

    next();
  };
}

/**
 * Middleware: Inject CSRF token into response locals
 * (for template rendering, if needed)
 */
export function injectCsrfToken(req: Request, res: Response, next: NextFunction) {
  res.locals.csrfToken = generateCsrfToken();
  next();
}
