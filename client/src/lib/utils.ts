import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React, { type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { lazy, Suspense } from "react";
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
  errorInfo?: ErrorInfo;
}

interface LoadingFallbackProps {
  message?: string;
}

// Error fallback component as a function component
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo }) => {
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

// Loading fallback component as a function component
const LoadingFallback: React.FC<LoadingFallbackProps> = ({ message = 'Loading...' }) => {
  return (
    <div role="status" className="flex items-center justify-center p-4">
      <div className="animate-pulse">{message}</div>
    </div>
  );
};

export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
): ComponentType<WithRouteProps<P>> {
  const LazyComponent = lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      return {
        default: () => <ErrorFallback error={error instanceof Error ? error : new Error('Failed to load component')} />
      };
    }
  });

  const WrappedComponent: React.FC<WithRouteProps<P>> = (props) => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  WrappedComponent.displayName = `LazyLoaded(${importFn.name || 'Component'})`;
  return WrappedComponent;
}