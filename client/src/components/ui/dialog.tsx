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
  
  // Find title and description components in children
  let titleComponent = null;
  let descComponent = null;
  let foundTitleInHeader = false;
  let foundDescInHeader = false;
  
  // Recursive function to search for dialog components with IDs
  const findComponents = (element: React.ReactNode): void => {
    if (!React.isValidElement(element)) return;
    
    // Check if this element is a DialogTitle or DialogDescription
    if (element.type === DialogTitle) {
      titleComponent = element;
    }
    else if (element.type === DialogDescription) {
      descComponent = element;
    }
    
    // Check if this is a DialogHeader that might contain DialogTitle/DialogDescription
    if (element.type === DialogHeader && element.props && element.props.children) {
      React.Children.forEach(element.props.children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DialogTitle) {
            foundTitleInHeader = true;
            titleComponent = child;
          }
          else if (child.type === DialogDescription) {
            foundDescInHeader = true;
            descComponent = child;
          }
        }
      });
    }
    
    // If element has children, recursively search them
    if (element.props && element.props.children) {
      // Handle both arrays of children and single children
      if (Array.isArray(element.props.children)) {
        React.Children.forEach(element.props.children, findComponents);
      } else {
        findComponents(element.props.children);
      }
    }
  };
  
  // Start the search
  React.Children.forEach(children, findComponents);
  
  // Check if we found what we need
  const hasTitle = Boolean(titleComponent) || foundTitleInHeader;
  const hasDescription = Boolean(descComponent) || foundDescInHeader;
  
  // Get IDs from components if available
  const titleId = titleComponent?.props?.id || (foundTitleInHeader ? defaultTitleId : undefined);
  const descId = descComponent?.props?.id || (foundDescInHeader ? defaultDescId : undefined);
  
  // Create complete children with accessibility support
  let contentChildren = children;
  
  // If required accessibility attributes are missing, add them
  if (!hasTitle && !hasAriaLabel && !hasAriaLabelledby) {
    console.warn(
      "Dialog is missing a title. Adding a visually hidden title for accessibility."
    );
    contentChildren = (
      <>
        <DialogPrimitive.Title id={defaultTitleId} className="sr-only">
          Dialog Content
        </DialogPrimitive.Title>
        {children}
      </>
    );
  }
  
  if (!hasDescription && !hasAriaDescribedby) {
    contentChildren = (
      <>
        {contentChildren}
        <DialogPrimitive.Description id={defaultDescId} className="sr-only">
          Dialog contains additional information and actions.
        </DialogPrimitive.Description>
      </>
    );
  }
  
  // Use provided aria attributes first, or the auto-detected IDs if available, or fallback to defaults
  const finalAriaLabelledby = props['aria-labelledby'] || 
                      (titleId ? titleId : 
                      (!hasAriaLabel ? defaultTitleId : undefined));
                      
  const finalAriaDescribedby = props['aria-describedby'] || 
                      (descId ? descId : defaultDescId);
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        aria-labelledby={hasAriaLabel ? undefined : finalAriaLabelledby}
        aria-describedby={finalAriaDescribedby}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full",
          className
        )}
        {...props}
      >
        {contentChildren}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
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

const DialogClose = DialogPrimitive.Close
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