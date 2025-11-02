import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: "fade" | "slide" | "blur" | "zoom";
  duration?: number;
}

/**
 * Lightweight page transition: fade-in on route changes.
 * Respects prefers-reduced-motion by disabling animation when set.
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  mode = "fade",
  duration = 0.18,
}) => {
  const [location] = useLocation();
  const prefersReducedMotion =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: "opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;