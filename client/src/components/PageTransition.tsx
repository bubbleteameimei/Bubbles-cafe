import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: "fade" | "slide" | "blur" | "zoom";
  duration?: number;
}

/**
 * Component for adding smooth transitions between pages
 * Improved version with better error handling and performance
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  mode = "fade",
  duration = 0.4
}) => {
  const [location] = useLocation();
  
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
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case "zoom":
        return {
          initial: { opacity: 0, scale: 0.98 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.98 },
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

  // Memoize variants to avoid unnecessary recalculations
  const variants = useMemo(() => getVariants(), [getVariants]);
  
  // Create stable transition config
  const transition = useMemo(() => ({
    duration: duration,
    ease: "easeInOut"
  }), [duration]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        style={{ 
          height: "100%",
          width: "100%",
          position: "relative",
          overflowX: "hidden"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;