import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          // Removed: input-solid-bg, ring-offset-background, focus-visible:ring-2, focus-visible:ring-ring, focus-visible:ring-offset-2
          className
        )}
        ref={ref}
        style={{
          // Direct style overrides to prevent black borders on password fields
          boxShadow: "none",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
