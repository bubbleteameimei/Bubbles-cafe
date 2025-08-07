import React, { Suspense, ComponentType, lazy, ReactNode } from 'react';
import logger from './secure-client-logger';

interface LazyLoadOptions {
  fallback?: ReactNode;
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>;
  timeout?: number;
  retryAttempts?: number;
  preload?: boolean;
}

interface LazyComponentProps {
  error?: Error;
  retry?: () => void;
}

// Default loading component
const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Default error fallback
const DefaultErrorFallback: ComponentType<LazyComponentProps> = ({ retry }) => (
  <div className="flex flex-col items-center justify-center p-4 text-center">
    <div className="mb-4 text-red-500">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold mb-2">Failed to load component</h3>
    <p className="text-gray-600 mb-4">Something went wrong while loading this component.</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Enhanced lazy loading with retry logic
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): ComponentType<React.ComponentProps<T>> {
  const {
    fallback = <DefaultLoadingFallback />,
    errorFallback: ErrorFallback = DefaultErrorFallback,
    timeout = 10000,
    retryAttempts = 3,
    preload = false
  } = options;

  // Create retry wrapper for import function
  const createRetryWrapper = (attemptNumber: number = 0): (() => Promise<{ default: T }>) => {
    return async () => {
      try {
        const startTime = performance.now();
        
        // Set up timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Component load timeout')), timeout);
        });

        const importPromise = importFn();
        const result = await Promise.race([importPromise, timeoutPromise]);
        
        const loadTime = performance.now() - startTime;
        logger.debug('Lazy component loaded successfully', { 
          loadTime: Math.round(loadTime),
          attempt: attemptNumber + 1
        });

        return result;
      } catch (error) {
        logger.error('Lazy component load failed', { 
          attempt: attemptNumber + 1,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        if (attemptNumber < retryAttempts - 1) {
          // Exponential backoff: wait 100ms * 2^attempt
          const delay = Math.min(100 * Math.pow(2, attemptNumber), 3000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          logger.debug('Retrying lazy component load', { 
            attempt: attemptNumber + 2,
            delay
          });
          
          return createRetryWrapper(attemptNumber + 1)();
        }
        
        throw error;
      }
    };
  };

  const LazyComponent = lazy(createRetryWrapper());

  // Preload if requested
  if (preload) {
    importFn().catch(error => {
      logger.warn('Preload failed for lazy component', { error });
    });
  }

  // Return wrapped component with error boundary
  return React.forwardRef<any, React.ComponentProps<T>>((props, _ref) => {
    const [error, setError] = React.useState<Error | null>(null);
    const [retryKey, setRetryKey] = React.useState(0);

    const handleRetry = React.useCallback(() => {
      setError(null);
      setRetryKey(prev => prev + 1);
    }, []);

    React.useEffect(() => {
      if (retryKey > 0) {
        setError(null);
      }
    }, [retryKey]);

    if (error) {
      return <ErrorFallback error={error} retry={handleRetry} />;
    }

    return (
      <Suspense fallback={fallback}>
        <ErrorBoundary
          onError={(error) => {
            console.error('Lazy component error:', error);
            setRetryKey(prev => prev + 1);
          }}
        >
          <LazyComponent key={retryKey} {...(props as any)} />
        </ErrorBoundary>
      </Suspense>
    );
  });
}

// Error boundary for lazy components
class ErrorBoundary extends React.Component<
  { children: ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Lazy component error boundary caught error', { 
      error: error.message,
      componentStack: errorInfo.componentStack 
    });
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent error fallback handle display
    }

    return this.props.children;
  }
}

// Utility for lazy loading with intersection observer (for below-fold components)
export function createIntersectionLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions & { rootMargin?: string; threshold?: number } = {}
): ComponentType<React.ComponentProps<T>> {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    ...lazyOptions
  } = options;

  return React.forwardRef<any, React.ComponentProps<T>>((props, _ref) => {
    const [shouldLoad, setShouldLoad] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { rootMargin, threshold }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, [rootMargin, threshold]);

    if (!shouldLoad) {
      return (
        <div 
          ref={containerRef}
          className="min-h-[200px] flex items-center justify-center"
        >
          {lazyOptions.fallback || <DefaultLoadingFallback />}
        </div>
      );
    }

    const LazyComponent = createLazyComponent(importFn, lazyOptions);
    return <LazyComponent {...(props as any)} />;
  });
}

// Hook for preloading components
export function usePreloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  condition: boolean = true
) {
  React.useEffect(() => {
    if (condition) {
      const preloadTimer = setTimeout(() => {
        importFn().catch(error => {
          logger.warn('Component preload failed', { error });
        });
      }, 100); // Small delay to not interfere with initial render

      return () => clearTimeout(preloadTimer);
    }
    return undefined;
  }, [importFn, condition]);
}

// Batch preloader for multiple components
export function useBatchPreload(
  imports: Array<() => Promise<{ default: ComponentType<any> }>>,
  options: { delay?: number; batchSize?: number } = {}
) {
  const { delay = 100, batchSize = 3 } = options;

  React.useEffect(() => {
    const preloadBatch = async () => {
      for (let i = 0; i < imports.length; i += batchSize) {
        const batch = imports.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(importFn => importFn().catch(error => {
            logger.warn('Batch preload failed for component', { error });
          }))
        );

        // Delay between batches to prevent overwhelming the network
        if (i + batchSize < imports.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    const timer = setTimeout(preloadBatch, delay);
    return () => clearTimeout(timer);
  }, [imports, delay, batchSize]);
}