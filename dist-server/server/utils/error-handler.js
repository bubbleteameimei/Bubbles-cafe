import { createLogger } from './debug-logger';
const logger = createLogger('ErrorHandler');
// Error types for better error handling
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401);
    }
}
export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}
// Centralized error handler
export function handleError(error, req, res, _next) {
    let statusCode = 500;
    let message = 'Internal server error';
    let isOperational = false;
    // Handle known error types
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        isOperational = error.isOperational;
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid data format';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
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
        userId: req.user?.id
    });
    // Create error response
    const errorResponse = {
        error: error.name || 'Error',
        message: process.env.NODE_ENV === 'production' && !isOperational
            ? 'Internal server error'
            : message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.path
    };
    // Add request ID if available
    if (req.requestId) {
        errorResponse.requestId = req.requestId;
    }
    // Send error response
    res.status(statusCode).json(errorResponse);
}
// Async error wrapper
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
// Error response helper
export function sendErrorResponse(res, error, statusCode = 500) {
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
export function sendSuccessResponse(res, data, message = 'Success') {
    return res.json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
}
// Validation error helper
export function sendValidationError(res, field, message) {
    return res.status(400).json({
        error: 'ValidationError',
        message: `${field}: ${message}`,
        statusCode: 400,
        timestamp: new Date().toISOString()
    });
}
// Create error helper function
export function createError(message, statusCode = 500) {
    return new AppError(message, statusCode);
}
// Provide helper factories to match existing usages across routes
createError.internal = (message = 'Internal server error', statusCode = 500) => new AppError(message, statusCode);
createError.unauthorized = (message = 'Unauthorized') => new AuthenticationError(message);
createError.forbidden = (message = 'Forbidden') => new AuthorizationError(message);
createError.badRequest = (message = 'Bad request') => new ValidationError(message);
createError.notFound = (message = 'Not found') => new NotFoundError(message);
createError.conflict = (message = 'Conflict') => new ConflictError(message);
