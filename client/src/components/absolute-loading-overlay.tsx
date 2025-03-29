import React from 'react';

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
 * Empty AbsoluteLoadingOverlay Component
 * 
 * This component has been completely replaced with an empty implementation
 * that renders nothing, to eliminate all loading screen functionality.
 */
export default function AbsoluteLoadingOverlay({
  isLoading,
  message,
  zIndex,
  backdropColor,
  textColor,
  disableScroll,
  showSpinner,
  spinnerSize,
  spinnerColor,
  className,
  hideAfter,
  onHide,
  useCustomLoader
}: AbsoluteLoadingOverlayProps) {
  // Don't render anything regardless of isLoading state
  return null;
}