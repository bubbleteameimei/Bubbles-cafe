import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGlobalLoadingOverlay } from './GlobalLoadingOverlay';

interface EnhancedPageTransitionProps {
  children: React.ReactNode;
  transitionDuration?: number;
  disableAnimation?: boolean;
  loadingMessage?: string;
  enableLoadingScreen?: boolean;
  mode?: 'sync' | 'wait' | 'popLayout';
}

/**
 * EnhancedPageTransition - A component for smooth transitions between pages
 * 
 * This component:
 * 1. Detects route changes using wouter's useLocation
 * 2. Shows a loading screen during transitions when enabled
 * 3. Animates pages in and out with configurable durations
 * 4. Integrates with the global loading system
 */
export function EnhancedPageTransition({
  children,
  transitionDuration = 300,
  disableAnimation = false,
  loadingMessage = 'Loading page...',
  enableLoadingScreen = true,
  mode = 'wait'
}: EnhancedPageTransitionProps) {
  const [location] = useLocation();
  const [currentLocation, setCurrentLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const globalLoading = useGlobalLoadingOverlay();
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialRenderRef = useRef(true);

  // Handle location changes and trigger transitions
  useEffect(() => {
    // Skip the initial render to prevent showing loading on first page load
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      setCurrentLocation(location);
      return;
    }
    
    if (location !== currentLocation && !isTransitioning) {
      setIsTransitioning(true);
      
      // Show loading screen for page transitions
      if (enableLoadingScreen && globalLoading) {
        globalLoading.setLoadingMessage(loadingMessage);
        globalLoading.showLoadingOverlay();
      }

      // After the animation out, update current location
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      transitionTimeoutRef.current = setTimeout(() => {
        setCurrentLocation(location);
        setIsTransitioning(false);
        
        // Hide the loading overlay after the content has loaded
        if (enableLoadingScreen && globalLoading) {
          globalLoading.hideLoadingOverlay();
        }
      }, disableAnimation ? 0 : transitionDuration);
    }
    
    // Clean up timeout on unmount
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [location, currentLocation, transitionDuration, disableAnimation, enableLoadingScreen, globalLoading, loadingMessage, isTransitioning]);

  // Simple render without animations if animations are disabled
  if (disableAnimation) {
    return <>{children}</>;
  }

  // Animated render with framer-motion
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentLocation}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: transitionDuration / 1000 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}