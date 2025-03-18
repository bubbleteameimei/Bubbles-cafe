import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';

export interface GlobalLoadingContextType {
  isVisible: boolean;
  showLoadingOverlay: () => void;
  hideLoadingOverlay: () => void;
  setLoadingMessage: (message: string) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

/**
 * Custom hook to access the global loading overlay
 */
export function useGlobalLoadingOverlay() {
  return useContext(GlobalLoadingContext);
}

interface GlobalLoadingOverlayProps {
  children: React.ReactNode;
  defaultMessage?: string;
  minimumLoadingDuration?: number;
  debugMode?: boolean;
}

/**
 * GlobalLoadingOverlay - A component that provides a global loading overlay
 * that can be triggered from anywhere in the application.
 * 
 * This component:
 * 1. Creates a context for controlling the loading overlay
 * 2. Renders the unified LoadingScreen component
 * 3. Provides functions to show/hide the overlay
 * 4. Can be triggered imperatively from any component
 */
export function GlobalLoadingOverlay({
  children,
  defaultMessage = 'Loading...',
  minimumLoadingDuration = 800,
  debugMode = false,
}: GlobalLoadingOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  // Show the loading overlay
  const showLoadingOverlay = useCallback(() => {
    if (debugMode) console.log('[GlobalLoading] Showing loading overlay');
    setLoadingStartTime(Date.now());
    setIsVisible(true);
  }, [debugMode]);

  // Hide the loading overlay with minimum duration enforcement
  const hideLoadingOverlay = useCallback(() => {
    if (!loadingStartTime) {
      setIsVisible(false);
      return;
    }

    const elapsedTime = Date.now() - loadingStartTime;
    const remainingTime = Math.max(0, minimumLoadingDuration - elapsedTime);

    if (debugMode) {
      console.log(`[GlobalLoading] Hiding overlay: elapsedTime=${elapsedTime}ms, remainingTime=${remainingTime}ms`);
    }

    // Always remove the loading overlay, even if there's remaining time
    // This ensures we don't get stuck with a persistent overlay
    if (remainingTime > 0) {
      // Use a shorter delay to avoid excessive waiting
      const adjustedDelay = Math.min(remainingTime, 200);
      setTimeout(() => {
        setIsVisible(false);
        setLoadingStartTime(null);
      }, adjustedDelay);
    } else {
      // Immediately hide
      setIsVisible(false);
      setLoadingStartTime(null);
    }
  }, [loadingStartTime, minimumLoadingDuration, debugMode]);

  // Update the loading message
  const setLoadingMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setIsVisible(false);
      setLoadingStartTime(null);
    };
  }, []);

  return (
    <GlobalLoadingContext.Provider
      value={{
        isVisible,
        showLoadingOverlay,
        hideLoadingOverlay,
        setLoadingMessage,
      }}
    >
      {/* Use the unified LoadingScreen component */}
      {isVisible && <LoadingScreen />}
      {children}
    </GlobalLoadingContext.Provider>
  );
}

// Imperative API for global access
let globalShowLoading: (() => void) | undefined;
let globalHideLoading: (() => void) | undefined;
let globalSetMessage: ((message: string) => void) | undefined;

/**
 * Initialize the global loading functions
 * This should be called from the GlobalLoadingOverlay component
 */
export function initGlobalLoadingFunctions(
  show: () => void,
  hide: () => void,
  setMessage: (message: string) => void
) {
  globalShowLoading = show;
  globalHideLoading = hide;
  globalSetMessage = setMessage;
}

/**
 * Show the global loading overlay imperatively
 */
export function showGlobalLoading(message?: string) {
  if (message && globalSetMessage) {
    globalSetMessage(message);
  }
  globalShowLoading?.();
}

/**
 * Hide the global loading overlay imperatively
 */
export function hideGlobalLoading() {
  globalHideLoading?.();
}

/**
 * Internal component to register global functions with the GlobalLoadingContext
 */
export function GlobalLoadingRegistry() {
  const context = useGlobalLoadingOverlay();
  
  useEffect(() => {
    if (context) {
      initGlobalLoadingFunctions(
        context.showLoadingOverlay,
        context.hideLoadingOverlay,
        context.setLoadingMessage
      );
    }
    
    return () => {
      initGlobalLoadingFunctions(
        () => {},
        () => {},
        () => {}
      );
    };
  }, [context]);
  
  return null;
}