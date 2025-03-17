import React, { useState, useEffect } from 'react';
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

  // Handle location changes and trigger transitions
  useEffect(() => {
    if (location !== currentLocation) {
      if (enableLoadingScreen && globalLoading) {
        // Show loading screen for page transitions
        globalLoading.setLoadingMessage(loadingMessage);
        globalLoading.showLoadingOverlay();
      }

      setIsTransitioning(true);

      // After the animation out, update current location
      const timeout = setTimeout(() => {
        setCurrentLocation(location);
        setIsTransitioning(false);
        
        // Hide the loading overlay after the content has loaded
        if (enableLoadingScreen && globalLoading) {
          globalLoading.hideLoadingOverlay();
        }
      }, disableAnimation ? 0 : transitionDuration);

      return () => clearTimeout(timeout);
    }
  }, [location, currentLocation, transitionDuration, disableAnimation, enableLoadingScreen, globalLoading, loadingMessage]);

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