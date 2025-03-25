import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useGlobalLoadingOverlay } from './GlobalLoadingOverlay';
import { motion, AnimatePresence } from 'framer-motion';

// Define props interface with optional transitionDuration to maintain backward compatibility
interface EnhancedPageTransitionProps {
  children: React.ReactNode;
  loadingMessage?: string;
  enableLoadingScreen?: boolean;
  loadingTimeout?: number;
  transitionDuration?: number; // Added for backward compatibility
  disableAnimation?: boolean; // Added for backward compatibility
  mode?: 'sync' | 'wait' | 'popLayout'; // Added for backward compatibility
}

/**
 * PRE-EMPTIVE EnhancedPageTransition - Shows loading screen BEFORE content changes
 * 
 * This implementation addresses the specific issue where a blank screen with just 
 * navigation and footer is visible before loading animation appears.
 */
export function EnhancedPageTransition({
  children,
  loadingMessage = 'Loading page...',
  enableLoadingScreen = true,
  loadingTimeout = 10000,
  // Unused props (kept for backward compatibility)
  transitionDuration,
  disableAnimation,
  mode
}: EnhancedPageTransitionProps) {
  const [location] = useLocation();
  const globalLoading = useGlobalLoadingOverlay();
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevLocationRef = useRef<string>(location);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentKey, setCurrentKey] = useState('page-key');
  
  // Determine transition variant based on route
  const getTransitionVariant = useCallback(() => {
    // Reader page gets a special slide transition
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
    
    // Admin pages get a fade and scale transition
    if (location.startsWith('/admin')) {
      return {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }
      };
    }
    
    // Home page gets a crossfade
    if (location === '/') {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { 
          type: "tween", 
          ease: "easeInOut", 
          duration: 0.5 
        }
      };
    }
    
    // Story pages (except reader) get a special treatment
    if (location.startsWith('/stories')) {
      return {
        initial: { opacity: 0, scale: 0.99 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.99 },
        transition: { 
          type: "spring", 
          stiffness: 250, 
          damping: 25 
        }
      };
    }
    
    // Default transition is a subtle fade from right
    return {
      initial: { opacity: 0, x: 10 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -10 },
      transition: { 
        type: "tween", 
        ease: "easeInOut", 
        duration: 0.3 
      }
    };
  }, [location]);

  // Function to show loading overlay
  const showLoading = useCallback(() => {
    if (enableLoadingScreen && globalLoading) {
      globalLoading.setLoadingMessage(loadingMessage);
      globalLoading.showLoadingOverlay();
    }
  }, [enableLoadingScreen, globalLoading, loadingMessage]);

  // Function to hide loading overlay
  const hideLoading = useCallback((delay = 0) => {
    if (enableLoadingScreen && globalLoading) {
      if (delay > 0) {
        setTimeout(() => {
          globalLoading.hideLoadingOverlay();
        }, delay);
      } else {
        globalLoading.hideLoadingOverlay();
      }
    }
  }, [enableLoadingScreen, globalLoading]);

  // Intercept navigation links to show loading screen
  useEffect(() => {
    // Function to handle link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.href.startsWith('javascript:') && 
          !link.href.startsWith('#') && !link.href.startsWith('mailto:') && 
          !link.target && link.getAttribute('href') !== location) {
        // Show loading screen before navigation
        showLoading();
      }
    };
    
    // Add event listener for link clicks
    document.addEventListener('click', handleLinkClick);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [showLoading, location]);
  
  // Handle navigation changes to hide loading screen after content loads
  useEffect(() => {
    // Skip initial render
    if (prevLocationRef.current === location) {
      return;
    }
    
    // Update previous location
    prevLocationRef.current = location;
    
    // Generate a new key to force re-render of children
    setCurrentKey(`page-${Date.now()}`);
    
    // Clean up any existing timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    
    // Set up timeouts for hiding loading screen
    // Normal timeout - hide after content has likely loaded
    loadingTimeoutRef.current = setTimeout(() => {
      hideLoading();
    }, 300); // Short delay to ensure content is ready
    
    // Safety timeout - ensure loading always hides eventually
    safetyTimeoutRef.current = setTimeout(() => {
      hideLoading();
    }, loadingTimeout);
    
    // Clean up timeouts on unmount or location change
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, [location, hideLoading, loadingTimeout]);
  
  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      hideLoading();
    };
  }, [hideLoading]);
  
  // Content loaded handler - called when content is fully rendered
  const onContentLoad = useCallback(() => {
    // Slight delay before hiding loading to prevent flicker
    setTimeout(() => {
      hideLoading();
    }, 100);
  }, [hideLoading]);
  
  // Effect to detect when content has fully rendered
  useEffect(() => {
    if (contentRef.current) {
      onContentLoad();
    }
  }, [children, onContentLoad]);
  
  // Get the current transition variant
  const transitionVariant = getTransitionVariant();
  
  // Determine if we should add staggered animations for children
  // Only apply to certain routes that would benefit from this effect
  const shouldAddChildAnimations = location.startsWith('/stories') || 
                                  location === '/' || 
                                  location.startsWith('/admin');
  
  // Create staggered transition variant for child animations
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };
  
  // Helper function to add data attributes to children for staggered animations
  const addStaggerProps = (children: React.ReactNode): React.ReactNode => {
    if (!shouldAddChildAnimations) return children;
    
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      return React.cloneElement(child, {
        ...child.props,
        'data-stagger-index': index,
      });
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        ref={contentRef}
        key={currentKey}
        style={{ 
          width: "100%", 
          position: "relative",
          minHeight: "100vh"
        }}
        data-location={location}
        initial={transitionVariant.initial}
        animate={transitionVariant.animate}
        exit={transitionVariant.exit}
        transition={transitionVariant.transition}
        className={shouldAddChildAnimations ? "staggered-parent" : ""}
        data-staggered={shouldAddChildAnimations ? "true" : "false"}
      >
        {shouldAddChildAnimations ? addStaggerProps(children) : children}
      </motion.div>
    </AnimatePresence>
  );
}