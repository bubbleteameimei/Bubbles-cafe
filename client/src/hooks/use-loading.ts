/**
 * Standardized loading hook to provide compatibility with components
 * that expect the loading API, integrating with our centralized loading component
 */
import { createContext, useContext, useState, type ReactNode, useCallback } from "react";

// Create a context for loading state
type LoadingContextType = {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  withLoading: <T,>(promise: Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: <T,>(promise: Promise<T>): Promise<T> => promise
});

export function useLoading() {
  return useContext(LoadingContext);
}

export default useLoading;