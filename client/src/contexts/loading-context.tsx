import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useGlobalLoadingOverlay } from '@/components/GlobalLoadingOverlay';
import { showGlobalLoading, hideGlobalLoading } from '@/components/GlobalLoadingOverlay';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showLoading: () => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const globalLoadingContext = useGlobalLoadingOverlay();

  // Show loading state with a minimum display duration
  const showLoading = useCallback(() => {
    setIsLoading(true);
    // Try to use context if available, otherwise use the imperative API
    if (globalLoadingContext?.showLoadingOverlay) {
      globalLoadingContext.showLoadingOverlay();
    } else {
      showGlobalLoading();
    }
  }, [globalLoadingContext]);

  // Hide loading state
  const hideLoading = useCallback(() => {
    setIsLoading(false);
    // Try to use context if available, otherwise use the imperative API
    if (globalLoadingContext?.hideLoadingOverlay) {
      globalLoadingContext.hideLoadingOverlay();
    } else {
      hideGlobalLoading();
    }
  }, [globalLoadingContext]);

  // Utility to wrap promises with loading state
  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    try {
      showLoading();
      return await promise;
    } finally {
      // Add a small delay to prevent flickering for very fast operations
      setTimeout(() => {
        hideLoading();
      }, 300);
    }
  }, [showLoading, hideLoading]);

  // Make sure loading state is reset when component unmounts
  useEffect(() => {
    return () => {
      hideLoading();
    };
  }, [hideLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, showLoading, hideLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};