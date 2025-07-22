"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ReadingProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0-100) */
  progress: number;
  /** Variant of the progress indicator */
  variant?: "default" | "slim" | "accent" | "gradient";
  /** Whether to show the progress percentage */
  showPercentage?: boolean;
  /** Position of the progress indicator */
  position?: "top" | "bottom" | "sticky-top" | "sticky-bottom";
  /** Whether to animate the progress indicator */
  animate?: boolean;
}

/**
 * Reading progress indicator component
 * 
 * This component displays a visual indicator of reading progress 
 * that can be placed at the top or bottom of content.
 */
export function ReadingProgress({
  className,
  progress = 0,
  variant = "default",
  showPercentage = false,
  position = "top",
  animate = true,
  ...props
}: ReadingProgressProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Define position styles
  const positionStyles = {
    "top": "top-0 left-0 right-0",
    "bottom": "bottom-0 left-0 right-0",
    "sticky-top": "sticky top-0 left-0 right-0 z-10",
    "sticky-bottom": "sticky bottom-0 left-0 right-0 z-10",
  }

  // Define variant styles
  const variantStyles = {
    "default": "bg-primary",
    "slim": "h-0.5 bg-primary",
    "accent": "bg-accent",
    "gradient": "bg-gradient-to-r from-primary to-accent",
  }

  // Height based on variant
  const heightStyles = variant === "slim" ? "h-0.5" : "h-1";
  
  return (
    <div
      className={cn(
        "w-full relative overflow-hidden",
        positionStyles[position],
        heightStyles,
        "bg-muted",
        className
      )}
      role="progressbar"
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all",
          variantStyles[variant],
          animate ? "transition-all duration-300 ease-in-out" : ""
        )}
        style={{ width: `${normalizedProgress}%` }}
      />
      
      {showPercentage && (
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-background px-1 rounded">
          {Math.round(normalizedProgress)}%
        </span>
      )}
    </div>
  )
}