import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { LoadingScreen } from './ui/loading-screen';

// Define loading context type
type LoadingContextType = {
  isLoading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T,>(promise: Promise<T>, message?: string) => Promise<T>;
  setLoadingMessage: (message: string) => void;
  suppressSkeletons: boolean;
};

// Create context with default values
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: <T,>(promise: Promise<T>): Promise<T> => promise,
  setLoadingMessage: () => {},
  suppressSkeletons: false
});

/**
 * Custom hook to access loading context
 */
const useLoading = () => {
  return useContext(LoadingContext);
};

/**
 * GlobalLoadingProvider component that manages loading state
 */
const GlobalLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [suppressSkeletons, setSuppressSkeletons] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingCountRef = useRef(0);

  const showLoading = useCallback((message?: string) => {
    console.log('[GlobalLoading] Showing loading overlay');
    loadingCountRef.current += 1;
    setIsLoading(true);
    setSuppressSkeletons(true);
    if (message) {
      setLoadingMessage(message);
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a backup timeout to ensure loading doesn't get stuck
    timeoutRef.current = setTimeout(() => {
      console.log('[GlobalLoading] Backup timeout triggered, hiding loading');
      hideLoading();
    }, 10000); // 10 second timeout
  }, []);

  const hideLoading = useCallback(() => {
    loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);

    if (loadingCountRef.current === 0) {
      console.log('[GlobalLoading] Hiding loading overlay');
      setIsLoading(false);
      setSuppressSkeletons(false);
      setLoadingMessage('');

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, []);

  const withLoading = useCallback(async <T,>(promise: Promise<T>, message?: string): Promise<T> => {
    showLoading(message);
    try {
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const setMessage = useCallback((message: string) => {
    console.log('[GlobalLoading] Setting message:', message);
    setLoadingMessage(message);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const contextValue: LoadingContextType = {
    isLoading,
    showLoading,
    hideLoading,
    withLoading,
    setLoadingMessage: setMessage,
    suppressSkeletons
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {isLoading && <LoadingScreen message={loadingMessage} />}
    </LoadingContext.Provider>
  );
};

export { useLoading };
export default GlobalLoadingProvider;