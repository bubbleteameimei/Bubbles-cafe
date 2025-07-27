/**
 * Debug logger utility for the application
 * Provides consistent logging, error tracking, and debugging capabilities
 */

import fs from 'fs/promises';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

// Define proper types instead of using 'any'
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  details?: Record<string, unknown>;
}

interface Logger {
  debug: (message: string, details?: Record<string, unknown>) => void;
  info: (message: string, details?: Record<string, unknown>) => void;
  warn: (message: string, details?: Record<string, unknown>) => void;
  error: (message: string, details?: Record<string, unknown>) => void;
}

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
export const initLogs = async () => {
  try {
    await fs.access(logsDir);
  } catch {
    await fs.mkdir(logsDir, { recursive: true });
  }
};

const debugLogPath = path.join(logsDir, 'debug.log');
const errorLogPath = path.join(logsDir, 'error.log');

// Console colors for different log levels
const colors = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m'   // Reset
};

function formatLogMessage(level: LogLevel, module: string, message: string, details?: Record<string, unknown>): LogMessage {
  return {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    details: details ? redactSensitiveInfo(details) : undefined
  };
}

function getConsolePrefix(level: LogLevel): string {
  switch (level) {
    case 'debug':
      return '\x1b[36m[DEBUG]\x1b[0m'; // Cyan
    case 'info':
      return '\x1b[32m[INFO]\x1b[0m';  // Green
    case 'warn':
      return '\x1b[33m[WARN]\x1b[0m';  // Yellow
    case 'error':
      return '\x1b[31m[ERROR]\x1b[0m'; // Red
    default:
      return '[LOG]';
  }
}

async function writeToFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.appendFile(filePath, content + '\n');
  } catch (error) {
    // Fallback to console if file writing fails
    console.error('Failed to write to log file:', error);
  }
}

async function log(level: LogLevel, module: string, message: string, details?: Record<string, unknown>): Promise<void> {
  const logMessage = formatLogMessage(level, module, message, details);
  const timestamp = logMessage.timestamp;
  const prefix = getConsolePrefix(level);
  
  // Format for console output
  const consoleMessage = `${prefix} [${module}] ${message}`;
  const consoleDetails = details ? ` ${JSON.stringify(redactSensitiveInfo(details), null, 2)}` : '';
  
  // Output to console with colors
  console.log(`${timestamp} ${consoleMessage}${consoleDetails}`);
  
  // Format for file output
  const fileMessage = JSON.stringify(logMessage);
  
  // Log everything to debug log in development mode
  if (process.env.NODE_ENV !== 'production') {
    await writeToFile(debugLogPath, fileMessage);
  }
  
  // Log errors to separate error log
  if (level === 'error') {
    await writeToFile(errorLogPath, fileMessage);
  }
}

/**
 * Create a logger instance for a specific module
 */
export function createLogger(moduleName: string): Logger {
  return {
    debug: (message: string, details?: Record<string, unknown>) => log('debug', moduleName, message, details),
    info: (message: string, details?: Record<string, unknown>) => log('info', moduleName, message, details),
    warn: (message: string, details?: Record<string, unknown>) => log('warn', moduleName, message, details),
    error: (message: string, details?: Record<string, unknown>) => log('error', moduleName, message, details)
  };
}

/**
 * Redact sensitive information from log objects
 */
export function redactSensitiveInfo(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credentials', 'auth', 'email'];
  const redactedObj = { ...obj };
  
  Object.keys(redactedObj).forEach(key => {
    if (sensitiveKeys.some(sensKey => key.toLowerCase().includes(sensKey))) {
      redactedObj[key] = '[REDACTED]';
    } else if (typeof redactedObj[key] === 'object' && redactedObj[key] !== null) {
      redactedObj[key] = redactSensitiveInfo(redactedObj[key] as Record<string, unknown>);
    }
  });
  
  return redactedObj;
}

/**
 * Capture and log errors with context
 */
export function captureError(error: Error, module: string, context?: Record<string, unknown>): void {
  const errorLogger = createLogger(module);
  errorLogger.error(error.message, {
    stack: error.stack,
    context: context ? redactSensitiveInfo(context) : undefined
  });
}

/**
 * Express middleware for request logging
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const logger = createLogger('Request');
  
  // Log incoming request
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type')
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    });
  });
  
  next();
}

/**
 * Express middleware for error logging
 */
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  const logger = createLogger('Error');
  
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  next(err);
}

// Export feedback logger for feedback-ai module
export const feedbackLogger = createLogger('Feedback');