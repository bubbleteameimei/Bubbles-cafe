import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

/**
 * Custom Switch component that exactly matches the "Remember me" toggle in auth.css
 * Dimensions: 40px width by 20px height
 * Thumb size: 16px by 16px
 * Positioning: 2px from edges
 * Translation: 20px on check
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "relative inline-flex h-[20px] w-[40px] shrink-0 cursor-pointer rounded-[30px]",
      "bg-muted transition-colors duration-300 ease-in-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb 
      className={cn(
        "pointer-events-none block h-[16px] w-[16px] rounded-full bg-white",
        "absolute top-[2px] left-[2px]",
        "shadow-sm transition-transform duration-300 ease-in-out",
        "data-[state=checked]:translate-x-[20px]"
      )}
    />
  </SwitchPrimitives.Root>
))

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }