import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  // Accessibility props
  describedBy?: string;
  expanded?: boolean;
  controls?: string;
  haspopup?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  pressed?: boolean;
  current?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
  // Screen reader specific
  ariaLabel?: string;
  srOnly?: string; // Screen reader only text
}

const buttonVariants = {
  variant: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent',
    link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary'
  },
  size: {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-9 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-md px-8 text-base',
    icon: 'h-10 w-10'
  }
};

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  loadingText = 'Loading...',
  leftIcon,
  rightIcon,
  children,
  disabled,
  describedBy,
  expanded,
  controls,
  haspopup,
  pressed,
  current,
  ariaLabel,
  srOnly,
  type = 'button',
  onClick,
  onKeyDown,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button';
  
  const isDisabled = disabled || loading;
  
  // Enhanced keyboard handling
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Space and Enter should trigger button action
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!isDisabled && onClick) {
        onClick(event as any);
      }
    }
    
    // Call original onKeyDown if provided
    onKeyDown?.(event);
  };
  
  // Generate comprehensive ARIA attributes
  const ariaAttributes = {
    'aria-label': ariaLabel,
    'aria-describedby': describedBy,
    'aria-expanded': expanded !== undefined ? expanded : undefined,
    'aria-controls': controls,
    'aria-haspopup': haspopup,
    'aria-pressed': pressed !== undefined ? pressed : undefined,
    'aria-current': current !== undefined ? current : undefined,
    'aria-disabled': isDisabled,
    'aria-busy': loading,
    'aria-live': loading ? 'polite' : undefined,
    'aria-atomic': loading ? 'true' : undefined
  };

  // Filter out undefined values
  const cleanAriaAttributes = Object.fromEntries(
    Object.entries(ariaAttributes).filter(([_, value]) => value !== undefined)
  );

  const buttonClasses = cn(
    // Base button styles
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
    'ring-offset-background transition-colors duration-200',
    // Focus styles (WCAG 2.1 AA compliant)
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    // Accessibility enhancements
    'touch-target-comfortable', // Minimum 48px touch target
    // Variant styles
    buttonVariants.variant[variant],
    // Size styles
    buttonVariants.size[size],
    // Disabled state
    isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    // Loading state
    loading && 'cursor-wait',
    className
  );

  return (
    <Comp
      ref={ref}
      className={buttonClasses}
      disabled={isDisabled}
      type={type}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...cleanAriaAttributes}
      {...props}
    >
      {/* Screen reader only text */}
      {srOnly && (
        <span className="sr-only">{srOnly}</span>
      )}
      
      {/* Left icon with proper spacing */}
      {leftIcon && !loading && (
        <span className="mr-2 flex-shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      
      {/* Loading spinner */}
      {loading && (
        <span className="mr-2 flex-shrink-0" aria-hidden="true">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      
      {/* Button content */}
      <span className={cn(
        'flex items-center justify-center',
        loading && 'opacity-70'
      )}>
        {loading ? loadingText : children}
      </span>
      
      {/* Right icon with proper spacing */}
      {rightIcon && !loading && (
        <span className="ml-2 flex-shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </Comp>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

// Export with convenience props for common patterns
export { AccessibleButton };

// Toggle Button variant for state changes
export const ToggleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps & {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}>(({ pressed, onPressedChange, children, ariaLabel, ...props }, ref) => {
  return (
    <AccessibleButton
      ref={ref}
      variant="outline"
      pressed={pressed}
      ariaLabel={ariaLabel || `${pressed ? 'Disable' : 'Enable'} ${children}`}
      onClick={() => onPressedChange(!pressed)}
      {...props}
    >
      {children}
    </AccessibleButton>
  );
});

ToggleButton.displayName = 'ToggleButton';

// Menu Button variant for dropdown menus
export const MenuButton = forwardRef<HTMLButtonElement, AccessibleButtonProps & {
  menuId: string;
  expanded: boolean;
}>(({ menuId, expanded, children, ...props }, ref) => {
  return (
    <AccessibleButton
      ref={ref}
      variant="outline"
      haspopup="menu"
      expanded={expanded}
      controls={menuId}
      ariaLabel={`${children} menu, ${expanded ? 'expanded' : 'collapsed'}`}
      rightIcon={
        <svg
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      }
      {...props}
    >
      {children}
    </AccessibleButton>
  );
});

MenuButton.displayName = 'MenuButton';

export default AccessibleButton;