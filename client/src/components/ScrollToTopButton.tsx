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

  // Position classes based on the position prop - responsive for different device sizes
  const positionClasses = {
    "bottom-right": "right-3 sm:right-4 md:right-6 lg:right-8 bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 mb-2 mr-1",
    "bottom-left": "left-3 sm:left-4 md:left-6 lg:left-8 bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 mb-2 ml-1"
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
              showLabel ? "px-3 sm:px-4 md:px-5" : "h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
            )}
          >
            <ArrowUp className={cn(
              "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
              showLabel && "mr-1 sm:mr-2"
            )} />
            {showLabel && <span className="text-xs sm:text-sm md:text-base">Top</span>}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;