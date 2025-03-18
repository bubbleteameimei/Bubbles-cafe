/**
 * Unified Error Handling Utility
 * 
 * Provides standardized error handling for the application with specific
 * support for WordPress API errors and data validation issues.
 * 
 * This utility ensures consistent error behavior across the application while
 * providing detailed logging for developer debugging.
 */

import { z } from 'zod';
import { type ToastInput } from '../hooks/use-toast';

// Define a standalone toast function for error notifications
// This avoids React hook rules violations when used outside components
let toastFn: (props: ToastInput) => void = () => {
  console.warn('Toast function not initialized');
};

// Function to set the toast handler from a component
export function setToastHandler(handler: (props: ToastInput) => void) {
  toastFn = handler;
}

// Define error categories
export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  WORDPRESS = 'wordpress',
  AUTHENTICATION = 'authentication',
  UNKNOWN = 'unknown'
}

// Define error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Structured error interface
export interface ApplicationError {
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: string;
  originalError?: unknown;
  details?: Record<string, unknown>;
}

/**
 * Format an error for consistent error handling throughout the application
 */
export function formatError(
  error: unknown, 
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR
): ApplicationError {
  let message = 'An unknown error occurred';
  let details: Record<string, unknown> = {};

  // Process different types of errors
  if (error instanceof Error) {
    message = error.message;
    
    // Extract additional info from specific error types
    if (error instanceof SyntaxError) {
      category = ErrorCategory.VALIDATION;
      details.type = 'syntax';
    }
    
    if (error instanceof TypeError) {
      details.type = 'type';
    }
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    // Handle API response objects with error info
    const errorObj = error as Record<string, any>;
    
    if (errorObj.message) {
      message = String(errorObj.message);
    }
    
    if (errorObj.status && typeof errorObj.status === 'number') {
      details.status = errorObj.status;
      
      // Categorize by HTTP status code
      if (errorObj.status >= 400 && errorObj.status < 500) {
        category = ErrorCategory.API;
        
        if (errorObj.status === 401 || errorObj.status === 403) {
          category = ErrorCategory.AUTHENTICATION;
        }
      } else if (errorObj.status >= 500) {
        category = ErrorCategory.API;
        severity = ErrorSeverity.CRITICAL;
      }
    }
  }

  return {
    message,
    category,
    severity,
    timestamp: new Date().toISOString(),
    originalError: error,
    details
  };
}

/**
 * Handle WordPress API specific errors
 */
export function handleWordPressError(error: unknown): ApplicationError {
  const formattedError = formatError(error, ErrorCategory.WORDPRESS);
  
  // Log WordPress errors for debugging
  console.error('WordPress API Error:', formattedError);
  
  // Add WordPress-specific details if possible
  if (error && typeof error === 'object') {
    const wpError = error as Record<string, any>;
    
    if (wpError.code) {
      formattedError.details = {
        ...formattedError.details,
        wordpressCode: wpError.code
      };
    }
  }
  
  return formattedError;
}

/**
 * Handle Zod validation errors with helpful formatting
 */
export function handleValidationError(error: z.ZodError): ApplicationError {
  const issues = error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
  
  return {
    message: 'Validation error in content data',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.WARNING,
    timestamp: new Date().toISOString(),
    originalError: error,
    details: {
      issues
    }
  };
}

/**
 * Display a formatted error as a toast notification
 */
export function notifyError(error: ApplicationError): void {
  const title = getErrorTitle(error.category);
  
  // Use the toast function with proper parameters
  toastFn({
    variant: 'destructive',
    title,
    description: error.message,
    // Default duration for error messages
    duration: 5000,
  });
}

/**
 * Get a user-friendly title based on error category
 */
function getErrorTitle(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Connection Error';
    case ErrorCategory.API:
      return 'API Error';
    case ErrorCategory.VALIDATION:
      return 'Content Error';
    case ErrorCategory.WORDPRESS:
      return 'Story Content Error';
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication Error';
    case ErrorCategory.UNKNOWN:
    default:
      return 'Error';
  }
}

/**
 * Log an application error with appropriate severity level
 */
export function logError(error: ApplicationError): void {
  const { severity, category, message, details } = error;
  
  const logData = {
    timestamp: error.timestamp,
    category,
    message,
    details
  };
  
  switch (severity) {
    case ErrorSeverity.INFO:
      console.info(`[${category.toUpperCase()}]`, message, logData);
      break;
    case ErrorSeverity.WARNING:
      console.warn(`[${category.toUpperCase()}]`, message, logData);
      break;
    case ErrorSeverity.CRITICAL:
      console.error(`[${category.toUpperCase()} - CRITICAL]`, message, logData);
      break;
    case ErrorSeverity.ERROR:
    default:
      console.error(`[${category.toUpperCase()}]`, message, logData);
  }
}

/**
 * Unified error handling that formats, logs, and optionally displays errors
 */
export function handleError(
  error: unknown, 
  options?: { 
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    showToast?: boolean;
    silent?: boolean;
  }
): ApplicationError {
  const { 
    category = ErrorCategory.UNKNOWN,
    severity = ErrorSeverity.ERROR,
    showToast = false,
    silent = false
  } = options || {};
  
  const formattedError = formatError(error, category, severity);
  
  // Log error unless silent mode is enabled
  if (!silent) {
    logError(formattedError);
  }
  
  // Show toast notification if requested
  if (showToast) {
    notifyError(formattedError);
  }
  
  return formattedError;
}