import React, { createContext, useContext, useCallback } from 'react';
import { useLoading as useSimplifiedLoading } from '../components/ui/loading-screen';

/**
 * Compatibility layer for the old loading context
 * Now using the simplified loading system
 */

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showLoading: () => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the new simplified loading system
  const { isLoading, showLoading, hideLoading } = useSimplifiedLoading();

  // Simple setter for compatibility
  const setIsLoading = (loading: boolean) => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  };

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

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setIsLoading, 
      showLoading, 
      hideLoading, 
      withLoading 
    }}>
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