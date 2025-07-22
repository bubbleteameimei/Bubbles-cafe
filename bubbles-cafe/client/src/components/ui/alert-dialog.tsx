import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Generate a unique ID for the content
  const id = React.useId();
  
  // Check if aria attributes are already provided
  const hasAriaLabel = Boolean(props['aria-label']);
  const hasAriaLabelledby = Boolean(props['aria-labelledby']);
  const hasAriaDescribedby = Boolean(props['aria-describedby']);
  
  // Default IDs for title and description
  const defaultTitleId = `alert-dialog-title-${id}`;
  const defaultDescId = `alert-dialog-desc-${id}`;
  
  // Use React.Children.toArray to get a flat, searchable array
  const childrenArray = React.Children.toArray(children);
  
  // Check if AlertDialogTitle is present at the top level
  const hasDirectTitle = childrenArray.some(child => 
    React.isValidElement(child) && child.type === AlertDialogTitle
  );
  
  // Check if AlertDialogDescription is present at the top level
  const hasDirectDescription = childrenArray.some(child => 
    React.isValidElement(child) && child.type === AlertDialogDescription
  );
  
  // Check for AlertDialogHeader and if it contains AlertDialogTitle or AlertDialogDescription
  let hasTitleInHeader = false;
  let hasDescriptionInHeader = false;
  
  childrenArray.forEach(child => {
    if (React.isValidElement(child) && child.type === AlertDialogHeader) {
      const headerChildren = React.Children.toArray(child.props.children);
      
      hasTitleInHeader = headerChildren.some(headerChild => 
        React.isValidElement(headerChild) && headerChild.type === AlertDialogTitle
      );
      
      hasDescriptionInHeader = headerChildren.some(headerChild => 
        React.isValidElement(headerChild) && headerChild.type === AlertDialogDescription
      );
    }
  });
  
  // Determine if we have title and description
  const hasTitle = hasDirectTitle || hasTitleInHeader;
  const hasDescription = hasDirectDescription || hasDescriptionInHeader;
  
  // Create modified children array with necessary accessibility elements
  let contentChildren = [...childrenArray];
  
  // If no title is found and no aria-label or aria-labelledby is provided, add a title
  if (!hasTitle && !hasAriaLabel && !hasAriaLabelledby) {
    const srOnlyTitle = (
      <AlertDialogPrimitive.Title
        key={`title-${id}`}
        id={defaultTitleId}
        className="sr-only"
      >
        Alert Dialog
      </AlertDialogPrimitive.Title>
    );
    
    contentChildren = [srOnlyTitle, ...contentChildren];
  }
  
  // If no description is found and no aria-describedby is provided, add a description
  if (!hasDescription && !hasAriaDescribedby) {
    const srOnlyDescription = (
      <AlertDialogPrimitive.Description
        key={`desc-${id}`}
        id={defaultDescId}
        className="sr-only"
      >
        This alert dialog requires your attention or confirmation.
      </AlertDialogPrimitive.Description>
    );
    
    contentChildren = [...contentChildren, srOnlyDescription];
  }
  
  // Set aria attributes properly
  const finalAriaLabelledby = props['aria-labelledby'] || (hasAriaLabel ? undefined : defaultTitleId);
  const finalAriaDescribedby = props['aria-describedby'] || defaultDescId;
  
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        aria-labelledby={finalAriaLabelledby}
        aria-describedby={finalAriaDescribedby}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        {...props}
      >
        {contentChildren}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
})
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
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
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
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
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, id, ...props }, ref) => {
  // Create an ID derived from the parent if none provided
  const defaultId = React.useId();
  const titleId = id || `alert-dialog-title-${defaultId}`;
  
  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      id={titleId}
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
})
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, id, ...props }, ref) => {
  // Create an ID derived from the parent if none provided
  const defaultId = React.useId();
  const descId = id || `alert-dialog-desc-${defaultId}`;
  
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      id={descId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
})
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, children, ...props }, ref) => {
  // Extract children text for default aria-label if none provided
  const hasAriaLabel = Boolean(props['aria-label']);
  const childrenText = typeof children === 'string' ? children : undefined;
  
  return (
    <AlertDialogPrimitive.Action
      ref={ref}
      className={cn(
        buttonVariants(), 
        "focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      aria-label={!hasAriaLabel && childrenText ? `${childrenText} action` : undefined}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Action>
  );
})
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, children, ...props }, ref) => {
  // Extract children text for default aria-label if none provided
  const hasAriaLabel = Boolean(props['aria-label']);
  const childrenText = typeof children === 'string' ? children : undefined;
  
  return (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0 focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      aria-label={!hasAriaLabel && childrenText ? `${childrenText} action` : undefined}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Cancel>
  );
})
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}