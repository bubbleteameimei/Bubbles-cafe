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
}

/**
 * Empty ApiLoader Component
 * 
 * This component has been completely emptied to remove all loading functionality.
 * It now just renders children with no loading screens or effects.
 */
const ApiLoader: React.FC<ApiLoaderProps> = ({
  isLoading,
  children,
  debug = false,
  // All other props are ignored
}) => {
  // Simply render children with no loading effects
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