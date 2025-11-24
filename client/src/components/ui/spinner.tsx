import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Responsive loading spinner component
 */
export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
    xl: 'w-12 h-12 border-4',
  };

  const reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const baseTrackColor = 'hsl(var(--foreground))';
  const accentColor = 'hsl(var(--primary))';

  return (
    <div
      className={`inline-block ${
        reduceMotion ? '' : 'animate-spin'
      } rounded-full border-solid align-[-0.125em] ${sizeClasses[size]} ${className}`}
      role="status"
      style={
        reduceMotion
          ? {
              animation: 'none',
              borderColor: baseTrackColor,
              borderTopColor: accentColor,
              borderRightColor: 'transparent',
              filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.35))',
            }
          : {
              borderColor: baseTrackColor,
              borderTopColor: accentColor,
              borderRightColor: 'transparent',
              filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.35))',
            }
      }
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface SpinnerOverlayProps {
  message?: string;
  className?: string;
}

/**
 * Spinner with overlay container for loading states
 */
export function SpinnerOverlay({ message = 'Loading...', className = '' }: SpinnerOverlayProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
}

export default Spinner;