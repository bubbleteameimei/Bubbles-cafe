import { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FullscreenButtonProps {
  containerSelector?: string;
  className?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  showLabel?: boolean;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  containerSelector,
  className = "",
  position = "bottom-left",
  showLabel = false,
  onEnterFullscreen,
  onExitFullscreen
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Position classes
  const positionClasses = {
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6"
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        // If not in fullscreen mode, enter fullscreen
        const element = containerSelector 
          ? document.querySelector(containerSelector) 
          : document.documentElement;
        
        if (element && element.requestFullscreen) {
          // Standard fullscreen API
          element.requestFullscreen()
            .then(() => {
              setIsFullscreen(true);
              onEnterFullscreen?.();
            })
            .catch(err => {
              console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else if (element) {
          // Try vendor-specific methods
          const requestMethod = element.requestFullscreen || 
            (element as any).mozRequestFullScreen ||
            (element as any).webkitRequestFullscreen || 
            (element as any).msRequestFullscreen;
          
          if (requestMethod) {
            requestMethod.call(element);
            setIsFullscreen(true);
            onEnterFullscreen?.();
          } else {
            console.warn("Fullscreen API is not supported in this environment");
          }
        }
      } else {
        // If in fullscreen mode, exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen()
            .then(() => {
              setIsFullscreen(false);
              onExitFullscreen?.();
            })
            .catch(err => {
              console.error(`Error attempting to exit fullscreen: ${err.message}`);
            });
        } else {
          // Try vendor-specific methods
          const exitMethod = document.exitFullscreen || 
            (document as any).mozCancelFullScreen ||
            (document as any).webkitExitFullscreen || 
            (document as any).msExitFullscreen;
          
          if (exitMethod) {
            exitMethod.call(document);
            setIsFullscreen(false);
            onExitFullscreen?.();
          }
        }
      }
    } catch (error) {
      console.warn("Fullscreen toggle failed:", error);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "fixed z-40",
          positionClasses[position],
          className
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={toggleFullscreen}
          variant="outline"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className={cn(
            "rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-accent/20",
            showLabel ? "px-4" : "size-10"
          )}
        >
          {isFullscreen ? (
            <>
              <Minimize className={cn("h-5 w-5", showLabel && "mr-2")} />
              {showLabel && <span>Exit</span>}
            </>
          ) : (
            <>
              <Maximize className={cn("h-5 w-5", showLabel && "mr-2")} />
              {showLabel && <span>Fullscreen</span>}
            </>
          )}
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullscreenButton;