import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrollToTopButtonProps {
  threshold?: number;
  showLabel?: boolean;
  className?: string;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  threshold = 300,
  showLabel = false,
  className = ""
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

  // Important: Using inline styles to ensure this overrides any conflicting styles
  const fixedBottomRightStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 9999,
    left: 'auto' // This is important to override any left positioning
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          style={fixedBottomRightStyle}
          className={cn("shadow-md", className)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Button
            onClick={scrollToTop}
            variant="outline"
            aria-label="Scroll to top"
            className={cn(
              "rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-background/90 text-foreground border-muted transition-all",
              showLabel ? "px-3 sm:px-4 md:px-5" : "h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
            )}
          >
            <ArrowUp className={cn(
              "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-foreground",
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