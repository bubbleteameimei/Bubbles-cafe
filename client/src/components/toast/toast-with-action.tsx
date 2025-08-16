"use client"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"

export function ToastWithAction() {
  const { toast } = useToast()

  return (
    <Button
      variant="outline"
      onClick={() => {
        toast({
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        })
      }}
    >
      Show Toast
    </Button>
  )
}

export function useActionToast() {
  const { toast } = useToast();

  return ({
    title,
    description,
    actionText = "Try again",
    altText = "Try again",
    onAction
  }: {
    title: string,
    description: string,
    actionText?: string,
    altText?: string,
    onAction?: () => void
  }) => {
    return toast({
      title,
      description,
      action: <ToastAction altText={altText} onClick={onAction}>{actionText}</ToastAction>,
    });
  };
}