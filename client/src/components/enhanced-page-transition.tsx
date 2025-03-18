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
  loadingTimeout?: number;
}

/**
 * EnhancedPageTransition - A component for smooth transitions between pages
 * 
 * This component:
 * 1. Detects route changes using wouter's useLocation
 * 2. Shows a loading screen during transitions when enabled
 * 3. Animates pages in and out with configurable durations
 * 4. Integrates with the global loading system
 * 5. Includes logic to auto-hide loading screen after timeout
 */
export function EnhancedPageTransition({
  children,
  transitionDuration = 200, // Reduced from 300ms to make transitions faster
  disableAnimation = false,
  loadingMessage = 'Loading page...',
  enableLoadingScreen = true,
  mode = 'wait',
  loadingTimeout = 1500 // Auto-hide loading screen after 1.5 seconds to prevent it showing too long
}: EnhancedPageTransitionProps) {
  // Always call hooks in the same order
  const [location] = useLocation();
  const [currentLocation, setCurrentLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const globalLoading = useGlobalLoadingOverlay();
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialRenderRef = useRef(true);

  // Helper for hiding the loading screen
  const hideLoadingScreen = () => {
    if (enableLoadingScreen && globalLoading) {
      globalLoading.hideLoadingOverlay();
    }
  };

  // Handle location changes and trigger transitions
  useEffect(() => {
    // Always ensure hooks are called even if we return early
    const shouldSkipInitialRender = initialRenderRef.current;
    
    // Skip the initial render to prevent showing loading on first page load
    if (shouldSkipInitialRender) {
      initialRenderRef.current = false;
      setCurrentLocation(location);
      return;
    }
    
    // Only proceed with the transition if needed
    const needsTransition = location !== currentLocation && !isTransitioning;
    if (!needsTransition) return;
    
    // Start transition
    setIsTransitioning(true);
    
    // Show loading screen for page transitions if enabled
    if (enableLoadingScreen && globalLoading) {
      globalLoading.setLoadingMessage(loadingMessage);
      globalLoading.showLoadingOverlay();
      
      // Set a timeout to automatically hide the loading screen
      // This prevents the loading screen from showing indefinitely
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        hideLoadingScreen();
      }, loadingTimeout);
    }

    // Clear existing timeout if any
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // Schedule the location update
    const delay = disableAnimation ? 0 : transitionDuration;
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentLocation(location);
      setIsTransitioning(false);
      
      // Hide the loading overlay after the content has loaded
      hideLoadingScreen();
      
      // Clean up the loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }, delay);
    
    // Clean up timeout on unmount or before re-running effect
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      // Ensure loading screen is hidden when component unmounts
      hideLoadingScreen();
    };
  }, [location, currentLocation, transitionDuration, disableAnimation, enableLoadingScreen, globalLoading, loadingMessage, isTransitioning, loadingTimeout]);

  // Additional cleanup effect specifically for unmounting
  useEffect(() => {
    return () => {
      // Make sure to clean up any timeouts and hide loading screens on unmount
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      hideLoadingScreen();
    };
  }, []);

  // Always render the same component structure, just with or without animation props
  // This helps avoid React hooks inconsistency with conditional returns
  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={currentLocation}
        initial={disableAnimation ? undefined : { opacity: 0 }}
        animate={disableAnimation ? undefined : { opacity: 1 }}
        exit={disableAnimation ? undefined : { opacity: 0 }}
        transition={disableAnimation ? undefined : { 
          duration: transitionDuration / 1000,
          ease: "easeInOut" // Add easing for smoother transitions
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}