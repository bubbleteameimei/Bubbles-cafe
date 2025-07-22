import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
}

/**
 * LoadingButton - A button component that shows a loading spinner
 * when in the loading state.
 * 
 * This component:
 * 1. Extends the base Button component
 * 2. Shows a loading spinner and optional loading text when in loading state
 * 3. Disables the button while loading
 * 4. Supports all standard button variants, sizes, and props
 */
export function LoadingButton({
  children,
  className,
  loading = false,
  loadingText,
  startIcon,
  endIcon,
  variant = 'default',
  size = 'default',
  fullWidth = false,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn(
        fullWidth && 'w-full',
        className
      )}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {startIcon && <span className="mr-2">{startIcon}</span>}
          {children}
          {endIcon && <span className="ml-2">{endIcon}</span>}
        </>
      )}
    </Button>
  );
}