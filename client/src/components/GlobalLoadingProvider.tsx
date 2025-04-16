import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { LoadingScreen } from './ui/loading-screen';

// Create a loading context type with additional functionality
type LoadingContextType = {
  isLoading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T,>(promise: Promise<T>, message?: string) => Promise<T>;
  setLoadingMessage: (message: string) => void;
  suppressSkeletons: boolean; // New property to prevent skeletons from showing during transitions
};

// Default context values
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: <T,>(promise: Promise<T>): Promise<T> => promise,
  setLoadingMessage: () => {},
  suppressSkeletons: false // Default to not suppressing skeletons
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
    console.log('[LoadingProvider] Animation complete');
    
    // If there was a request to hide loading while animation was in progress
    if (hideRequestedRef.current) {
      // Start a transition to hide the loading screen
      setTimeout(() => {
        setIsLoading(false);
        setMessage(undefined);
        document.body.classList.remove('loading-active');
        hideRequestedRef.current = false;
        
        // Restore scrolling by removing the class
        document.body.classList.remove('no-scroll-loading');
        // Force scroll settings in case they get stuck
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        console.log('[LoadingProvider] Scroll re-enabled after animation');
        
        // Clear loading state in sessionStorage
        try {
          sessionStorage.removeItem('app_loading');
        } catch (e) {
          // Ignore sessionStorage errors
        }
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
    
    // Use class-based scroll locking instead of direct style manipulation
    document.body.classList.add('no-scroll-loading');
    
    // Force browser to reflow/repaint to ensure the loading class takes effect immediately
    // This prevents any potential flash of content
    void document.body.offsetHeight;
    
    setIsLoading(true);
    setCanHideLoading(false);
    hideRequestedRef.current = false;
    startTimeRef.current = Date.now();
    
    // Set a maximum timeout of 2 seconds for the loading screen
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    
    // Store the loading state in sessionStorage to persist across page reloads
    try {
      sessionStorage.setItem('app_loading', 'true');
      console.log('[LoadingProvider] Set loading state in session storage');
    } catch (e) {
      // Ignore sessionStorage errors
    }
    
    loadingTimerRef.current = setTimeout(() => {
      // Force hide loading after 2 seconds
      setIsLoading(false);
      setMessage(undefined);
      document.body.classList.remove('loading-active');
      hideRequestedRef.current = false;
      setCanHideLoading(true);
      
      // Clear loading state in sessionStorage
      try {
        sessionStorage.removeItem('app_loading');
      } catch (e) {
        // Ignore sessionStorage errors
      }
      
      console.log('Loading screen auto-hidden after 2 seconds');
    }, 2000);
  }, []);

  // Hide loading state, but only after animation completes
  const hideLoading = useCallback(() => {
    // Clear the auto-hide timer if it exists
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    // Remove loading state from sessionStorage
    try {
      sessionStorage.removeItem('app_loading');
    } catch (e) {
      // Ignore sessionStorage errors
    }
    
    // If animation has completed its cycle, we can hide immediately
    if (canHideLoading) {
      setIsLoading(false);
      setMessage(undefined);
      document.body.classList.remove('loading-active');
      
      // Restore scrolling by removing the class
      document.body.classList.remove('no-scroll-loading');
      // Force override any inline styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.documentElement.style.overflow = '';
      // Force set touch action to auto to improve mobile scrolling
      document.body.style.touchAction = 'auto';
      console.log('[LoadingProvider] Scroll re-enabled on hide');
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