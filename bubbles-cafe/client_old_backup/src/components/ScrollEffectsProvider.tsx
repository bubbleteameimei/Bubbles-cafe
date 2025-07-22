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

// Reader paths - gentle scroll is now implemented directly in reader page
// and no longer handled by the global provider
const READER_PATHS = [
  '/reader',
  '/community-story'
];

// Hook to access scroll effects context
export const useScrollEffects = () => useContext(ScrollEffectsContext);

interface ScrollEffectsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that manages scrolling behavior throughout the application.
 * Gentle scroll memory is now completely disabled globally and only implemented in the reader page
 * to prevent jarring user experience when navigating between pages.
 */
export const ScrollEffectsProvider: React.FC<ScrollEffectsProviderProps> = ({ children }) => {
  // States for context values
  const [isPositionRestored, setIsPositionRestored] = useState(false);
  const [wasRefresh, setWasRefresh] = useState(false);
  
  // Get current path to check if this is a reader page
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Check if this is a reader page (we'll handle scroll separately there)
  const isReaderPath = READER_PATHS.some(path => currentPath.startsWith(path));
  
  // Initialize adaptive scroll with standard browser behavior
  const { scrollType, isScrolling } = useAdaptiveScroll({
    enabled: true,
    sensitivity: 1.0 // Standard browser sensitivity
  });
  
  // Initialize global gentle return - completely disabled for all pages
  // The reader pages now handle their own scroll position memory
  const gentleReturn = useGlobalGentleReturn({
    enabled: false, // Disabled completely for all non-reader pages
    autoSave: false,
    showToast: false,
    maxAgeMs: 1 * 24 * 60 * 60 * 1000, // 1 day (unused since disabled)
    highlightTarget: '',
    autoSaveInterval: 0
  });
  
  // Update provider state based on gentle return
  // This is now a no-op since gentle return is disabled
  useEffect(() => {
    if (gentleReturn) {
      setIsPositionRestored(false); // Always false since memory is disabled
      setWasRefresh(false);
    }
  }, [gentleReturn]);
  
  return (
    <ScrollEffectsContext.Provider
      value={{
        scrollType,
        isScrolling,
        isPositionRestored: false, // Always false since memory is disabled
        wasRefresh: false
      }}
    >
      {children}
    </ScrollEffectsContext.Provider>
  );
};

export default ScrollEffectsProvider;