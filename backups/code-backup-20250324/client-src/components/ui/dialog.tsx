"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Generate a unique ID for default title/description if needed
  const id = React.useId();
  const defaultTitleId = `dialog-title-${id}`;
  const defaultDescId = `dialog-desc-${id}`;
  
  // Check if aria attributes are already provided
  const hasAriaLabel = Boolean(props['aria-label']);
  const hasAriaLabelledby = Boolean(props['aria-labelledby']);
  const hasAriaDescribedby = Boolean(props['aria-describedby']);
  
  // Use React.Children.toArray to get a flat, searchable array
  const childrenArray = React.Children.toArray(children);
  
  // Check if DialogTitle is present at the top level
  const hasDirectTitle = childrenArray.some(child => 
    React.isValidElement(child) && child.type === DialogTitle
  );
  
  // Check if DialogDescription is present at the top level
  const hasDirectDescription = childrenArray.some(child => 
    React.isValidElement(child) && child.type === DialogDescription
  );
  
  // Check for DialogHeader and if it contains DialogTitle or DialogDescription
  let hasTitleInHeader = false;
  let hasDescriptionInHeader = false;
  
  childrenArray.forEach(child => {
    if (React.isValidElement(child) && child.type === DialogHeader) {
      const headerChildren = React.Children.toArray(child.props.children);
      
      hasTitleInHeader = headerChildren.some(headerChild => 
        React.isValidElement(headerChild) && headerChild.type === DialogTitle
      );
      
      hasDescriptionInHeader = headerChildren.some(headerChild => 
        React.isValidElement(headerChild) && headerChild.type === DialogDescription
      );
    }
  });
  
  // Determine if we have title and description
  const hasTitle = hasDirectTitle || hasTitleInHeader;
  const hasDescription = hasDirectDescription || hasDescriptionInHeader;
  
  // Create modified children array with necessary accessibility elements
  let contentChildren = [...childrenArray];
  
  // If no title is found and no aria-label or aria-labelledby is provided, add a title
  // Always add the title for screen readers, even with aria attributes provided
  const srOnlyTitle = (
    <DialogPrimitive.Title 
      key={`title-${id}`}
      id={defaultTitleId} 
      className="sr-only"
    >
      {hasTitle ? "Dialog Content" : "Dialog"}
    </DialogPrimitive.Title>
  );
  
  if (!hasTitle) {
    contentChildren = [srOnlyTitle, ...contentChildren];
  }
  
  // If no description is found and no aria-describedby is provided, add a description
  // Always add description for screen readers to resolve warnings
  const srOnlyDescription = (
    <DialogPrimitive.Description 
      key={`desc-${id}`}
      id={defaultDescId} 
      className="sr-only"
    >
      {hasDescription ? "This dialog contains content and actions." : "This dialog contains additional information and actions."}
    </DialogPrimitive.Description>
  );
  
  if (!hasDescription) {
    contentChildren = [...contentChildren, srOnlyDescription];
  }
  
  // Set aria attributes properly based on what we've found
  const finalAriaLabelledby = props['aria-labelledby'] || (hasAriaLabel ? undefined : defaultTitleId);
  const finalAriaDescribedby = props['aria-describedby'] || defaultDescId;
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
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
        <DialogPrimitive.Close 
          className="absolute right-4 top-4 rounded-sm p-1.5 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Close dialog</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
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
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, id, ...props }, ref) => {
  // Create an ID if none is provided
  const generatedId = React.useId();
  const titleId = id || `dialog-title-${generatedId}`;
  
  return (
    <DialogPrimitive.Title
      ref={ref}
      id={titleId}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
})
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, id, ...props }, ref) => {
  // Create an ID if none is provided
  const generatedId = React.useId();
  const descId = id || `dialog-desc-${generatedId}`;
  
  return (
    <DialogPrimitive.Description
      ref={ref}
      id={descId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
})
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, children, ...props }, ref) => {
  // Add default aria-label if not provided and children is text
  const hasAriaLabel = Boolean(props['aria-label']);
  const childrenText = typeof children === 'string' ? children : undefined;
  
  return (
    <DialogPrimitive.Close
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      aria-label={!hasAriaLabel && childrenText ? `${childrenText}` : !hasAriaLabel ? "Close dialog" : undefined}
      {...props}
    >
      {children}
    </DialogPrimitive.Close>
  );
})
DialogClose.displayName = DialogPrimitive.Close.displayName

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
}