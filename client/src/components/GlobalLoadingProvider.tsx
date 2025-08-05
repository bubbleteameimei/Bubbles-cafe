import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import LoadingScreen from './loading-screen';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
}

export default function GlobalLoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  
  // Prevent rapid show/hide cycles
  const PREVENT_RAPID_HIDE_DURATION = 300; // minimum time to show loading screen
  
  const setLoading = useCallback((loading: boolean, message?: string) => {
    if (message) {
      setLoadingMessage(message);
    }
    
    if (loading) {
      setIsLoading(true);
      setShowLoadingScreen(true);
    } else {
      setIsLoading(false);
      // Delay hiding to prevent flicker
      setTimeout(() => {
        if (!isLoading) {
          setShowLoadingScreen(false);
        }
      }, PREVENT_RAPID_HIDE_DURATION);
    }
  }, [isLoading]);

  // Handle animation completion from loading screen
  const handleAnimationComplete = useCallback(() => {
    setIsLoading(false);
    setShowLoadingScreen(false);
    
    // Re-enable scrolling after animation completes
    document.body.style.overflow = 'auto';
    
    // Remove the loading state from session storage
    sessionStorage.removeItem('loadingActive');
  }, []);

  // Show loading screen with smart prevention of multiple triggers
  const showLoading = useCallback((_newMessage?: string) => {
    // Check if we're already loading or recently prevented loading
    if (isLoading || preventRapidShowRef.current) {
      return;
    }
    
    // Set prevention flag for longer duration to prevent multiple screens
    preventRapidShowRef.current = true;
    
    // Message handling removed for simplicity
    
    // Set loading state
    setIsLoading(true);
    
    // Set storage state for persistence
    try {
      sessionStorage.setItem('app_loading', 'true');
    } catch (e) {
      // Ignore storage errors
    }
    
    // Clear any existing timer - let loading screen handle its own timing
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }, [isLoading]);
  
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
  
  // Update loading message - simplified without setMessage
  const setLoadingMessage = useCallback((newMessage: string) => {
    // Message handling simplified for now
  }, []);


  
  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        setLoading, 
        loadingMessage, 
        setLoadingMessage,
      }}
    >
      {children}
      {showLoadingScreen && <LoadingScreen onAnimationComplete={handleAnimationComplete} />}
    </LoadingContext.Provider>
  );
};