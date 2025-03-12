import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: React.ReactNode;
  effect?: 'fade' | 'slide' | 'scale' | 'horror' | 'glitch' | 'none';
  duration?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  effect = 'fade',
  duration = 0.4
}) => {
  const [location] = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [activeTransition, setActiveTransition] = useState(effect);

  // Check user's motion preferences
  useEffect(() => {
    // If user prefers reduced motion, use fade transition or none
    if (prefersReducedMotion) {
      setActiveTransition(effect === 'none' ? 'none' : 'fade');
      // Use shorter duration for reduced motion
      duration = 0.2;
    } else {
      setActiveTransition(effect);
    }
  }, [prefersReducedMotion, effect]);

  // Define different transition effects
  const getTransitionProps = () => {
    if (!shouldAnimate || activeTransition === 'none') {
      return {
        initial: {},
        animate: {},
        exit: {},
        transition: { duration: 0 }
      };
    }

    switch (activeTransition) {
      case 'slide':
        return {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -50 },
          transition: {
            duration,
            ease: [0.25, 0.1, 0.25, 1]
          }
        };

      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 },
          transition: {
            duration,
            ease: [0.25, 0.1, 0.25, 1]
          }
        };

      case 'horror':
        return {
          initial: { opacity: 0, scale: 0.98, filter: 'blur(8px)' },
          animate: { 
            opacity: 1, 
            scale: 1, 
            filter: 'blur(0px)',
            transition: {
              duration,
              ease: [0.25, 0.1, 0.25, 1],
              filter: { duration: duration * 1.5 }
            }
          },
          exit: { 
            opacity: 0, 
            scale: 1.02, 
            filter: 'blur(12px)',
            transition: {
              duration: duration * 0.7,
              ease: [0.25, 0.1, 0.25, 1],
              filter: { duration: duration * 0.5 }
            }
          }
        };

      case 'glitch':
        return {
          initial: { 
            opacity: 0,
            filter: 'brightness(1.2) contrast(1.2)',
            x: 0
          },
          animate: { 
            opacity: 1,
            filter: 'brightness(1) contrast(1)',
            x: 0,
            transition: {
              duration,
              ease: "easeOut",
              filter: { duration: duration * 0.8 },
              x: {
                duration: duration * 0.5,
                ease: "easeInOut",
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                keyframes: [0, -3, 3, -2, 2, 0]
              }
            }
          },
          exit: { 
            opacity: 0, 
            filter: 'brightness(1.2) contrast(1.2)',
            x: 0,
            transition: {
              duration: duration * 0.7,
              ease: "easeIn",
              filter: { duration: duration * 0.5 },
              x: {
                duration: duration * 0.3,
                ease: "easeInOut",
                times: [0, 0.3, 0.6, 1],
                keyframes: [0, 2, -2, 0]
              }
            }
          }
        };

      case 'fade':
      default:
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
          transition: {
            duration,
            ease: [0.25, 0.1, 0.25, 1]
          }
        };
    }
  };

  // Disable animations if user has requested reduced motion
  useEffect(() => {
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setShouldAnimate(!e.matches);
    };

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    setShouldAnimate(!mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  const transitionProps = getTransitionProps();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={transitionProps.initial}
        animate={transitionProps.animate}
        exit={transitionProps.exit}
        transition={transitionProps.transition as any}
        className="page-transition-container"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;