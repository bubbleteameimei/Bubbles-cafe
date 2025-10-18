import React, { useEffect } from 'react';
import { useLoading } from '@/components/GlobalLoadingProvider';
import { SpinnerOverlay } from '@/components/ui/spinner';

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
  /** If true, block the entire UI with the global overlay (delayed to avoid flicker) */
  blockUi?: boolean;
}

/**
 * ApiLoader Component
 * 
 * Integrates with the centralized loading context. If a provider isn't mounted,
 * it still renders a minimal inline spinner so the page never appears blank.
 */
const ApiLoader: React.FC<ApiLoaderProps> = ({
  isLoading,
  children,
  message,
  debug: _debug = false,
  blockUi = false,
}) => {
  const { showLoading, hideLoading } = useLoading();
  
  // Optionally synchronize the isLoading prop with the global loading state (block UI)
  useEffect(() => {
    if (!blockUi) return;
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
    
    return () => {
      // Clean up by hiding loading when component unmounts
      hideLoading();
    };
  }, [isLoading, blockUi, showLoading, hideLoading]);

  // If children are provided, render them. Otherwise, render a minimal spinner when loading.
  if (children) {
    return <div className="relative">{children}</div>;
  }

  return isLoading ? <SpinnerOverlay message={message || 'Loading…'} className="min-h-[40vh]" /> : null;
};

export default ApiLoader;