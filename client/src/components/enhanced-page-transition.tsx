import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'wouter';
import LoadingScreen from './ui/loading-screen';

interface EnhancedPageTransitionProps {
  children: React.ReactNode;
  loadingTimeout?: number;
}

export function EnhancedPageTransition({
  children,
  loadingTimeout = 800, // Default timeout in milliseconds
}: EnhancedPageTransitionProps) {
  const [location] = useLocation();
  const [showLoading, setShowLoading] = useState(false);
  const [key, setKey] = useState(location);
  const prevLocationRef = useRef<string>(location);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Show loading screen when location changes
  useEffect(() => {
    // Only trigger on actual location changes
    if (location !== prevLocationRef.current) {
      // Show loading immediately
      setShowLoading(true);
      
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Set a timeout to update the key and hide loading
      loadingTimeoutRef.current = setTimeout(() => {
        setKey(location);
        setShowLoading(false);
        prevLocationRef.current = location;
      }, loadingTimeout);
    }
    
    // Clean up timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [location, loadingTimeout]);
  
  // For routing transitions, generate route-specific variants
  const getTransitionVariants = () => {
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
    
    // Default transition for other pages
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { 
        duration: 0.2 
      }
    };
  };
  
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
            height: "100%",
            width: "100%",
            position: "relative",
            overflowX: "hidden"
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default EnhancedPageTransition;