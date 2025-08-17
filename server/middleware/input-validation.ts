import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createSecureLogger } from '../utils/secure-logger';

const validationLogger = createSecureLogger('InputValidation');

// Common validation schemas
export const commonSchemas = {
  id: z.number().int().positive(),
  slug: z.string().min(1).max(255).regex(/^[a-zA-Z0-9-_]+$/, "Invalid slug format"),
  email: z.string().email().min(1).max(255).transform(s => s.toLowerCase().trim()),
  username: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  content: z.string().min(1).max(50000).trim(),
  title: z.string().min(1).max(200).trim(),
  url: z.string().url().max(500),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(5000).default(10)
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

// Create validation middleware
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize input first
      req.body = sanitizeInput(req.body);
      
      // Then validate
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      validationLogger.warn('Input validation failed', { 
        path: req.path,
        method: req.method,
        error: error instanceof z.ZodError ? error.errors : 'Unknown validation error'
      });
      
      res.status(400).json({
        error: 'Invalid input',
        details: error instanceof z.ZodError ? error.errors : undefined
      });
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      validationLogger.warn('Query validation failed', { 
        path: req.path,
        method: req.method
      });
      
      res.status(400).json({
        error: 'Invalid query parameters',
        details: error instanceof z.ZodError ? error.errors : undefined
      });
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      validationLogger.warn('Params validation failed', { 
        path: req.path,
        method: req.method
      });
      
      res.status(400).json({
        error: 'Invalid parameters',
        details: error instanceof z.ZodError ? error.errors : undefined
      });
    }
  };
};