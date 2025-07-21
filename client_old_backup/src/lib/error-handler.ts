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
  WORDPRESS_TIMEOUT = 'wordpress_timeout',
  WORDPRESS_PARSE = 'wordpress_parse',
  WORDPRESS_CORS = 'wordpress_cors',
  WORDPRESS_AUTH = 'wordpress_auth',
  WORDPRESS_RATE_LIMIT = 'wordpress_rate_limit',
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
 * Handle WordPress API specific errors with enhanced detection
 * This specialized handler categorizes WordPress errors for better handling
 */
export function handleWordPressError(error: unknown): ApplicationError {
  let category = ErrorCategory.WORDPRESS;
  let severity = ErrorSeverity.ERROR;
  let errorMessage = '';
  
  // Determine the specific type of WordPress error
  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Check for timeout errors
    if (error.name === 'AbortError' || errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      category = ErrorCategory.WORDPRESS_TIMEOUT;
      errorMessage = 'WordPress API request timed out. The server might be overloaded or unavailable.';
    }
    
    // Check for CORS errors
    else if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
      category = ErrorCategory.WORDPRESS_CORS;
      errorMessage = 'WordPress API access restricted by security policies.';
    }
    
    // Check for parse errors
    else if (error instanceof SyntaxError || 
             errorMessage.includes('JSON') || 
             errorMessage.includes('parse')) {
      category = ErrorCategory.WORDPRESS_PARSE;
      errorMessage = 'Unable to read WordPress content due to a format error.';
    }
    
    // Check for network connectivity issues
    else if (errorMessage.includes('network') || 
             errorMessage.includes('fetch') || 
             errorMessage.includes('offline')) {
      category = ErrorCategory.NETWORK;
      errorMessage = 'Network connection issue while accessing WordPress content.';
    }
  } 
  
  // Handle response objects with HTTP status codes
  else if (error && typeof error === 'object') {
    const wpError = error as Record<string, any>;
    const status = wpError.status || wpError.statusCode;
    
    if (wpError.message) {
      errorMessage = String(wpError.message);
    }
    
    if (status) {
      // Authorization issues
      if (status === 401 || status === 403) {
        category = ErrorCategory.WORDPRESS_AUTH;
        errorMessage = 'Authorization issue accessing WordPress content.';
        severity = ErrorSeverity.ERROR;
      }
      
      // Rate limiting
      else if (status === 429) {
        category = ErrorCategory.WORDPRESS_RATE_LIMIT;
        errorMessage = 'WordPress API rate limit exceeded. Please try again later.';
        severity = ErrorSeverity.WARNING;
      }
      
      // Server errors
      else if (status >= 500) {
        severity = ErrorSeverity.ERROR;
        errorMessage = 'WordPress server encountered an error. We\'ll try again soon.';
      }
    }
    
    // Check WordPress error codes for more specific errors
    if (wpError.code) {
      // Enhance with WordPress specific error code
      if (errorMessage.length === 0) {
        errorMessage = `WordPress error: ${wpError.code}`;
      }
    }
  }
  
  // If we couldn't determine a specific error message, use a default
  if (!errorMessage) {
    errorMessage = 'Unable to retrieve WordPress content. We\'ll try again soon.';
  }
  
  // Create the formatted error
  const formattedError = formatError(error, category, severity);
  formattedError.message = errorMessage;
  
  // Log WordPress errors for debugging
  console.error('WordPress API Error:', formattedError);
  
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
 * Includes specialized titles for WordPress error subcategories
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
    case ErrorCategory.WORDPRESS_TIMEOUT:
      return 'Content Loading Timeout';
    case ErrorCategory.WORDPRESS_PARSE:
      return 'Content Format Error';
    case ErrorCategory.WORDPRESS_CORS:
      return 'Access Restriction';
    case ErrorCategory.WORDPRESS_AUTH:
      return 'Content Access Error';
    case ErrorCategory.WORDPRESS_RATE_LIMIT:
      return 'Rate Limit Reached';
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