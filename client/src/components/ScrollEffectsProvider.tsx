import React, { createContext, useContext, useEffect, useState } from 'react';
import useAdaptiveScroll from '@/hooks/useAdaptiveScroll';
import useGlobalGentleReturn from '@/hooks/useGlobalGentleReturn';
import ScrollSpeedIndicator from '@/components/ui/ScrollSpeedIndicator';
import '@/styles/scroll-effects.css';

// Context type for scroll effects
interface ScrollEffectsContextType {
  scrollType: 'normal' | 'fast' | 'slow';
  isScrolling: boolean;
  isPositionRestored: boolean;
  wasRefresh: boolean;
}

// Create context with default values
const ScrollEffectsContext = createContext<ScrollEffectsContextType>({
  scrollType: 'normal',
  isScrolling: false,
  isPositionRestored: false,
  wasRefresh: false
});

// Paths to exclude from position tracking
const EXCLUDED_PATHS = [
  '/admin',
  '/login',
  '/register',
  '/reset-password',
  '/dashboard'
];

// Hook to access scroll effects context
export const useScrollEffects = () => useContext(ScrollEffectsContext);

interface ScrollEffectsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that manages both adaptive scroll and gentle return
 * features throughout the application
 */
export const ScrollEffectsProvider: React.FC<ScrollEffectsProviderProps> = ({ children }) => {
  // States for context values
  const [isPositionRestored, setIsPositionRestored] = useState(false);
  const [wasRefresh, setWasRefresh] = useState(false);
  
  // Get current path to check exclusions
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isExcludedPath = EXCLUDED_PATHS.some(path => currentPath.startsWith(path));
  
  // Initialize adaptive scroll (Multi-Speed Scroll)
  const { scrollType, isScrolling } = useAdaptiveScroll({
    enabled: true, // Always enable this feature
    sensitivity: 1.5,
    showIndicator: true
  });
  
  // Initialize global gentle return
  const gentleReturn = useGlobalGentleReturn({
    enabled: !isExcludedPath, // Only enable on non-excluded paths
    autoSave: true,
    showToast: true,
    maxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    highlightTarget: 'p', // CSS selector for paragraphs to highlight
    autoSaveInterval: 2000 // Save after 2 seconds of no scrolling
  });
  
  // Update provider state based on gentle return
  useEffect(() => {
    if (gentleReturn) {
      setIsPositionRestored(gentleReturn.positionRestored || false);
      setWasRefresh(gentleReturn.isRefresh || false);
    }
  }, [gentleReturn]);
  
  return (
    <ScrollEffectsContext.Provider
      value={{
        scrollType,
        isScrolling,
        isPositionRestored,
        wasRefresh
      }}
    >
      {/* Render scroll speed indicator */}
      <ScrollSpeedIndicator
        scrollType={scrollType}
        visible={isScrolling}
      />
      
      {/* Main content */}
      {children}
    </ScrollEffectsContext.Provider>
  );
};

export default ScrollEffectsProvider;