
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FullscreenTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onClose?: () => void
}

export function FullscreenTextarea({
  className,
  onClose,
  ...props
}: FullscreenTextareaProps) {
  const [value, setValue] = React.useState(props.defaultValue || props.value || "")
  
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    if (props.onChange) {
      props.onChange(e)
    }
  }

  return (
    <div className="fullscreen">
      <div className="fullscreen-content">
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
        <textarea
          className={cn("fullscreen-textarea", className)}
          {...props}
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
