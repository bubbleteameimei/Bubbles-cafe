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

/**
 * GlobalLoadingProvider - Completely rewritten to work with the new loading screen
 * This provider manages the loading state in a simpler, more robust way
 */
export const GlobalLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Core state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  
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
    // Loading animation has completed, update state
    setIsLoading(false);
    
    // Update session storage
    try {
      sessionStorage.removeItem('app_loading');
    } catch (e) {
      // Ignore storage errors
    }
    
    console.log('[LoadingProvider] Animation complete');
    console.log('[LoadingProvider] Scroll re-enabled after animation');
    
    // Allow new loading actions after a short delay
    setTimeout(() => {
      preventRapidShowRef.current = false;
    }, 300);
  }, []);
  
  // Show loading screen
  const showLoading = useCallback((newMessage?: string) => {
    // Prevent rapid show/hide cycles
    if (preventRapidShowRef.current) return;
    preventRapidShowRef.current = true;
    
    // Update message if provided
    if (newMessage) {
      setMessage(newMessage);
    }
    
    // Set loading state
    setIsLoading(true);
    
    // Set storage state for persistence
    try {
      sessionStorage.setItem('app_loading', 'true');
      console.log('[LoadingProvider] Set loading state in session storage');
    } catch (e) {
      // Ignore storage errors
    }
    
    // Safety timer: force close after 2 seconds regardless of other state
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    
    loadingTimerRef.current = setTimeout(() => {
      // The loading screen component has its own 2-second timer
      // This is a backup in case that fails for some reason
      console.log('Loading provider backup timer triggered after 2.5 seconds');
      setIsLoading(false);
      
      try {
        sessionStorage.removeItem('app_loading');
      } catch (e) {
        // Ignore storage errors
      }
      
      // Reset prevention flag
      preventRapidShowRef.current = false;
    }, 2500); // Slightly longer than component timer
  }, []);
  
  // Hide loading screen
  const hideLoading = useCallback(() => {
    // Let the loading screen component handle itself
    // It has its own cleanup logic and will call handleAnimationComplete
    
    // Just clean up the timer
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    // Clear storage
    try {
      sessionStorage.removeItem('app_loading');
    } catch (e) {
      // Ignore storage errors
    }
  }, []);
  
  // Utility to wrap promises with loading state
  const withLoading = useCallback(<T,>(promise: Promise<T>, loadingMessage?: string): Promise<T> => {
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