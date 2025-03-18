import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import LoadingScreen from './LoadingScreen';

interface AbsoluteLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  zIndex?: number;
  backdropColor?: string;
  textColor?: string;
  disableScroll?: boolean;
  showSpinner?: boolean;
  spinnerSize?: number;
  spinnerColor?: string;
  className?: string;
  hideAfter?: number;
  onHide?: () => void;
  useCustomLoader?: boolean;
}

/**
 * AbsoluteLoadingOverlay - A loading overlay component that renders outside 
 * the normal DOM hierarchy using a React Portal.
 * 
 * This component:
 * 1. Renders a full-screen overlay with customizable styling
 * 2. Uses a portal to ensure it appears above all other content
 * 3. Can disable scrolling while active
 * 4. Supports custom spinner and message
 * 5. Can auto-hide after a specified duration
 * 6. Can use the custom LoadingScreen component
 */
export default function AbsoluteLoadingOverlay({
  isLoading,
  message = 'Loading...',
  zIndex = 9999,
  backdropColor = 'rgba(0, 0, 0, 0.7)',
  textColor = 'white',
  disableScroll = true,
  showSpinner = true,
  spinnerSize = 40,
  spinnerColor,
  className = '',
  hideAfter,
  onHide,
  useCustomLoader = true
}: AbsoluteLoadingOverlayProps) {
  // Create portal container on first render if it doesn't exist
  useEffect(() => {
    // Only run in browser environment
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    
    try {
      let overlayRoot = document.getElementById('overlay-root');
      if (!overlayRoot && document.body) {
        overlayRoot = document.createElement('div');
        overlayRoot.id = 'overlay-root';
        document.body.appendChild(overlayRoot);
      }
  
      return () => {
        // Clean up only if we created it and it's empty and still exists in the DOM
        if (overlayRoot && document.body) {
          try {
            // Check if the element is actually in the DOM before removing it
            if (document.body.contains && document.body.contains(overlayRoot) && 
                overlayRoot.childNodes.length === 0) {
              document.body.removeChild(overlayRoot);
            }
          } catch (err) {
            console.error('Failed to remove overlay root:', err);
          }
        }
      };
    } catch (err) {
      console.error('Error in overlay initialization:', err);
      return undefined; // Return empty cleanup function
    }
  }, []);

  // Disable scrolling when the overlay is active
  useEffect(() => {
    // Only run in browser environment
    if (typeof document === 'undefined' || !document.body) return;
    
    if (disableScroll && isLoading) {
      document.body.style.overflow = 'hidden';
      // Safe access to window properties
      if (typeof window !== 'undefined' && window.innerWidth && document.documentElement && document.documentElement.clientWidth) {
        document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      if (document.body) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    };
  }, [isLoading, disableScroll]);

  // Auto-hide after specified duration
  useEffect(() => {
    if (isLoading && hideAfter && onHide) {
      const timer = setTimeout(() => {
        onHide();
      }, hideAfter);
      return () => clearTimeout(timer);
    }
  }, [isLoading, hideAfter, onHide]);

  // Don't render anything if not loading
  if (!isLoading) return null;

  // Use the custom LoadingScreen if requested
  const renderContent = () => {
    if (useCustomLoader) {
      return <LoadingScreen />;
    }

    // Otherwise use the default spinner
    const overlayStyle: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: backdropColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex,
      color: textColor,
    };

    return (
      <div style={overlayStyle} className={className} data-testid="loading-overlay">
        {showSpinner && (
          <div className="loader mb-4">
            <span>L</span>
            <span>O</span>
            <span>A</span>
            <span>D</span>
            <span>I</span>
            <span>N</span>
            <span>G</span>
          </div>
        )}
        {message && <div className="text-center font-medium">{message}</div>}
      </div>
    );
  };

  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    return renderContent();
  }

  // Use portal to render outside component hierarchy
  try {
    const overlayRoot = document.getElementById('overlay-root');
    if (overlayRoot) {
      return createPortal(renderContent(), overlayRoot);
    }
  } catch (error) {
    console.error('Error accessing overlay root:', error);
  }

  // Fallback direct render if portal container isn't ready
  return renderContent();
}