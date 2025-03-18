import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import "./switch.css"

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
  <div className="inline-flex items-center">
    <SwitchPrimitives.Root
      className={cn(
        "standardized-switch relative h-[20px] w-[40px] shrink-0 cursor-pointer rounded-[30px]",
        "border-0 bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        "disabled:opacity-50 data-[state=checked]:bg-primary",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "standardized-switch-thumb block h-[16px] w-[16px] rounded-full bg-background",
          "pointer-events-none absolute left-[2px] top-[2px] transition-transform",
          "data-[state=checked]:translate-x-5 shadow-lg ring-0"
        )}
      />
    </SwitchPrimitives.Root>
  </div>
))

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }