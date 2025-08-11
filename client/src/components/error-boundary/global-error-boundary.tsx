import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Bug, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  level: string;
  errorId: string;
}

// Enhanced error logging service
class ErrorLogger {
  private static instance: ErrorLogger;
  
  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, any>) {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    
    const errorReport = {
      id: errorId,
      timestamp,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      context
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${errorId}]`);
      
      
      
      console.groupEnd();
    }

    // Send to error reporting service
    this.sendToErrorService(errorReport);
    
    // Store locally for debugging
    this.storeErrorLocally(errorReport);
    
    return errorId;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | null {
    try {
      // Get user ID from auth context or local storage
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user?.id || null;
    } catch {
      return null;
    }
  }

  private async sendToErrorService(errorReport: any) {
    try {
      await apiRequest('POST', '/api/errors', errorReport);
    } catch (err) {
      console.warn('Failed to send error report:', err);
    }
  }

  private storeErrorLocally(errorReport: any) {
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.unshift(errorReport);
      // Keep only last 10 errors
      const trimmedErrors = errors.slice(0, 10);
      localStorage.setItem('app_errors', JSON.stringify(trimmedErrors));
    } catch (err) {
      console.warn('Failed to store error locally:', err);
    }
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  level, 
  errorId 
}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const getErrorMessage = () => {
    if (level === 'critical') {
      return 'A critical error occurred. Please refresh the page.';
    }
    if (level === 'page') {
      return 'Something went wrong on this page. Please try again.';
    }
    return 'A component failed to load. Please try again.';
  };

  const handleSendReport = async () => {
    try {
      await apiRequest('POST', '/api/user-feedback', {
        type: 'bug',
        content: `Error Report - ID: ${errorId}`,
        metadata: {
          errorId,
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      });
      alert('Error report sent. Thank you!');
    } catch (err) {
      console.warn('Failed to send error report:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <Alert className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Oops! Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          {getErrorMessage()}
          {!isProduction && error && (
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer">Technical Details</summary>
              <pre className="mt-2 text-left overflow-auto max-h-32 bg-gray-100 p-2 rounded">
                {error.message}
              </pre>
            </details>
          )}
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2 mt-4">
        <Button onClick={resetError} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
        
        <Button onClick={handleSendReport} variant="ghost" size="sm">
          <Bug className="w-4 h-4 mr-2" />
          Report Bug
        </Button>
      </div>
      
      {!isProduction && (
        <div className="mt-4 text-xs text-gray-500">
          Error ID: {errorId}
        </div>
      )}
    </div>
  );
};

export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorLogger = ErrorLogger.getInstance();

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.errorLogger.logError(error, errorInfo, {
      level: this.props.level || 'component',
      component: 'ErrorBoundary'
    });

    this.setState({
      errorInfo,
      errorId
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          level={this.props.level || 'component'}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

// Async error handler for promises and async operations
export class AsyncErrorHandler {
  private static instance: AsyncErrorHandler;
  private errorLogger = ErrorLogger.getInstance();

  static getInstance(): AsyncErrorHandler {
    if (!AsyncErrorHandler.instance) {
      AsyncErrorHandler.instance = new AsyncErrorHandler();
    }
    return AsyncErrorHandler.instance;
  }

  // Wrap async functions with error handling
  wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ): (...args: T) => Promise<R | null> {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleAsyncError(error as Error, context);
        return null;
      }
    };
  }

  // Handle async errors
  handleAsyncError(error: Error, context?: string) {
    const errorId = this.errorLogger.logError(error, undefined, {
      type: 'async',
      context: context || 'unknown'
    });

    // Show user-friendly notification
    this.showErrorNotification(error, errorId);
  }

  private showErrorNotification(error: Error, errorId: string) {
    // Use toast or notification system
    const event = new CustomEvent('show-error-notification', {
      detail: {
        message: 'An error occurred while processing your request.',
        errorId,
        error: error.message
      }
    });
    window.dispatchEvent(event);
  }
}

// Global unhandled error handlers
export function setupGlobalErrorHandlers() {
  const asyncErrorHandler = AsyncErrorHandler.getInstance();

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    
    
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    asyncErrorHandler.handleAsyncError(error, 'unhandledrejection');
    
    // Prevent default browser behavior
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    
    
    const error = event.error instanceof Error 
      ? event.error 
      : new Error(event.message);
    
    asyncErrorHandler.handleAsyncError(error, 'uncaught');
  });

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const target = event.target as Element;
      
      
      const error = new Error(`Failed to load resource: ${target.tagName}`);
      asyncErrorHandler.handleAsyncError(error, 'resource');
    }
  }, true);
}

// Hook for using async error handling in components
export function useAsyncError() {
  const asyncErrorHandler = AsyncErrorHandler.getInstance();
  
  return {
    wrapAsync: asyncErrorHandler.wrapAsync.bind(asyncErrorHandler),
    handleError: asyncErrorHandler.handleAsyncError.bind(asyncErrorHandler)
  };
}

// Component wrapper for easier error boundary usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return (props: P) => (
    <GlobalErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );
}

export { ErrorLogger };
export default GlobalErrorBoundary;