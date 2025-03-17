import { useEffect, useState } from "react";

interface ApiLoaderProps {
  isLoading: boolean;
  loadingDelay?: number;
  minDisplayTime?: number;
}

/**
 * Global API Loading component with configurable delay and minimum display time
 * Shows a full-page loading indicator that covers the entire application
 * including header and footer for a seamless loading experience
 */
export function ApiLoader({ 
  isLoading,
  loadingDelay = 300, 
  minDisplayTime = 500 
}: ApiLoaderProps) {
  const [showLoader, setShowLoader] = useState(false);
  
  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let minDisplayTimer: NodeJS.Timeout;
    
    if (isLoading) {
      delayTimer = setTimeout(() => {
        setShowLoader(true);
      }, loadingDelay);
    } else if (showLoader) {
      minDisplayTimer = setTimeout(() => {
        setShowLoader(false);
      }, minDisplayTime);
    }
    
    return () => {
      clearTimeout(delayTimer);
      clearTimeout(minDisplayTimer);
    };
  }, [isLoading, loadingDelay, minDisplayTime, showLoader]);
  
  if (!showLoader) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">Horror Stories</h2>
          <p className="text-lg font-medium text-foreground/80 animate-pulse">Loading your story...</p>
        </div>
      </div>
    </div>
  );
}

export default ApiLoader;