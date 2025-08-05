import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { LoadingScreen } from './ui/loading-screen';

interface LoadingContextType {
  isLoading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T,>(promise: Promise<T>, message?: string) => Promise<T>;
  setLoadingMessage: (message: string) => void;
  suppressSkeletons: boolean;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: <T,>(promise: Promise<T>): Promise<T> => promise,
  setLoadingMessage: () => {},
  suppressSkeletons: false
});

export function useLoading() {
  return useContext(LoadingContext);
}

export default function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const preventRapidShowRef = useRef(false);
  
  const PREVENT_RAPID_HIDE_DURATION = 300;

  const showLoading = useCallback((message?: string) => {
    if (message) {
      setLoadingMessage(message);
    }
    setIsLoading(true);
    setShowLoadingScreen(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    loadingTimerRef.current = setTimeout(() => {
      setShowLoadingScreen(false);
    }, PREVENT_RAPID_HIDE_DURATION);
  }, []);

  const withLoading = useCallback(async <T,>(promise: Promise<T>, message?: string): Promise<T> => {
    showLoading(message);
    try {
      const result = await promise;
      hideLoading();
      return result;
    } catch (error) {
      hideLoading();
      throw error;
    }
  }, [showLoading, hideLoading]);

  const handleAnimationComplete = useCallback(() => {
    setShowLoadingScreen(false);
  }, []);

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        showLoading, 
        hideLoading, 
        withLoading,
        setLoadingMessage,
        suppressSkeletons: isLoading
      }}
    >
      {children}
      {showLoadingScreen && <LoadingScreen onAnimationComplete={handleAnimationComplete} />}
    </LoadingContext.Provider>
  );
}