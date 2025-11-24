import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import './spinner.css';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Responsive loading spinner component
 * Uses a double-arc loader with theme-aware colors.
 */
export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeMap: Record<NonNullable<SpinnerProps['size']>, { size: string; border: string }> = {
    xs: { size: '0.75rem', border: '1.5px' }, // 12px
    sm: { size: '1rem', border: '2px' },      // 16px
    md: { size: '1.5rem', border: '2px' },    // 24px
    lg: { size: '2rem', border: '3px' },      // 32px
    xl: { size: '3rem', border: '4px' },      // 48px
  };

  const { size: spinnerSize, border } = sizeMap[size ?? 'md'];

  const { theme } = useTheme();
  const mode = theme.mode; // 'light' or 'dark'
  const reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const classes = [
    'loader',
    reduceMotion ? 'loader--static' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classes}
      role="status"
      aria-busy="true"
      style={
        {
          '--loader-size': spinnerSize,
          '--loader-border': border,
        } as React.CSSProperties
      }
    >
      <span className="sr-only">Loading...</span>
    </span>
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