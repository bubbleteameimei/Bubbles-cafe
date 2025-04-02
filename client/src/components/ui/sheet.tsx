import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useSwipeClose } from "@/hooks/use-swipe-close"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-background/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background/95 p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => {
  // Create a ref for the content
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  // Determine the swipe direction based on the side
  const swipeDirection = side === 'left' ? 'left' : 'right';
  
  // Get the SheetClose context to access the close function
  const close = () => {
    // Find and trigger the close button programmatically
    const closeButton = document.querySelector('[aria-label="Close"]') as HTMLButtonElement | null;
    if (closeButton) {
      closeButton.click();
    }
  };
  
  // Use the swipe-close hook with appropriate direction
  useSwipeClose({
    onClose: close,
    direction: swipeDirection,
    minSwipeDistance: 70
  });
  
  // Create a merged ref that combines both the forwarded ref and our internal ref
  const mergedRef = (node: React.ElementRef<typeof SheetPrimitive.Content> | null) => {
    // Update the forwarded ref
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      // Cast the ref to any to avoid TypeScript read-only errors
      (ref as any).current = node;
    }
  };
  
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={mergedRef}
        className={cn(sheetVariants({ side }), className)}
        data-swipe-direction={swipeDirection}
        {...props}
      >
        {children}
        <SheetPrimitive.Close 
          className="absolute right-4 top-4 flex h-3 w-3 items-center justify-center rounded-md bg-background/95 border border-border/40 opacity-80 shadow-sm touch-manipulation transition-all duration-150 ease-out hover:opacity-100 active:scale-95 focus:outline-none disabled:pointer-events-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Close"
        >
          <X className="h-2 w-2" strokeWidth={2} />
          <span className="sr-only">Close</span>
          <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 active:opacity-10 transition-opacity duration-150 rounded-md" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
})
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}