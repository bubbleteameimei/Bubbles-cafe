import { useEffect, useState, useRef } from 'react';

export interface AdaptiveScrollOptions {
  enabled?: boolean;
  sensitivity?: number;
  showIndicator?: boolean; // Kept for backward compatibility but no longer used
}

/**
 * Simplified scroll hook with standard browser behavior
 * 
 * This hook now uses native browser scrolling without any amplification or custom behaviors.
 * It still tracks scrolling state for other components that might need this information,
 * but does not modify the default scrolling experience in any way.
 */
const useAdaptiveScroll = ({
  enabled = true,
  sensitivity = 1.0, // Standard sensitivity (no amplification)
  showIndicator = false // Visual indicators disabled
}: AdaptiveScrollOptions = {}) => {
  // Current scroll type (kept for API compatibility)
  const [scrollType, setScrollType] = useState<'normal' | 'fast' | 'slow'>('normal');
  // Is currently scrolling
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Timeout ref to track scrolling activity
  const scrollTimeoutRef = useRef<number | null>(null);
  
  // Minimal implementation that only tracks scrolling state
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    
    // Simple scroll handler that only tracks scrolling state
    const handleScroll = () => {
      // Clear any previous scroll timeout
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set scrolling state to true
      setIsScrolling(true);
      
      // Set timeout to detect when scrolling stops
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        setScrollType('normal');
      }, 150);
    };
    
    // Register event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [enabled]);
  
  return {
    scrollType,
    isScrolling
  };
};

export default useAdaptiveScroll;