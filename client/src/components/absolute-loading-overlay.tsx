import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

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
  onHide
}: AbsoluteLoadingOverlayProps) {
  // Create portal container on first render if it doesn't exist
  useEffect(() => {
    let overlayRoot = document.getElementById('overlay-root');
    if (!overlayRoot) {
      overlayRoot = document.createElement('div');
      overlayRoot.id = 'overlay-root';
      document.body.appendChild(overlayRoot);
    }

    return () => {
      // Clean up only if we created it and it's empty
      if (overlayRoot && overlayRoot.childNodes.length === 0) {
        document.body.removeChild(overlayRoot);
      }
    };
  }, []);

  // Disable scrolling when the overlay is active
  useEffect(() => {
    if (disableScroll && isLoading) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
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

  const renderContent = () => (
    <div style={overlayStyle} className={className} data-testid="loading-overlay">
      {showSpinner && (
        <Loader2 
          className="animate-spin mb-4" 
          size={spinnerSize} 
          color={spinnerColor}
        />
      )}
      {message && <div className="text-center font-medium">{message}</div>}
    </div>
  );

  // Use portal to render outside component hierarchy
  const overlayRoot = document.getElementById('overlay-root');
  if (overlayRoot) {
    return createPortal(renderContent(), overlayRoot);
  }

  // Fallback direct render if portal container isn't ready
  return renderContent();
}