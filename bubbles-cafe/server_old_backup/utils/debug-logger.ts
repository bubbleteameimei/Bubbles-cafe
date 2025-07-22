/**
 * Debug logger utility for the application
 * Provides consistent logging, error tracking, and debugging capabilities
 */

import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { config } from '../../shared/config';

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log message structure
interface LogMessage {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  details?: any;
}

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// File paths
const errorLogPath = path.join(logsDir, 'error.log');
const debugLogPath = path.join(logsDir, 'debug.log');
const feedbackLogPath = path.join(logsDir, 'feedback.log');

/**
 * Formats a log message with timestamp and details
 */
function formatLogMessage(level: LogLevel, module: string, message: string, details?: any): LogMessage {
  return {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    details
  };
}

/**
 * Writes a log message to the console with appropriate formatting
 */
function writeToConsole(logMessage: LogMessage): void {
  const { timestamp, level, module, message, details } = logMessage;
  let consoleMethod: 'log' | 'info' | 'warn' | 'error' = 'log';
  let prefix = '\x1b[0m'; // Default (reset)
  
  switch (level) {
    case 'debug':
      prefix = '\x1b[36m[DEBUG]\x1b[0m'; // Cyan
      consoleMethod = 'log';
      break;
    case 'info':
      prefix = '\x1b[32m[INFO]\x1b[0m'; // Green
      consoleMethod = 'info';
      break;
    case 'warn':
      prefix = '\x1b[33m[WARN]\x1b[0m'; // Yellow
      consoleMethod = 'warn';
      break;
    case 'error':
      prefix = '\x1b[31m[ERROR]\x1b[0m'; // Red
      consoleMethod = 'error';
      break;
  }
  
  console[consoleMethod](`${prefix} [${timestamp}] [${module}] ${message}`);
  if (details) {
    console[consoleMethod](details);
  }
}

/**
 * Writes a log message to a file
 */
async function writeToFile(logPath: string, logMessage: LogMessage): Promise<void> {
  const { timestamp, level, module, message, details } = logMessage;
  const formattedDetails = details ? `\n${JSON.stringify(details, null, 2)}` : '';
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}${formattedDetails}\n\n`;
  
  try {
    await fsPromises.appendFile(logPath, logEntry, 'utf8');
  } catch (err) {
    console.error(`Failed to write to log file ${logPath}:`, err);
  }
}

/**
 * Logs a message at the specified level
 */
async function log(level: LogLevel, module: string, message: string, details?: any): Promise<void> {
  const logMessage = formatLogMessage(level, module, message, details);
  
  // Always log to console in development mode
  if (config.NODE_ENV === 'development') {
    writeToConsole(logMessage);
  }
  
  // Log errors to the error log file
  if (level === 'error') {
    await writeToFile(errorLogPath, logMessage);
  }
  
  // Log everything to debug log in development mode
  if (config.NODE_ENV === 'development') {
    await writeToFile(debugLogPath, logMessage);
  }
  
  // Log feedback-related messages to the feedback log
  if (module.toLowerCase().includes('feedback')) {
    await writeToFile(feedbackLogPath, logMessage);
  }
}

/**
 * Creates a logger instance for a specific module
 */
export function createLogger(moduleName: string) {
  return {
    debug: (message: string, details?: any) => log('debug', moduleName, message, details),
    info: (message: string, details?: any) => log('info', moduleName, message, details),
    warn: (message: string, details?: any) => log('warn', moduleName, message, details),
    error: (message: string, details?: any) => log('error', moduleName, message, details)
  };
}

/**
 * Helper function to redact sensitive information from logs
 */
export function redactSensitiveInfo(obj: any): any {
  if (!obj) return obj;
  
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credentials', 'auth', 'email'];
  const redactedObj = { ...obj };
  
  Object.keys(redactedObj).forEach(key => {
    if (sensitiveKeys.some(sensKey => key.toLowerCase().includes(sensKey))) {
      redactedObj[key] = '[REDACTED]';
    } else if (typeof redactedObj[key] === 'object' && redactedObj[key] !== null) {
      redactedObj[key] = redactSensitiveInfo(redactedObj[key]);
    }
  });
  
  return redactedObj;
}

/**
 * Function to capture and log errors with stack traces
 */
export function captureError(error: Error, module: string, context?: any): void {
  const logger = createLogger(module);
  logger.error(error.message, {
    stack: error.stack,
    context: redactSensitiveInfo(context)
  });
}

/**
 * Express middleware to log requests
 */
export function requestLogger(req: any, res: any, next: any) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  const logData = {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  };
  
  const logger = createLogger('HTTP');
  logger.info(`Request started: ${req.method} ${req.url}`, logData);
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const responseData = {
      ...logData,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    };
    
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    logger[logLevel as LogLevel](`Request completed: ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`, responseData);
  });
  
  next();
}

/**
 * Express middleware to handle and log errors
 */
export function errorLogger(err: any, req: any, res: any, next: any) {
  const logger = createLogger('HTTP-Error');
  
  logger.error(`${req.method} ${req.url} - ${err.message}`, {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      params: redactSensitiveInfo(req.params),
      query: redactSensitiveInfo(req.query),
      body: redactSensitiveInfo(req.body)
    }
  });
  
  next(err);
}

// Export a default feedback logger
export const feedbackLogger = createLogger('Feedback');