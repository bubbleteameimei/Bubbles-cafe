import { Request, Response, NextFunction } from 'express';
import { createSecureLogger } from './secure-logger';

const errorLogger = createSecureLogger('ErrorHandler');

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error types
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

// Safe error response (doesn't leak sensitive information)
const createErrorResponse = (error: AppError, isDev: boolean) => {
  const response: any = {
    error: true,
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || 'Something went wrong'
  };

  // Only include stack trace in development
  if (isDev && error.stack) {
    response.stack = error.stack;
  }

  return response;
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handling middleware
export const globalErrorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDev = process.env.NODE_ENV === 'development';
  const appError = error as AppError;
  
  // Log error details (sensitive data already filtered by secure logger)
  errorLogger.error('Unhandled error', {
    message: error.message,
    code: appError.code,
    statusCode: appError.statusCode,
    path: req.path,
    method: req.method,
    stack: isDev ? error.stack : undefined
  });

  // Default error values
  const statusCode = appError.statusCode || 500;
  const response = createErrorResponse(appError, isDev);

  res.status(statusCode).json(response);
};

// Handle specific database errors
export const handleDatabaseError = (error: any): AppError => {
  if (error.code === '23505') { // PostgreSQL unique violation
    return createError.conflict('Resource already exists');
  }
  
  if (error.code === '23503') { // PostgreSQL foreign key violation
    return createError.badRequest('Referenced resource not found');
  }
  
  if (error.code === '23502') { // PostgreSQL not null violation
    return createError.badRequest('Required field is missing');
  }

  // Default to internal error
  return createError.internal('Database operation failed');
};

// Validation error handler
export const handleValidationError = (error: any): AppError => {
  if (error.name === 'ZodError') {
    const message = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return createError.validationError(message || 'Validation failed');
  }
  
  return createError.badRequest('Invalid input data');
};