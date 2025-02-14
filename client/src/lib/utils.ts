import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as React from "react";
import type { ComponentType } from "react";
import type { RouteComponentProps } from "wouter";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define route parameter types
export type RouteParams = Record<string, string | undefined>;

// Type for components that can receive route props
export type WithRouteProps<P = {}> = P & Partial<RouteComponentProps<RouteParams>>;

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
}

interface LoadingFallbackProps {
  message?: string;
}

const ErrorFallbackComponent: React.FC<ErrorFallbackProps> = ({ error, errorInfo }) => {
  return (
    <div role="alert" className="flex flex-col items-center justify-center p-4 text-destructive">
      <p>{error.message}</p>
      {errorInfo && process.env.NODE_ENV === 'development' && (
        <pre className="mt-2 text-xs overflow-auto max-h-40">
          {errorInfo.componentStack}
        </pre>
      )}
    </div>
  );
};

const LoadingFallbackComponent: React.FC<LoadingFallbackProps> = ({ message = 'Loading...' }) => {
  return (
    <div role="status" className="flex items-center justify-center p-4">
      <div className="animate-pulse">{message}</div>
    </div>
  );
};

export const ErrorFallback = React.memo(ErrorFallbackComponent);
export const LoadingFallback = React.memo(LoadingFallbackComponent);

ErrorFallback.displayName = 'ErrorFallback';
LoadingFallback.displayName = 'LoadingFallback';

export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
): React.FC<WithRouteProps<P>> {
  const LazyComponent = React.lazy(() =>
    importFn().catch(error => ({
      default: () => (
        <ErrorFallback 
          error={error instanceof Error ? error : new Error('Failed to load component')} 
        />
      )
    }))
  );

  const WrappedComponent: React.FC<WithRouteProps<P>> = (props) => (
    <React.Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </React.Suspense>
  );

  WrappedComponent.displayName = `LazyLoaded(${importFn.name || 'Component'})`;
  return WrappedComponent;
}