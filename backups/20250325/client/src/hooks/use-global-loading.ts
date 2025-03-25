import { useEffect } from 'react';
import { showGlobalLoading, hideGlobalLoading } from '@/utils/global-loading-manager';

/**
 * Hook to show/hide the global loading overlay based on loading state
 * 
 * @param isLoading Boolean indicating if content is loading
 * @param delayHide Optional delay in ms before hiding the loading overlay (prevents flicker)
 */
export function useGlobalLoading(isLoading: boolean, delayHide: number = 300) {
  useEffect(() => {
    let hideTimer: number | undefined;
    
    if (isLoading) {
      // Show loading immediately
      showGlobalLoading();
    } else {
      // Hide loading with optional delay
      hideTimer = window.setTimeout(() => {
        hideGlobalLoading();
      }, delayHide);
    }
    
    // Clean up on unmount or when isLoading changes
    return () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, [isLoading, delayHide]);
}

/**
 * Hook that provides imperative methods to show/hide the global loading overlay
 */
export function useGlobalLoadingControls() {
  return {
    showLoading: showGlobalLoading,
    hideLoading: hideGlobalLoading
  };
}