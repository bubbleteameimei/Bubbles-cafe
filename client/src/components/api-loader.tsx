import React from 'react';

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
  /** If true, block the entire UI with a global overlay (deprecated and ignored) */
  blockUi?: boolean;
}

/**
 * ApiLoader Component
 * 
 * Clean slate: no global or inline loading UI. Leaves only button-level loading.
 * Passes children through without modification.
 */
const ApiLoader: React.FC<ApiLoaderProps> = ({
  children,
}) => {
  return children ? <div className="relative">{children}</div> : null;
};

export default ApiLoader;