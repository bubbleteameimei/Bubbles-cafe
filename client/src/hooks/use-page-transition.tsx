import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

export function usePageTransition() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(location);

  // Track location changes for page transitions
  useEffect(() => {
    if (location !== previousLocation) {
      setIsLoading(true);
      setPreviousLocation(location);
      
      // Show loading for minimum 200ms but maximum 800ms to prevent hanging
      const minLoadingTime = setTimeout(() => {
        setIsLoading(false);
      }, 200);
      
      // Force hide after maximum time to prevent hanging
      const maxLoadingTime = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => {
        clearTimeout(minLoadingTime);
        clearTimeout(maxLoadingTime);
      };
    }
  }, [location, previousLocation]);

  const showLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    showLoading,
    hideLoading,
    currentLocation: location
  };
}