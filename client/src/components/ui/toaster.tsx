
import * as React from "react";
import { useToast, type ToastVariant } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Variants for the toast animation
const toastVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

// Toast component with modern design
const Toast = React.forwardRef<
  HTMLDivElement,
  {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    variant?: ToastVariant;
    duration?: number;
    action?: React.ReactNode;
    onDismiss: (id: string) => void;
  }
>(({ id, title, description, variant = "default", duration = 5000, action, onDismiss }, ref) => {
  // Auto dismiss after specified duration (default 5 seconds)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [id, onDismiss, duration]);

  // Determine the icon based on variant
  const Icon = React.useMemo(() => {
    switch (variant) {
      case "success":
        return CheckCircle;
      case "destructive":
        return AlertTriangle;
      default:
        return Info;
    }
  }, [variant]);

  // Determine colors based on variant
  const colors = React.useMemo(() => {
    switch (variant) {
      case "success":
        return "border-green-600 bg-green-50 dark:bg-green-900/20 dark:border-green-800";
      case "destructive":
        return "border-red-600 bg-red-50 dark:bg-red-900/20 dark:border-red-800";
      default:
        return "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700";
    }
  }, [variant]);

  // Determine icon colors
  const iconColor = React.useMemo(() => {
    switch (variant) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "destructive":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  }, [variant]);

  return (
    <motion.div
      ref={ref}
      layout
      initial="initial"
      animate="animate"
      exit="exit"
      variants={toastVariants}
      className={cn(
        "relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        colors
      )}
    >
      <div className={cn("flex-shrink-0", iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 space-y-1">
        {title && (
          <h3 className="font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        )}
        {description && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {description}
          </div>
        )}
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
      
      <button
        onClick={() => onDismiss(id)}
        className="absolute right-2 top-2 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-400"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
});

Toast.displayName = "Toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  
  return (
    <div className="fixed bottom-20 right-0 z-50 flex w-full flex-col items-center gap-2 sm:bottom-8 sm:right-8 sm:items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            id={toast.id}
            title={toast.title} 
            description={toast.description} 
            variant={toast.variant} 
            duration={toast.duration}
            action={toast.action}
            onDismiss={dismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
