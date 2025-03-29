import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'wouter';
import LoadingScreen from './ui/loading-screen';

interface EnhancedPageTransitionProps {
  children: React.ReactNode;
  loadingTimeout?: number;
  minLoadingTime?: number;
}

export function EnhancedPageTransition({
  children,
  loadingTimeout = 800, // Default timeout in milliseconds
  minLoadingTime = 600, // Minimum time to show loading screen for visual consistency
}: EnhancedPageTransitionProps) {
  const [location] = useLocation();
  const [showLoading, setShowLoading] = useState(false);
  const [key, setKey] = useState(location);
  const prevLocationRef = useRef<string>(location);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number>(0);
  
  // Get transition variants based on route
  const getTransitionVariants = useCallback(() => {
    // Reader pages get a special transition
    if (location.startsWith('/reader')) {
      return {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { 
          type: "tween", 
          ease: "easeOut", 
          duration: 0.4 
        }
      };
    }
    
    // Admin pages
    if (location.startsWith('/admin')) {
      return {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
        transition: { 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }
      };
    }
    
    // Stories page
    if (location.startsWith('/stories')) {
      return {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 10 },
        transition: { 
          type: "tween",
          ease: "easeInOut",
          duration: 0.3
        }
      };
    }
    
    // Default transition for other pages
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { 
        duration: 0.2 
      }
    };
  }, [location]);
  
  // Calculate remaining loading time to ensure minimum display
  const calculateRemainingLoadingTime = useCallback(() => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - loadingStartTimeRef.current;
    return Math.max(0, minLoadingTime - elapsedTime);
  }, [minLoadingTime]);
  
  // Show loading screen when location changes
  useEffect(() => {
    // Only trigger on actual location changes
    if (location !== prevLocationRef.current) {
      // Record when we started loading
      loadingStartTimeRef.current = Date.now();
      
      // Show loading immediately
      setShowLoading(true);
      
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Set a timeout to update the key and hide loading
      loadingTimeoutRef.current = setTimeout(() => {
        const remainingTime = calculateRemainingLoadingTime();
        
        // If we haven't shown the loading screen for long enough,
        // wait until the minimum time has passed for visual consistency
        if (remainingTime > 0) {
          setTimeout(() => {
            setKey(location);
            setShowLoading(false);
            prevLocationRef.current = location;
          }, remainingTime);
        } else {
          setKey(location);
          setShowLoading(false);
          prevLocationRef.current = location;
        }
      }, loadingTimeout);
    }
    
    // Clean up timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [location, loadingTimeout, calculateRemainingLoadingTime]);
  
  // Get the variants for the current route
  const variants = getTransitionVariants();
  
  return (
    <>
      {/* Pre-emptive Loading Screen */}
      {showLoading && <LoadingScreen />}
      
      {/* Content with AnimatePresence */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={variants.transition}
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            width: "100%",
            maxWidth: "100%"
          }}
          className="w-full min-w-full max-w-full mx-auto"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default EnhancedPageTransition;