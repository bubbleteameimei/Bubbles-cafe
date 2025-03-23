import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrollToTopButtonProps {
  threshold?: number;
  showLabel?: boolean;
  position?: "bottom-right" | "bottom-left";
  className?: string;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  threshold = 300,
  showLabel = false,
  position = "bottom-right",
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Position classes based on the position prop
  const positionClasses = {
    "bottom-right": "right-4 bottom-4 mb-2 mr-1", // Match the FeedbackButton spacing
    "bottom-left": "left-4 bottom-4 mb-2 ml-1"
  };

  useEffect(() => {
    // Function to handle scroll event and toggle button visibility
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", toggleVisibility);
    
    // Initial check
    toggleVisibility();

    // Clean up event listener on component unmount
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed z-50",
            positionClasses[position],
            className
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={scrollToTop}
            variant="outline"
            aria-label="Scroll to top"
            className={cn(
              "rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-accent/20 transition-shadow",
              showLabel ? "px-4" : "size-10"
            )}
          >
            <ArrowUp className={cn("h-5 w-5", showLabel && "mr-2")} />
            {showLabel && <span>Top</span>}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;