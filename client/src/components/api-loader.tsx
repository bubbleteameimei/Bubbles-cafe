import React, { useState, useEffect, useRef } from 'react';
import LoadingScreen from './LoadingScreen';

interface ApiLoaderProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  minimumLoadTime?: number;
  showDelay?: number;
  debug?: boolean;
}

/**
 * ApiLoader - A component that provides a consistent loading experience
 * for API requests across the application.
 *
 * This component:
 * 1. Shows the unified LoadingScreen component while API requests are in progress
 * 2. Enforces a minimum loading time to prevent flashes
 * 3. Adds a small delay before showing to avoid flickering for fast requests
 * 4. Can be debugged with console logs
 */
const ApiLoader: React.FC<ApiLoaderProps> = ({
  isLoading,
  children,
  minimumLoadTime = 500,
  showDelay = 300,
  debug = false
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
        const hideTimer = setTimeout(() => {
          setShowLoader(false);
          loadingStartTime.current = null;
        }, remainingTime);
        
        // Save the timer reference for cleanup
        return () => clearTimeout(hideTimer);
      } else {
        setShowLoader(false);
        loadingStartTime.current = null;
      }
    }
    
    // Clean up on unmount
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      // Force cleanup of loading state on unmount
      setShowLoader(false);
      loadingStartTime.current = null;
    };
  }, [isLoading, minimumLoadTime, showDelay]);
  
  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      setShowLoader(false);
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {showLoader && <LoadingScreen />}
      <div className="relative">
        {children}
      </div>
    </>
  );
};

export default ApiLoader;