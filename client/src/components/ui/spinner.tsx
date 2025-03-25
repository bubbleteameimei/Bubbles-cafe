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
    xs: 'w-3 h-3 border-1',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div 
      className={`inline-block animate-spin rounded-full border-solid border-primary border-r-transparent align-[-0.125em] ${sizeClasses[size]} ${className}`}
      role="status"
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