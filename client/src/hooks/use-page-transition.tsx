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
      
      // Show loading for minimum 300ms to ensure users see it
      const minLoadingTime = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(minLoadingTime);
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