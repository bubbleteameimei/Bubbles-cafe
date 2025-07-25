import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { createLogger } from '../utils/debug-logger';

const securityLogger = createLogger('Security');

// Comprehensive input validation schemas
export const securitySchemas = {
  // User input validation
  userInput: z.object({
    email: z.string().email().max(255).transform(s => s.toLowerCase().trim()),
    username: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_-]+$/),
    password: z.string().min(8).max(128),
    name: z.string().min(1).max(100).regex(/^[a-zA-Z\s'-]+$/),
    content: z.string().min(1).max(50000),
    title: z.string().min(1).max(200),
    url: z.string().url().max(2048).optional(),
    id: z.union([z.string(), z.number()]).transform(val => 
      typeof val === 'string' ? parseInt(val, 10) : val
    ).refine(val => Number.isInteger(val) && val > 0, 'Invalid ID')
  }),

  // API parameter validation
  pagination: z.object({
    page: z.number().int().min(1).max(1000).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).optional()
  }),

  // File upload validation
  fileUpload: z.object({
    filename: z.string().min(1).max(255).regex(/^[a-zA-Z0-9._-]+$/),
    mimetype: z.enum([
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv'
    ]),
    size: z.number().max(10 * 1024 * 1024) // 10MB max
  })
};

// Session security validation
export function validateSession(req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    securityLogger.warn('Request without session', { 
      ip: req.ip, 
      userAgent: req.get('User-Agent'),
      path: req.path 
    });
    return res.status(500).json({ error: 'Session configuration error' });
  }

  // Check for session hijacking attempts
  const currentFingerprint = generateFingerprint(req);
  if (req.session.fingerprint && req.session.fingerprint !== currentFingerprint) {
    securityLogger.error('Potential session hijacking detected', {
      sessionId: req.sessionID,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      storedFingerprint: req.session.fingerprint,
      currentFingerprint
    });
    
    req.session.destroy((err) => {
      if (err) securityLogger.error('Failed to destroy hijacked session', { error: err.message });
    });
    
    return res.status(401).json({ error: 'Session security violation' });
  }

  // Set fingerprint for new sessions
  if (!req.session.fingerprint) {
    req.session.fingerprint = currentFingerprint;
  }

  // Check session age
  const sessionAge = Date.now() - (req.session.createdAt || 0);
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  if (sessionAge > maxAge) {
    securityLogger.info('Session expired due to age', { sessionId: req.sessionID, age: sessionAge });
    req.session.destroy((err) => {
      if (err) securityLogger.error('Failed to destroy expired session', { error: err.message });
    });
    return res.status(401).json({ error: 'Session expired' });
  }

  next();
}

// Generate browser fingerprint for session validation
function generateFingerprint(req: Request): string {
  const components = [
    req.get('User-Agent') || '',
    req.get('Accept-Language') || '',
    req.get('Accept-Encoding') || '',
    req.ip
  ];
  
  return require('crypto')
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
}

// Input sanitization middleware
export function sanitizeInput(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and sanitize request body
      if (req.body && Object.keys(req.body).length > 0) {
        req.body = schema.parse(req.body);
      }

      // Validate query parameters
      if (req.query && Object.keys(req.query).length > 0) {
        req.query = sanitizeQueryParams(req.query);
      }

      // Validate route parameters
      if (req.params && Object.keys(req.params).length > 0) {
        req.params = sanitizeParams(req.params);
      }

      next();
    } catch (error) {
      securityLogger.warn('Input validation failed', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      });
      
      return res.status(400).json({
        error: 'Invalid input data',
        details: error instanceof z.ZodError ? error.errors : undefined
      });
    }
  };
}

// Sanitize query parameters
function sanitizeQueryParams(query: any): any {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      sanitized[key] = value
        .replace(/[<>'"&]/g, '') // Remove HTML characters
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/data:/gi, '') // Remove data: protocol
        .slice(0, 1000); // Limit length
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        typeof v === 'string' ? v.replace(/[<>'"&]/g, '').slice(0, 1000) : v
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Sanitize route parameters
function sanitizeParams(params: any): any {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // For IDs, ensure they're numeric
      if (key.includes('id') || key.includes('Id')) {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue <= 0) {
          throw new Error(`Invalid ${key}: must be a positive integer`);
        }
        sanitized[key] = numValue.toString();
      } else {
        // General string sanitization
        sanitized[key] = value
          .replace(/[<>'"&]/g, '')
          .slice(0, 100);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// SQL injection prevention
export function preventSQLInjection(req: Request, res: Response, next: NextFunction) {
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bSELECT\b.*\bFROM\b.*\bWHERE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bALTER\b.*\bTABLE\b)/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bOR\b.*=.*|AND.*=.*)/i
  ];

  const checkForSQL = (obj: any, path: string = ''): boolean => {
    if (typeof obj === 'string') {
      return sqlPatterns.some(pattern => pattern.test(obj));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (checkForSQL(value, `${path}.${key}`)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Check all input sources
  const inputs = [
    { source: 'body', data: req.body },
    { source: 'query', data: req.query },
    { source: 'params', data: req.params }
  ];

  for (const input of inputs) {
    if (checkForSQL(input.data)) {
      securityLogger.error('SQL injection attempt detected', {
        source: input.source,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        data: JSON.stringify(input.data)
      });
      
      return res.status(400).json({ error: 'Invalid request format' });
    }
  }

  next();
}

// XSS prevention
export function preventXSS(req: Request, res: Response, next: NextFunction) {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onerror=/gi,
    /onclick=/gi,
    /onmouseover=/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi
  ];

  const sanitizeString = (str: string): string => {
    let sanitized = str;
    xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    return sanitized;
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    return obj;
  };

  // Sanitize all inputs
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
}

// Authentication rate limiting
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    securityLogger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    res.status(429).json({ error: 'Too many authentication attempts' });
  }
});

// API rate limiting
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many API requests' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    securityLogger.warn('API rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    res.status(429).json({ error: 'Too many API requests' });
  }
});

// Request size limiting
export function limitRequestSize(maxSize: number = 10 * 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    
    if (contentLength > maxSize) {
      securityLogger.warn('Request size limit exceeded', {
        size: contentLength,
        maxSize,
        ip: req.ip,
        path: req.path
      });
      
      return res.status(413).json({ error: 'Request too large' });
    }
    
    next();
  };
}

// Security headers middleware
export function setSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS for HTTPS
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
}

// Comprehensive security middleware stack
export function applySecurityMiddleware() {
  return [
    setSecurityHeaders,
    limitRequestSize(),
    validateSession,
    preventSQLInjection,
    preventXSS
  ];
}

export default {
  validateSession,
  sanitizeInput,
  preventSQLInjection,
  preventXSS,
  authRateLimit,
  apiRateLimit,
  limitRequestSize,
  setSecurityHeaders,
  applySecurityMiddleware,
  securitySchemas
};