import { useState, useEffect, useCallback, useRef } from 'react';
import { showLoading, hideLoading, LoadingOptions } from '../utils/unified-loading-manager';

/**
 * React hook for using the unified loading system
 * 
 * This hook makes it easy to use the loading system from React components
 * while preserving all the features like minimum loading time and animation.
 * 
 * @param defaultOptions Default loading options
 * @returns A tuple with loading state and loading control functions
 */
export function useLoading(defaultOptions: LoadingOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const loadIdRef = useRef<string | null>(null);
  
  // Clean up function to ensure we don't leak resources
  const cleanupLoading = useCallback(() => {
    if (loadIdRef.current) {
      hideLoading(loadIdRef.current);
      loadIdRef.current = null;
    }
  }, []);
  
  // Start loading with options
  const startLoading = useCallback((options: LoadingOptions = {}) => {
    // Clean up any existing loading first
    cleanupLoading();
    
    // Start new loading
    const mergedOptions = { ...defaultOptions, ...options };
    loadIdRef.current = showLoading(mergedOptions);
    setIsLoading(true);
    
    return loadIdRef.current;
  }, [cleanupLoading, defaultOptions]);
  
  // Stop loading
  const stopLoading = useCallback(() => {
    if (loadIdRef.current) {
      hideLoading(loadIdRef.current);
      loadIdRef.current = null;
      setIsLoading(false);
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupLoading();
    };
  }, [cleanupLoading]);
  
  return [isLoading, { startLoading, stopLoading }] as [boolean, { startLoading: typeof startLoading, stopLoading: typeof stopLoading }];
}

export default useLoading;