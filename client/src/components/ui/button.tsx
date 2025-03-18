import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 data-[loading=true]:loading",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-[#444444] dark:bg-[#333333] text-white dark:text-white hover:bg-[#505050] dark:hover:bg-[#3f3f3f]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        charcoal: "bg-[#121212] dark:bg-[#121212] text-white dark:text-white hover:bg-[#1a1a1a] dark:hover:bg-[#1a1a1a]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  noOutline?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, noOutline = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Extract text content for automatic aria-label when none provided
    const hasAriaLabel = Boolean(props['aria-label']);
    const childrenText = typeof children === 'string' ? children : undefined;
    
    // Check if there's a data-loading attribute that indicates loading state
    const dataAttrs = props as { [key: string]: any };
    const isLoading = dataAttrs['data-loading'] === 'true';
    
    // Check if it has appropriate accessibility attributes
    const hasRole = Boolean(props.role);
    const hasTabIndex = 'tabIndex' in props;
    
    // Generate additional style for removing outlines if requested
    const customStyle = noOutline ? {
      outline: 'none',
      boxShadow: 'none'
    } : {};
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }), 
          noOutline ? 'focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0' : ''
        )}
        ref={ref}
        aria-label={!hasAriaLabel && childrenText ? childrenText : undefined}
        aria-busy={isLoading ? 'true' : undefined}
        role={!hasRole && asChild ? 'button' : undefined}
        tabIndex={!hasTabIndex && asChild ? 0 : undefined}
        style={{
          WebkitTapHighlightColor: noOutline ? 'transparent' : undefined,
          ...customStyle,
          ...props.style
        }}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }