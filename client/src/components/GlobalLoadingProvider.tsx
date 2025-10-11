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
export const useLoading = () => {
  return useContext(LoadingContext);
}

// Prevent rapid re-show window
const PREVENT_RAPID_SHOW_DURATION = 400;

/**
 * GlobalLoadingProvider - unified controller for the loading overlay.
 * Handles scroll locking and avoids forced-close timers.
 */
export const GlobalLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Core state
  const [isLoading, setIsLoading] = useState(false);
  const [_message, setMessage] = useState<string | undefined>(undefined);
  
  // Refs for tracking state between renders
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const preventRapidShowRef = useRef(false);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);
  
  // Handle animation completion from loading screen
  const handleAnimationComplete = useCallback(() => {
    setIsLoading(false);
    try {
      document.documentElement.classList.remove('disable-scroll');
      document.body.classList.remove('loading-active');
      sessionStorage.removeItem('app_loading');
    } catch {
      // Ignore storage errors
    }
    setTimeout(() => {
      preventRapidShowRef.current = false;
    }, PREVENT_RAPID_SHOW_DURATION);
  }, []);
  
  // Show loading screen with smart prevention of multiple triggers
  const showLoading = useCallback((newMessage?: string) => {
    if (isLoading || preventRapidShowRef.current) {
      return;
    }
    preventRapidShowRef.current = true;
    
    if (newMessage) {
      setMessage(newMessage);
    }
    
    setIsLoading(true);
    
    // Lock scroll and set persistence flag
    try {
      document.documentElement.classList.add('disable-scroll');
      document.body.classList.add('loading-active');
      sessionStorage.setItem('app_loading', 'true');
    } catch {
      // Ignore storage errors
    }
  }, [isLoading]);
  
  // Hide loading screen
  const hideLoading = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    setIsLoading(false);
    
    // Clear scroll lock and storage
    try {
      document.documentElement.classList.remove('disable-scroll');
      document.body.classList.remove('loading-active');
      sessionStorage.removeItem('app_loading');
    } catch {
      // Ignore storage errors
    }
    
    setTimeout(() => {
      preventRapidShowRef.current = false;
    }, PREVENT_RAPID_SHOW_DURATION);
  }, []);
  
  // Utility to wrap promises with loading state
  const withLoading = useCallback<<T,>>(promise: Promise<T>, loadingMessage?: string): Promise<T> => {
    showLoading(loadingMessage);
    
    return promise
      .then(result => {
        hideLoading();
        return result;
      })
      .catch(error => {
        hideLoading();
        throw error;
      });
  }, [showLoading, hideLoading]);
  
  // Update loading message
  const setLoadingMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);
  
  // Recover from any stuck state on mount
  useEffect(() => {
    try {
      if (sessionStorage.getItem('app_loading') === 'true') {
        setIsLoading(true);
        document.documentElement.classList.add('disable-scroll');
        document.body.classList.add('loading-active');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);
  
  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        showLoading, 
        hideLoading, 
        withLoading,
        setLoadingMessage,
        suppressSkeletons: isLoading // Suppress skeleton loaders when global loading is active
      }}
    >
      {children}
      {isLoading && <LoadingScreen onAnimationComplete={handleAnimationComplete} />}
    </LoadingContext.Provider>
  );
};

export default GlobalLoadingProvider;