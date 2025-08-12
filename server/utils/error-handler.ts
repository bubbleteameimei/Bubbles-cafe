import { Request, Response, NextFunction } from 'express';
import { createLogger } from './debug-logger';

const logger = createLogger('ErrorHandler');

// Error types for better error handling
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

// Error response interface
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  requestId?: string;
}

// Centralized error handler
export function handleError(error: Error, req: Request, res: Response, next: NextFunction) {
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error details
  const logLevel = isOperational ? 'warn' : 'error';
  logger[logLevel]('Request error', {
    error: error.message,
    stack: error.stack,
    statusCode,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id
  });

  // Create error response
  const errorResponse: ErrorResponse = {
    error: error.name || 'Error',
    message: process.env.NODE_ENV === 'production' && !isOperational 
      ? 'Internal server error' 
      : message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Add request ID if available
  if ((req as any).requestId) {
    errorResponse.requestId = (req as any).requestId;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Error response helper
export function sendErrorResponse(res: Response, error: Error | string, statusCode: number = 500) {
  const message = typeof error === 'string' ? error : error.message;
  
  logger.error('API Error Response', {
    message,
    statusCode,
    stack: error instanceof Error ? error.stack : undefined
  });

  return res.status(statusCode).json({
    error: 'Error',
    message: process.env.NODE_ENV === 'production' && statusCode >= 500 
      ? 'Internal server error' 
      : message,
    statusCode,
    timestamp: new Date().toISOString()
  });
}

// Success response helper
export function sendSuccessResponse(res: Response, data: any, message: string = 'Success') {
  return res.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

// Validation error helper
export function sendValidationError(res: Response, field: string, message: string) {
  return res.status(400).json({
    error: 'ValidationError',
    message: `${field}: ${message}`,
    statusCode: 400,
    timestamp: new Date().toISOString()
  });
}

// Create error helper function
export function createError(message: string, statusCode: number = 500) {
  return new AppError(message, statusCode);
}