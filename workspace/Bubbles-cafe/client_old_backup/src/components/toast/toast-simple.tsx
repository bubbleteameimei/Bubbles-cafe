"use client"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export function ToastSimple() {
  const { toast } = useToast()

  return (
    <Button
      variant="outline"
      onClick={() => {
        toast({
          description: "Your message has been sent.",
        })
      }}
    >
      Show Toast
    </Button>
  )
}

// Utility function to show toast without needing to render a button
export function showToast(description: string, variant: "default" | "destructive" | "success" = "default") {
  const { toast } = useToast()
  
  return toast({
    description,
    variant,
  })
}