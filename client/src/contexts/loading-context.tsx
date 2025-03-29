import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { showLoading, hideLoading } from '../utils/unified-loading-manager';

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
  const [loadId, setLoadId] = useState<string | null>(null);

  // Show loading state with a minimum display duration
  const showLoadingState = useCallback(() => {
    setIsLoading(true);
    // Use the unified loading system
    const id = showLoading({
      minimumLoadTime: 800,
      debug: true
    });
    setLoadId(id);
  }, []);

  // Hide loading state
  const hideLoadingState = useCallback(() => {
    setIsLoading(false);
    // Use the unified loading system
    if (loadId) {
      hideLoading(loadId);
      setLoadId(null);
    }
  }, [loadId]);

  // Utility to wrap promises with loading state
  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    try {
      showLoadingState();
      return await promise;
    } finally {
      // Add a small delay to prevent flickering for very fast operations
      setTimeout(() => {
        hideLoadingState();
      }, 300);
    }
  }, [showLoadingState, hideLoadingState]);

  // Make sure loading state is reset when component unmounts
  useEffect(() => {
    return () => {
      hideLoadingState();
    };
  }, [hideLoadingState]);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setIsLoading, 
      showLoading: showLoadingState, 
      hideLoading: hideLoadingState, 
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