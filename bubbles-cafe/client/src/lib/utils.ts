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

// Simple loading component
const SimpleLoadingComponent = React.memo(function SimpleLoading() {
  // Return null - no loading indicator
  return null;
});

// Export components
export const ErrorFallback = ErrorFallbackComponent;
export const LoadingFallback = SimpleLoadingComponent;

// Function to create components without lazy loading (no-op replacement)
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
): React.FC<WithRouteProps<P>> {
  // This is a no-op function that exists only for backward compatibility
  // It simply wraps the component in an error boundary without any lazy loading
  const WrappedComponent: React.FC<WithRouteProps<P>> = (props) => {
    // This is just a placeholder that will never be used in practice
    // since we've replaced all uses of this function with direct imports
    return React.createElement(
      'div',
      null,
      React.createElement(ErrorFallback, {
        error: new Error('createLazyComponent is deprecated and should not be used')
      })
    );
  };

  WrappedComponent.displayName = `DirectImport(${importFn.name || 'Component'})`;
  return WrappedComponent;
}
