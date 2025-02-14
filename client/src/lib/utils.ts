import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React, { Suspense, lazy, type ComponentType, type ReactElement, type JSX } from 'react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type LazyComponentType<T extends object = object> = () => Promise<{ default: ComponentType<T> }>;

export function lazyLoad<T extends object = object>(
  importFunc: LazyComponentType<T>,
  fallback?: ReactElement
): (props: T) => JSX.Element {
  const LazyComponent = lazy(importFunc);

  return function LazyLoadWrapper(props: T): JSX.Element {
    const defaultFallback = (
      <div className="animate-pulse">Loading...</div>
    ) as ReactElement;

    return (
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}