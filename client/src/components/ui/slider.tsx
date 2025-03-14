"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, "aria-label": ariaLabel, ...props }, ref) => {
  // Generate a unique ID for aria-labelling if none is provided
  const id = React.useId();
  const labelId = `slider-label-${id}`;
  
  return (
    <div className="flex flex-col w-full gap-1.5">
      {/* If there is an aria-label, we create a visually hidden label for screen readers */}
      {ariaLabel && (
        <label id={labelId} className="sr-only">
          {ariaLabel}
        </label>
      )}
      <SliderPrimitive.Root
        ref={ref}
        aria-labelledby={ariaLabel ? labelId : undefined}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {/* We're using an array of thumbs based on the value prop */}
        {Array.isArray(props.value) && props.value.map((_, index) => (
          <SliderPrimitive.Thumb 
            key={index}
            className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            aria-label={ariaLabel ? `${ariaLabel} thumb ${index + 1}` : `Thumb ${index + 1}`}
          />
        ))}
        {/* If no value array is provided, render a single thumb */}
        {!Array.isArray(props.value) && (
          <SliderPrimitive.Thumb 
            className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            aria-label={ariaLabel ? `${ariaLabel} thumb` : "Thumb"}
          />
        )}
      </SliderPrimitive.Root>
    </div>
  )
})
Slider.displayName = "AccessibleSlider"

export { Slider }