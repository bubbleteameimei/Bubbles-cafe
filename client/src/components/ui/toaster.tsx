import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect, useRef } from "react"

export function Toaster() {
  const { toasts } = useToast()
  const viewportRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const updatePosition = () => {
      const container = document.querySelector('[data-toast-container]')
      if (container && viewportRef.current) {
        const rect = container.getBoundingClientRect()
        viewportRef.current.style.position = 'fixed'
        viewportRef.current.style.bottom = `${window.innerHeight - rect.top + 160}px` // Position further above the like/dislike container
        viewportRef.current.style.left = '50%'
        viewportRef.current.style.transform = 'translateX(-50%)'
      }
    }

    // Initial position update
    updatePosition()

    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)

    // Update position when toasts change
    const observer = new MutationObserver(updatePosition)
    const toastContainer = document.querySelector('[data-toast-container]')
    if (toastContainer) {
      observer.observe(toastContainer, { 
        attributes: true,
        childList: true,
        subtree: true 
      })
    }

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
      observer.disconnect()
    }
  }, [toasts])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport ref={viewportRef} />
    </ToastProvider>
  )
}