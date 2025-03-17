import React, { useState, useEffect, useRef } from 'react';
import AbsoluteLoadingOverlay from './absolute-loading-overlay';

interface ApiLoaderProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  minimumLoadTime?: number;
  showDelay?: number;
  debug?: boolean;
  overlayZIndex?: number;
  spinnerSize?: number;
}

/**
 * ApiLoader - A component that provides a consistent loading experience
 * for API requests across the application.
 *
 * This component:
 * 1. Shows a loading overlay while the API request is in progress
 * 2. Enforces a minimum loading time to prevent flashes
 * 3. Adds a small delay before showing to avoid flickering for fast requests
 * 4. Can be debugged with console logs
 */
const ApiLoader: React.FC<ApiLoaderProps> = ({
  isLoading,
  message = 'Loading...',
  children,
  minimumLoadTime = 500,
  showDelay = 300,
  debug = false,
  overlayZIndex = 100,
  spinnerSize = 40
}) => {
  const [showLoader, setShowLoader] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Log loading state changes when debug is enabled
  useEffect(() => {
    if (debug) {
      if (isLoading) {
        console.log('API Loader: Showing loading screen');
      } else {
        console.log('API Loader: Loading complete');
      }
    }
  }, [isLoading, debug]);

  // Handle loading state changes
  useEffect(() => {
    if (isLoading) {
      // Start loading
      loadingStartTime.current = Date.now();
      
      // Add delay before showing loader to prevent flashing
      showTimeoutRef.current = setTimeout(() => {
        setShowLoader(true);
      }, showDelay);
    } else {
      // Calculate how long the request took
      const timeElapsed = loadingStartTime.current 
        ? Date.now() - loadingStartTime.current 
        : 0;
      
      // Clear the show timeout if it's still pending
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      
      // Enforce minimum loading time
      const remainingTime = Math.max(0, minimumLoadTime - timeElapsed);
      
      if (remainingTime > 0 && showLoader) {
        setTimeout(() => {
          setShowLoader(false);
          loadingStartTime.current = null;
        }, remainingTime);
      } else {
        setShowLoader(false);
        loadingStartTime.current = null;
      }
    }
    
    // Clean up on unmount
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
    };
  }, [isLoading, minimumLoadTime, showDelay]);

  return (
    <div className="relative">
      <AbsoluteLoadingOverlay 
        isLoading={showLoader} 
        message={message}
        zIndex={overlayZIndex}
        spinnerSize={spinnerSize}
      />
      {children}
    </div>
  );
};

export default ApiLoader;