import React, { createContext, useContext, useEffect, useState } from 'react';
import useAdaptiveScroll from '@/hooks/useAdaptiveScroll';
import useGlobalGentleReturn from '@/hooks/useGlobalGentleReturn';

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
 * Provider component that manages scrolling behavior throughout the application.
 * All visual indicators have been removed for a cleaner, more intuitive experience.
 */
export const ScrollEffectsProvider: React.FC<ScrollEffectsProviderProps> = ({ children }) => {
  // States for context values
  const [isPositionRestored, setIsPositionRestored] = useState(false);
  const [wasRefresh, setWasRefresh] = useState(false);
  
  // Get current path to check exclusions
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isExcludedPath = EXCLUDED_PATHS.some(path => currentPath.startsWith(path));
  
  // Initialize adaptive scroll with standard browser behavior
  const { scrollType, isScrolling } = useAdaptiveScroll({
    enabled: true,
    sensitivity: 1.0 // Standard browser sensitivity
  });
  
  // Initialize global gentle return with all visual indicators disabled
  const gentleReturn = useGlobalGentleReturn({
    enabled: !isExcludedPath, // Only enable on non-excluded paths
    autoSave: true,
    showToast: false, // No toast notifications
    maxAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    highlightTarget: '', // No paragraph highlighting
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
      {children}
    </ScrollEffectsContext.Provider>
  );
};

export default ScrollEffectsProvider;