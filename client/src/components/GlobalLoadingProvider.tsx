import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { LoadingScreen } from './ui/loading-screen';

// Define loading context type
type LoadingContextType = {
  isLoading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
  setLoadingMessage: (message: string) => void;
  suppressSkeletons: boolean;
};

// Create context with default values
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
  // Provide a typed default without generic syntax that conflicts with TSX
  withLoading: ((promise: Promise<any>) => promise) as LoadingContextType['withLoading'],
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
  
  // Scroll lock helpers with scrollbar compensation to prevent layout shift
  const applyScrollLock = useCallback(() => {
    try {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollbarWidth = Math.max(0, window.innerWidth - docEl.clientWidth);
      // Lock scroll on root
      docEl.classList.add('disable-scroll');
      // Compensate for scrollbar removal
      body.style.paddingRight = scrollbarWidth ? `${scrollbarWidth}px` : '';
      // Backward-compat class (visual only; CSS shouldn't set position fixed)
      body.classList.add('loading-active');
    } catch {}
  }, []);

  const releaseScrollLock = useCallback(() => {
    try {
      const body = document.body;
      document.documentElement.classList.remove('disable-scroll');
      body.classList.remove('loading-active');
      body.style.paddingRight = '';
    } catch {}
  }, []);

  // Handle animation completion from loading screen
  const handleAnimationComplete = useCallback(() => {
    setIsLoading(false);
    try {
      releaseScrollLock();
      sessionStorage.removeItem('app_loading');
    } catch {
      // Ignore storage errors
    }
    setTimeout(() => {
      preventRapidShowRef.current = false;
    }, PREVENT_RAPID_SHOW_DURATION);
  }, [releaseScrollLock]);
  
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
    
    // Lock scroll (with compensation) and set persistence flag
    try {
      applyScrollLock();
      sessionStorage.setItem('app_loading', 'true');
    } catch {
      // Ignore storage errors
    }
  }, [isLoading, applyScrollLock]);
  
  // Hide loading screen
  const hideLoading = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    setIsLoading(false);
    
    // Clear scroll lock and storage
    try {
      releaseScrollLock();
      sessionStorage.removeItem('app_loading');
    } catch {
      // Ignore storage errors
    }
    
    setTimeout(() => {
      preventRapidShowRef.current = false;
    }, PREVENT_RAPID_SHOW_DURATION);
  }, [releaseScrollLock]);
  
  // Utility to wrap promises with loading state
  const withLoading = useCallback(function<T>(promise: Promise<T>, loadingMessage?: string): Promise<T> {
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
        applyScrollLock();
      }
    } catch {
      // Ignore storage errors
    }
  }, [applyScrollLock]);
  
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