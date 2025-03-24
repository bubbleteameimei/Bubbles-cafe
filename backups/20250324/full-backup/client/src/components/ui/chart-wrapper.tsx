"use client"

import * as React from "react"

// A simplified chart container that doesn't require the complex config object
interface ChartWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ChartWrapper({
  children,
  className,
  ...props
}: ChartWrapperProps) {
  return (
    <div className={`w-full ${className || ""}`} {...props}>
      {children}
    </div>
  )
}