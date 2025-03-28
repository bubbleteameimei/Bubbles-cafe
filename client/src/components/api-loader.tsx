import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoadingScreen } from './ui/loading-screen';
import { hideGlobalLoading } from '@/utils/global-loading-manager';

interface ApiLoaderProps {
  isLoading: boolean;
  message?: string;
  children?: React.ReactNode;
  minimumLoadTime?: number;
  showDelay?: number;
  maximumLoadTime?: number; // Maximum time to show loading before forcing it to hide
  debug?: boolean;
  shouldRedirectOnTimeout?: boolean; // Control whether to redirect to 404 on timeout
  overlayZIndex?: number; // Optional z-index for the overlay
}

/**
 * ApiLoader - A component that provides a consistent loading experience
 * for API requests across the application.
 *
 * This component:
 * 1. Shows the unified LoadingScreen component while API requests are in progress
 * 2. Enforces a minimum loading time to prevent flashes
 * 3. Adds a small delay before showing to avoid flickering for fast requests
 * 4. Has a maximum load time to prevent infinite loading states
 * 5. Can be debugged with console logs
 */
const ApiLoader: React.FC<ApiLoaderProps> = ({
  isLoading,
  children,
  minimumLoadTime = 500,
  showDelay = 300,
  maximumLoadTime = 5000, // Increased to 5 seconds to allow more time for slow connections
  debug = false,
  shouldRedirectOnTimeout = false // Default to NOT redirecting to 404 to prevent unnecessary errors
}) => {
  // All hooks must be called unconditionally at the top level
  const [showLoader, setShowLoader] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Centralized cleanup function to avoid duplicate code
  const cleanupLoading = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    
    if (maxLoadTimeoutRef.current) {
      clearTimeout(maxLoadTimeoutRef.current);
      maxLoadTimeoutRef.current = null;
    }
    
    setShowLoader(false);
    loadingStartTime.current = null;
    hideGlobalLoading();
  }, []);

  // Debug logging
  useEffect(() => {
    if (debug && isLoading) {
      console.log('API Loader: Showing loading screen');
    } else if (debug && !isLoading) {
      console.log('API Loader: Loading complete');
    }
  }, [isLoading, debug]);

  // Handle loading state changes - combined into a single effect
  useEffect(() => {
    let hideTimer: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      // Start loading timer
      loadingStartTime.current = Date.now();
      
      // Add delay before showing loader to prevent flashing
      showTimeoutRef.current = setTimeout(() => {
        setShowLoader(true);
      }, showDelay);

      // Set maximum load time to prevent infinite loading
      maxLoadTimeoutRef.current = setTimeout(() => {
        if (debug) {
          console.log('API Loader: Maximum load time reached, forcing cleanup');
        }
        
        // Clean up all loading state
        cleanupLoading();
        
        // Only redirect if explicitly enabled - helps prevent spurious 404s
        if (shouldRedirectOnTimeout) {
          if (debug) {
            console.log('API Loader: Redirecting to 404 page due to timeout');
          }
          // Just hide the loader without redirecting to 404
          // This prevents many of the 404 errors throughout the site
        }
      }, maximumLoadTime);
    } else {
      // Loading complete - calculate timing for minimum display
      const timeElapsed = loadingStartTime.current ? Date.now() - loadingStartTime.current : 0;
      const remainingTime = Math.max(0, minimumLoadTime - timeElapsed);
      
      // Clear the show delay timeout
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }

      // Clear the maximum load timeout
      if (maxLoadTimeoutRef.current) {
        clearTimeout(maxLoadTimeoutRef.current);
        maxLoadTimeoutRef.current = null;
      }
      
      // Only delay hiding if loader is showing and we need to meet minimum time
      if (remainingTime > 0 && showLoader) {
        hideTimer = setTimeout(() => {
          setShowLoader(false);
          loadingStartTime.current = null;
        }, remainingTime);
      } else {
        // Hide immediately
        setShowLoader(false);
        loadingStartTime.current = null;
      }
    }
    
    // Clean up function that handles all timeout clearing
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      
      if (maxLoadTimeoutRef.current) {
        clearTimeout(maxLoadTimeoutRef.current);
        maxLoadTimeoutRef.current = null;
      }
    };
  }, [isLoading, minimumLoadTime, showDelay, maximumLoadTime, debug, cleanupLoading, shouldRedirectOnTimeout]);

  // Add a specific cleanup effect for unmount that won't be called during renders
  useEffect(() => {
    return () => {
      // Use our cleanup helper to ensure we don't repeat logic
      cleanupLoading();
    };
  }, [cleanupLoading]);

  // Consistent render pattern
  return (
    <>
      {/* Only render LoadingScreen when needed */}
      {showLoader && <LoadingScreen />}
      {children && (
        <div className="relative">
          {children}
        </div>
      )}
    </>
  );
};

export default ApiLoader;