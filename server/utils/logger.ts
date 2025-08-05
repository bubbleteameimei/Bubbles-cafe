/**
 * Logger Utility
 * 
 * Provides a consistent logging interface for the application.
 */

/**
 * Simple logger interface with standard log levels
 */
export default {
  info: () => {
    // Simplified logger
  },
  error: (message: string, meta?: any) => {
    console.error(message, meta);
  },
  warn: (message: string, meta?: any) => {
    console.warn(message, meta);
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, meta);
    }
  }
};