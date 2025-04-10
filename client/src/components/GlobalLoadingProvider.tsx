import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { LoadingScreen } from './ui/loading-screen';

// Create a loading context type with additional functionality
type LoadingContextType = {
  isLoading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T,>(promise: Promise<T>, message?: string) => Promise<T>;
  setLoadingMessage: (message: string) => void;
};

// Default context values
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: <T,>(promise: Promise<T>): Promise<T> => promise,
  setLoadingMessage: () => {}
});

/**
 * Custom hook to access loading context
 */
export function useLoading() {
  return useContext(LoadingContext);
}

/**
 * LoadingProvider component that manages global loading state
 */
export const GlobalLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [canHideLoading, setCanHideLoading] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minimumLoadTimeRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const hideRequestedRef = useRef(false);
  
  // Cleanup function for any timers
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      if (minimumLoadTimeRef.current) {
        clearTimeout(minimumLoadTimeRef.current);
      }
    };
  }, []);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    setCanHideLoading(true);
    // If there was a request to hide loading while animation was in progress
    if (hideRequestedRef.current) {
      // Start a transition to hide the loading screen
      setTimeout(() => {
        setIsLoading(false);
        setMessage(undefined);
        document.body.classList.remove('loading-active');
        hideRequestedRef.current = false;
      }, 300); // Short delay for smooth transition
    }
  }, []);

  // Show loading state with optional message
  const showLoading = useCallback((newMessage?: string) => {
    if (newMessage) {
      setMessage(newMessage);
    }
    
    // Immediately ensure body has the loading class (before React render)
    document.body.classList.add('loading-active');
    
    // Force browser to reflow/repaint to ensure the loading class takes effect immediately
    // This prevents any potential flash of content
    void document.body.offsetHeight;
    
    setIsLoading(true);
    setCanHideLoading(false);
    hideRequestedRef.current = false;
    startTimeRef.current = Date.now();
  }, []);

  // Hide loading state, but only after animation completes
  const hideLoading = useCallback(() => {
    // If animation has completed its cycle, we can hide immediately
    if (canHideLoading) {
      setIsLoading(false);
      setMessage(undefined);
      document.body.classList.remove('loading-active');
    } else {
      // Otherwise, we mark that a hide was requested
      // The actual hide will happen when the animation completes
      hideRequestedRef.current = true;
    }
  }, [canHideLoading]);

  // Utility to wrap promises with loading state
  const withLoading = useCallback(<T,>(promise: Promise<T>, loadingMessage?: string): Promise<T> => {
    showLoading(loadingMessage);
    
    return promise.finally(() => {
      hideLoading();
    });
  }, [showLoading, hideLoading]);

  // Update loading message
  const setLoadingMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        showLoading, 
        hideLoading, 
        withLoading,
        setLoadingMessage 
      }}
    >
      {children}
      {isLoading && <LoadingScreen onAnimationComplete={handleAnimationComplete} />}
    </LoadingContext.Provider>
  );
};

export default GlobalLoadingProvider;