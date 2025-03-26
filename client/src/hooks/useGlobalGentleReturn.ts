import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GentleReturnOptions {
  enabled?: boolean;
  autoSave?: boolean;
  showToast?: boolean;
  maxAgeMs?: number;
  highlightTarget?: string;
  autoSaveInterval?: number;
}

interface ScrollPosition {
  scrollY: number;
  timestamp: number;
  percentRead?: number;
}

/**
 * Implements the Global Gentle Return feature
 * 
 * This hook remembers the user's scroll position across the entire website
 * and smoothly restores it when they return to a page they've visited before.
 * It provides different animations for refreshes vs. normal navigation.
 */
const useGlobalGentleReturn = ({
  enabled = true,
  autoSave = true,
  showToast = true,
  maxAgeMs = 7 * 24 * 60 * 60 * 1000, // 7 days default
  highlightTarget = 'p',
  autoSaveInterval = 2000
}: GentleReturnOptions = {}) => {
  // Toast notifications
  const { toast } = useToast();
  
  // Was position restored
  const [restored, setRestored] = useState(false);
  
  // Current navigation state
  const location = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Refs to track state across renders
  const timerRef = useRef<number | null>(null);
  const isRefresh = useRef(false);
  const lastSavedPosition = useRef<number | null>(null);
  
  // Check if a navigation is a refresh vs. regular navigation
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    
    // Use Performance API to determine if this is a page refresh
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      // TypeScript doesn't know about the 'type' property on PerformanceNavigationTiming
      const entry = navEntries[0] as any;
      isRefresh.current = entry.type === 'reload';
    } else {
      // Fallback for browsers without Performance API
      isRefresh.current = false;
    }
  }, [enabled]);
  
  // Save current position to localStorage
  const savePosition = () => {
    if (!enabled || typeof window === 'undefined') return;
    
    try {
      // Get current position
      const scrollY = window.scrollY;
      
      // Don't save if position hasn't changed meaningfully
      if (lastSavedPosition.current !== null && 
          Math.abs(scrollY - lastSavedPosition.current) < 50) {
        return;
      }
      
      // Calculate percentage through content
      const docHeight = Math.max(
        document.body.scrollHeight, 
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      const viewportHeight = window.innerHeight;
      const trackLength = docHeight - viewportHeight;
      const percentRead = trackLength > 0 ? Math.min(scrollY / trackLength, 1) * 100 : 0;
      
      // Only save if we've scrolled at least a little bit
      if (scrollY > 50 || percentRead > 2) {
        // Create position data
        const position: ScrollPosition = {
          scrollY,
          timestamp: Date.now(),
          percentRead
        };
        
        // Create storage key based on path
        const storageKey = `gentleReturn_${location}`;
        
        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(position));
        lastSavedPosition.current = scrollY;
      }
    } catch (error) {
      console.error('[GentleReturn] Error saving position:', error);
    }
  };
  
  // Clean up old position data to prevent localStorage from filling up
  const cleanupOldPositions = () => {
    if (!enabled || typeof window === 'undefined') return;
    
    try {
      const now = Date.now();
      
      // Get all keys in localStorage
      const allKeys = Object.keys(localStorage);
      
      // Filter for gentleReturn keys
      const positionKeys = allKeys.filter(key => key.startsWith('gentleReturn_'));
      
      // Check each entry and remove if older than maxAgeMs
      positionKeys.forEach(key => {
        try {
          const positionJSON = localStorage.getItem(key);
          if (positionJSON) {
            const position = JSON.parse(positionJSON) as ScrollPosition;
            if (now - position.timestamp > maxAgeMs) {
              localStorage.removeItem(key);
            }
          }
        } catch (err) {
          // If a specific entry is corrupt, just remove it
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('[GentleReturn] Error cleaning up old positions:', error);
    }
  };
  
  // Restore position when the component mounts
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    
    const restorePosition = () => {
      try {
        // Skip if already restored
        if (restored) return;
        
        // Skip if at top of page
        if (window.scrollY > 50) return;
        
        // Create storage key based on path
        const storageKey = `gentleReturn_${location}`;
        
        // Get saved position from localStorage
        const positionJSON = localStorage.getItem(storageKey);
        
        if (positionJSON) {
          const position = JSON.parse(positionJSON) as ScrollPosition;
          
          // Check if position is still valid (not too old)
          const now = Date.now();
          if (now - position.timestamp <= maxAgeMs) {
            // Don't restore if it's a very small scroll position
            if (position.scrollY < 100 && (!position.percentRead || position.percentRead < 5)) {
              return;
            }
            
            // Prepare for staged scrolling
            const initialDelay = isRefresh.current ? 300 : 600;
            
            // Use a timeout to allow the page to fully load and render
            setTimeout(() => {
              // Visual position indicator has been removed for a cleaner user experience
              // No temporary visual indicators are shown during position restoration
              
              // Stage 2: Perform the actual scroll
              setTimeout(() => {
                // Scroll to the saved position with appropriate behavior
                window.scrollTo({
                  top: position.scrollY,
                  // Use instant for refresh, smooth for navigation
                  behavior: isRefresh.current ? 'auto' : 'smooth'
                });
                
                // Paragraph highlight feature has been removed for a cleaner user experience
                // No highlighting is applied to any paragraphs during position restoration
              }, isRefresh.current ? 500 : 800);
              
              if (showToast) {
                // Show toast notification
                toast({
                  title: isRefresh.current ? "Position Restored" : "Welcome Back",
                  description: `Returned to your previous position`,
                  duration: 3000
                });
              }
              
              // Mark position as restored
              setRestored(true);
            }, initialDelay);
          }
        }
      } catch (error) {
        console.error('[GentleReturn] Error restoring position:', error);
      }
    };

    // Initial restore with a slight delay to allow the page to properly load
    const restoreTimeout = setTimeout(restorePosition, 100);
    
    return () => {
      clearTimeout(restoreTimeout);
    };
  }, [location, enabled, maxAgeMs, toast, showToast, highlightTarget, restored]);
  
  // Setup auto-save for position while scrolling
  useEffect(() => {
    if (!enabled || !autoSave || typeof window === 'undefined') return;
    
    // Save position when user is about to leave the page
    const handleBeforeUnload = () => {
      savePosition();
    };
    
    // Save position periodically while scrolling
    const handleScroll = () => {
      // Clear any existing timer
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      
      // Set up a new timer
      timerRef.current = window.setTimeout(() => {
        savePosition();
      }, autoSaveInterval);
    };
    
    // Set up event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up on component unmount
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Save on unmount
      savePosition();
    };
  }, [location, enabled, autoSave, autoSaveInterval]);
  
  // Clean up old entries once in a while
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    
    // Run cleanup once on mount
    cleanupOldPositions();
    
    // Clean up old entries daily
    const cleanupInterval = setInterval(cleanupOldPositions, 24 * 60 * 60 * 1000);
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, [enabled, maxAgeMs]);
  
  return {
    savePosition,
    positionRestored: restored,
    isRefresh: isRefresh.current,
  };
};

export default useGlobalGentleReturn;