
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FullscreenPageProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
}

export function FullscreenPage({
  className,
  children,
  onClose,
  ...props
}: FullscreenPageProps) {
  React.useEffect(() => {
    // Capture escape key to close
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [onClose])

  return (
    <div className="fullscreen" {...props}>
      <div className={cn("fullscreen-content", className)}>
        {onClose && (
          <div className="flex justify-end mb-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md"
            >
              Close
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
