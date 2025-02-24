import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as React from "react";
import type { ComponentType } from "react";
import type { RouteComponentProps } from "wouter";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define route parameter types
export type RouteParams = Record<string, string | undefined>;

// Type for components that can receive route props
export type WithRouteProps<P = {}> = P & Partial<RouteComponentProps<RouteParams>>;

// Props interfaces
interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
}

// Error fallback component
const ErrorFallbackComponent = React.memo(function ErrorFallback({ 
  error, 
  errorInfo 
}: ErrorFallbackProps) {
  return React.createElement(
    "div",
    {
      role: "alert",
      className: "flex flex-col items-center justify-center p-4 text-destructive"
    },
    React.createElement("p", null, error.message),
    errorInfo && process.env.NODE_ENV === 'development' && 
      React.createElement(
        "pre",
        { className: "mt-2 text-xs overflow-auto max-h-40" },
        errorInfo.componentStack
      )
  );
});

// Export components
export const ErrorFallback = ErrorFallbackComponent;
export const LoadingFallback = LoadingScreen;

// Create lazy-loaded component with error boundary
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
): React.FC<WithRouteProps<P>> {
  const LazyComponent = React.lazy(() =>
    importFn().catch(error => ({
      default: () => React.createElement(ErrorFallback, {
        error: error instanceof Error ? error : new Error('Failed to load component')
      })
    }))
  );

  const WrappedComponent: React.FC<WithRouteProps<P>> = (props) => {
    return React.createElement(
      React.Suspense,
      { fallback: React.createElement(LoadingFallback) },
      React.createElement(LazyComponent, { ...props } as any)
    );
  };

  WrappedComponent.displayName = `LazyLoaded(${importFn.name || 'Component'})`;
  return WrappedComponent;
}
