"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Sonner() {
  return (
    <SonnerToaster 
      position="bottom-right" 
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