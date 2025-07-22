"use client"

import { Toaster as SonnerToaster } from "sonner"

interface SonnerProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  className?: string;
}

export function Sonner({ position = "bottom-right", className = "" }: SonnerProps = {}) {
  return (
    <SonnerToaster 
      position={position} 
      className={`sonner-toast-container ${className}`}
      toastOptions={{
        duration: 5000,
        className: "sonner-toast",
        descriptionClassName: "sonner-description",
      }}
      theme="system"
      richColors
    />
  )
}