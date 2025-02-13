import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Suspense, lazy, type ComponentType } from 'react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type LazyComponentType<T = object> = () => Promise<{ default: ComponentType<T> }>;

export function lazyLoad<T extends object = object>(
  importFunc: LazyComponentType<T>,
  loadingComponent: JSX.Element = <div className="animate-pulse">Loading...</div>
) {
  const LazyComponent = lazy(importFunc);

  return function LazyLoadWrapper(props: T): JSX.Element {
    return (
      <Suspense fallback={loadingComponent}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}