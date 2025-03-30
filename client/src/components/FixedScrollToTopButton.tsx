import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FixedScrollToTopButtonProps {
  threshold?: number;
  showLabel?: boolean;
}

/**
 * A fixed scroll-to-top button that always appears in the bottom right corner.
 * This is a simplified version that doesn't use position prop to avoid conflicts.
 */
const FixedScrollToTopButton: React.FC<FixedScrollToTopButtonProps> = ({
  threshold = 300,
  showLabel = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

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
          id="scroll-to-top-button"
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

export default FixedScrollToTopButton;