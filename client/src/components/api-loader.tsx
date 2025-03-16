import { useEffect } from 'react';
import { useLoading } from '@/hooks/use-loading';

interface ApiLoaderProps {
  isLoading: boolean;
  loadingDelay?: number; // Optional delay before showing loading screen (ms)
  minDisplayTime?: number; // Optional minimum display time for loading screen (ms)
}

/**
 * Component that manages loading state for API requests
 * Shows loading screen based on the isLoading prop
 * Includes options for delay and minimum display time to prevent flicker
 */
export function ApiLoader({ 
  isLoading, 
  loadingDelay = 300, 
  minDisplayTime = 500 
}: ApiLoaderProps) {
  const { showLoading, hideLoading } = useLoading();
  
  useEffect(() => {
    let showTimeoutId: NodeJS.Timeout | null = null;
    let hideTimeoutId: NodeJS.Timeout | null = null;
    let loadingStartTime = 0;
    
    if (isLoading) {
      // Delay showing loading screen to prevent flashing for quick operations
      showTimeoutId = setTimeout(() => {
        loadingStartTime = Date.now();
        showLoading();
      }, loadingDelay);
    } else if (loadingStartTime > 0) {
      // Ensure the loading screen is shown for at least minDisplayTime
      const timeElapsed = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minDisplayTime - timeElapsed);
      
      hideTimeoutId = setTimeout(() => {
        hideLoading();
        loadingStartTime = 0;
      }, remainingTime);
    } else {
      hideLoading();
    }
    
    return () => {
      if (showTimeoutId) clearTimeout(showTimeoutId);
      if (hideTimeoutId) clearTimeout(hideTimeoutId);
    };
  }, [isLoading, showLoading, hideLoading, loadingDelay, minDisplayTime]);
  
  return null; // This component doesn't render anything
}

export default ApiLoader;