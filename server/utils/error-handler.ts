import { Request, Response, NextFunction } from 'express';
import { errorLogger } from './debug-logger';

// Custom error class for better error handling
export class CustomError extends Error {
  statusCode: number;
  code: string;
  
  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.statusCode = statusCode;
    
    // Capture stack trace
    Error.captureStackTrace(this, CustomError);
  }
}

// Error factory functions - now properly callable
export const createError = {
  badRequest: (message: string) => new CustomError(message, 'BAD_REQUEST', 400),
  unauthorized: (message: string = 'Unauthorized') => new CustomError(message, 'UNAUTHORIZED', 401),
  forbidden: (message: string = 'Forbidden') => new CustomError(message, 'FORBIDDEN', 403),
  notFound: (message: string = 'Resource not found') => new CustomError(message, 'NOT_FOUND', 404),
  conflict: (message: string) => new CustomError(message, 'CONFLICT', 409),
  validationError: (message: string) => new CustomError(message, 'VALIDATION_ERROR', 422),
  tooManyRequests: (message: string = 'Too many requests') => new CustomError(message, 'TOO_MANY_REQUESTS', 429),
  internal: (message: string = 'Internal server error') => new CustomError(message, 'INTERNAL_ERROR', 500)
};

// Also export a callable function for backwards compatibility
export function createErrorFunction(statusCode: number, message: string): CustomError {
  switch (statusCode) {
    case 400:
      return createError.badRequest(message);
    case 401:
      return createError.unauthorized(message);
    case 403:
      return createError.forbidden(message);
    case 404:
      return createError.notFound(message);
    case 409:
      return createError.conflict(message);
    case 422:
      return createError.validationError(message);
    case 429:
      return createError.tooManyRequests(message);
    case 500:
    default:
      return createError.internal(message);
  }
}

// Async error handler wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware
export function globalErrorHandler(err: Error | CustomError, req: Request, res: Response, next: NextFunction) {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Log the error
  errorLogger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle custom errors
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        ...(isDev && { stack: err.stack })
      }
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      error: {
        message: err.message || 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 422,
        ...(isDev && { stack: err.stack })
      }
    });
  }

  // Handle database errors
  if (err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
    return res.status(409).json({
      error: {
        message: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
        statusCode: 409
      }
    });
  }

  // Default error response
  const message = isDev ? err.message : 'Internal server error';
  const statusCode = 500;

  res.status(statusCode).json({
    error: {
      message,
      code: 'INTERNAL_ERROR',
      statusCode,
      ...(isDev && { stack: err.stack })
    }
  });
}

// Validation error helper
export function createValidationError(message?: string): CustomError {
  return createError.validationError(message || 'Validation failed');
}