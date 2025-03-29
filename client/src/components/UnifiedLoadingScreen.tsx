import React, { useEffect } from 'react';
import { LoadingOptions } from '../utils/unified-loading-manager';
import { useLoading } from '../hooks/use-loading';

interface UnifiedLoadingScreenProps {
  isLoading?: boolean;
  children?: React.ReactNode;
  minimumLoadTime?: number;
  showDelay?: number;
  maximumLoadTime?: number;
  debug?: boolean;
  message?: string;
}

/**
 * A unified loading screen component that uses the new unified loading system
 * 
 * This component provides a drop-in replacement for the old ApiLoader component
 * while using the unified loading system behind the scenes.
 */
const UnifiedLoadingScreen: React.FC<UnifiedLoadingScreenProps> = ({
  isLoading = false,
  children,
  minimumLoadTime = 500,
  showDelay = 300,
  maximumLoadTime = 5000,
  debug = false,
  message,
}) => {
  // Get the loading state and controls from the hook
  const [loadingState, { startLoading, stopLoading }] = useLoading();
  
  // Handle loading state changes
  useEffect(() => {
    if (isLoading) {
      startLoading({
        minimumLoadTime,
        showDelay,
        maximumLoadTime,
        debug,
        message,
      });
    } else {
      stopLoading();
    }
  }, [
    isLoading,
    minimumLoadTime,
    showDelay,
    maximumLoadTime,
    debug,
    message,
    startLoading,
    stopLoading,
  ]);
  
  // Render only children since the loading screen is managed globally
  return <>{children}</>;
};

export default UnifiedLoadingScreen;