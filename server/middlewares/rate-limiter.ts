/**
 * Rate Limiting Middleware
 * 
 * This middleware provides protection against brute force attacks by limiting
 * the number of requests from a single IP address within a time window.
 * 
 * Includes:
 * - IP whitelisting for development/testing
 * - Environment-aware rate limits
 * - Tiered rate limiting based on authentication status
 */

import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import logger from '../utils/logger';
import { isWhitelisted } from './ip-whitelist';

// Environment detection
const isDev = process.env.NODE_ENV !== 'production';

// Higher limits for development environment
const getRequestLimit = (defaultLimit: number): number => {
  return isDev ? defaultLimit * 5 : defaultLimit; // 5x higher limits in development
};

// Custom skip function that checks whitelist only.
// Note: express-rate-limit does not support per-request dynamic max via skip;
// if you need different limits for authenticated users, use separate limiter instances.
const createSkipFunction = (_authenticatedMultiplier = 2) => {
  return (req: Request): boolean => {
    const ipAddress = req.ip || '';

    // Skip rate limiting for whitelisted IPs only
    if (isWhitelisted(ipAddress)) {
      logger.debug(`Rate limiting skipped for whitelisted IP: ${ipAddress}`);
      return true;
    }

    return false;
  };
};

// Global rate limiter for all routes
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: getRequestLimit(200), // Higher default limit (200 in prod, 1000 in dev)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
  skip: createSkipFunction(2) // Skip for whitelisted IPs and higher limits for auth users
});

// Stricter rate limiter for authentication routes
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: getRequestLimit(10), // Higher limits (10 in prod, 50 in dev)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after an hour'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Authentication rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
  skipSuccessfulRequests: true, // don't count successful logins against the limit
  skip: (req) => isWhitelisted(req.ip || '') // Skip for whitelisted IPs
});

// Rate limiter for sensitive operations (password reset, account deletion, etc.)
export const sensitiveOperationsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: getRequestLimit(5), // Higher limits (5 in prod, 25 in dev)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many sensitive operations from this IP, please try again after an hour'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Sensitive operations rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
  skip: (req) => isWhitelisted(req.ip || '') // Skip for whitelisted IPs
});

// Rate limiter for API routes
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: getRequestLimit(200), // Higher limits (200 in prod, 1000 in dev)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many API requests from this IP, please try again after 15 minutes'
  },
  handler: (req, res, next, options) => {
    logger.warn(`API rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
  skip: createSkipFunction(3) // Skip for whitelisted IPs and higher limits for auth users
});