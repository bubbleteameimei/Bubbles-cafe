import React, { useEffect } from 'react';
import { useLoading } from '@/components/GlobalLoadingProvider';

interface ApiLoaderProps {
  isLoading: boolean;
  message?: string;
  children?: React.ReactNode;
  minimumLoadTime?: number;
  showDelay?: number;
  maximumLoadTime?: number; 
  debug?: boolean;
  shouldRedirectOnTimeout?: boolean;
  overlayZIndex?: number;
}

/**
 * ApiLoader Component
 * 
 * This component has been updated to integrate with the centralized loading context.
 * It shows/hides the global LoadingScreen based on the isLoading prop.
 */
const ApiLoader: React.FC<ApiLoaderProps> = ({
  isLoading,
  children,
  debug = false,
  // All other props are ignored
}) => {
  const { showLoading, hideLoading } = useLoading();
  
  // Use effect to synchronize the isLoading prop with the global loading state
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
    
    return () => {
      // Clean up by hiding loading when component unmounts
      hideLoading();
    };
  }, [isLoading, showLoading, hideLoading]);

  // Simply render children - loading is handled by the LoadingProvider
  return (
    <>
      {children && (
        <div className="relative">
          {children}
        </div>
      )}
    </>
  );
};

export default ApiLoader;