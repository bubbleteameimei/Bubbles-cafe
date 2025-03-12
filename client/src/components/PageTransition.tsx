import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: "fade" | "slide" | "blur" | "horror" | "zoom";
  duration?: number;
}

/**
 * Component for adding smooth transitions between pages
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  mode = "fade",
  duration = 0.4
}) => {
  const [location] = useLocation();
  const [key, setKey] = useState(location);
  const [rendering, setRendering] = useState(false);
  
  // Update the key when location changes to trigger animation
  useEffect(() => {
    setRendering(true);
    setKey(location);
    
    // Small delay to allow rendering to complete
    const timer = setTimeout(() => {
      setRendering(false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [location]);

  // Define transition variants based on the mode
  const getVariants = useCallback(() => {
    switch (mode) {
      case "slide":
        return {
          initial: { x: 15, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -15, opacity: 0 },
        };
      case "blur":
        return {
          initial: { filter: "blur(8px)", opacity: 0 },
          animate: { filter: "blur(0px)", opacity: 1 },
          exit: { filter: "blur(8px)", opacity: 0 },
        };
      case "horror":
        return {
          initial: { 
            filter: "contrast(1.8) brightness(0.3) blur(10px) hue-rotate(10deg) grayscale(0.4)",
            opacity: 0, 
            scale: 1.05,
            x: Math.random() * 10 - 5,
            y: Math.random() * 10 - 5,
            rotate: Math.random() * 1 - 0.5,
          },
          animate: { 
            filter: "contrast(1) brightness(1) blur(0px) hue-rotate(0deg) grayscale(0)",
            opacity: 1, 
            scale: 1,
            x: 0,
            y: 0,
            rotate: 0,
          },
          exit: { 
            filter: "contrast(2) brightness(0.2) blur(15px) hue-rotate(-10deg) grayscale(0.6)",
            opacity: 0, 
            scale: 0.95,
            x: Math.random() * -10 - 5,
            y: Math.random() * 10 - 5,
            rotate: Math.random() * -1 - 0.5,
          },
        };
      case "zoom":
        return {
          initial: { opacity: 0, scale: 0.96 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.04 },
        };
      case "fade":
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  }, [mode]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={getVariants()}
        transition={{ 
          duration: duration,
          ease: mode === "horror" ? [0.37, 0.01, 0.94, 0.46] : "easeInOut",
          damping: mode === "horror" ? 12 : 10,
          stiffness: mode === "horror" ? 100 : 50
        }}
        style={{ 
          height: "100%",
          willChange: "opacity, transform, filter",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          perspective: 1000,
        }}
      >
        {!rendering && children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;