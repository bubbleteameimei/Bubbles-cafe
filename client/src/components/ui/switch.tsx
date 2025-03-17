import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

interface ExtendedSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: "sm" | "md" | "lg";
}

// Custom styled Switch component to exactly match the auth page toggle design
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  ExtendedSwitchProps
>(({ className, size, ...props }, ref) => {
  // Default to md size if not specified
  const selectedSize = size || "md";

  // Size dimensions matching the toggle in auth.css
  const sizes = {
    sm: {
      container: "w-8 h-4",
      thumb: {
        size: "w-3 h-3",
        position: "top-[2px] left-[2px]",
        translate: "data-[state=checked]:translate-x-4"
      }
    },
    md: {
      container: "w-[40px] h-[20px]",
      thumb: {
        size: "w-[16px] h-[16px]",
        position: "top-[2px] left-[2px]",
        translate: "data-[state=checked]:translate-x-[20px]"
      }
    },
    lg: {
      container: "w-12 h-6",
      thumb: {
        size: "w-5 h-5",
        position: "top-[2px] left-[2px]",
        translate: "data-[state=checked]:translate-x-6"
      }
    }
  };
  
  return (
    <SwitchPrimitives.Root
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "bg-muted data-[state=checked]:bg-primary",
        sizes[selectedSize].container,
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb 
        className={cn(
          "pointer-events-none block rounded-full bg-white",
          "ring-0 transition-transform duration-300 ease-in-out absolute",
          sizes[selectedSize].thumb.size,
          sizes[selectedSize].thumb.position,
          sizes[selectedSize].thumb.translate
        )}
      />
    </SwitchPrimitives.Root>
  );
});

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch }