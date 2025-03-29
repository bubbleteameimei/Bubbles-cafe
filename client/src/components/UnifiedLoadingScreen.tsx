import React, { useEffect } from 'react';
import { useLoading } from '../components/ui/loading-screen';

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
 * A simple compatibility loading screen component
 * 
 * This component is a compatibility layer for the old loading system
 */
const UnifiedLoadingScreen: React.FC<UnifiedLoadingScreenProps> = ({
  isLoading = false,
  children,
}) => {
  // Get the loading state and controls from the hook
  const { showLoading, hideLoading } = useLoading();
  
  // Handle loading state changes
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);
  
  // Render only children since the loading screen is managed globally
  return <>{children}</>;
};

export default UnifiedLoadingScreen;