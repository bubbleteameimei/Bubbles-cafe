import React, { createContext, useContext, useEffect } from 'react';
import useAdaptiveScroll from '@/hooks/useAdaptiveScroll';

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

// Reader paths (kept for potential future use)
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
  // Initialize adaptive scroll with standard browser behavior
  const { scrollType, isScrolling } = useAdaptiveScroll({
    enabled: true,
    sensitivity: 1.0 // Standard browser sensitivity
  });

  // One-time cleanup of legacy localStorage keys from removed scroll features
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.startsWith('gentleReturn_') || k.startsWith('readerGentleScroll_')) {
          localStorage.removeItem(k);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  return (
    <ScrollEffectsContext.Provider
      value={{
        scrollType,
        isScrolling,
        isPositionRestored: false, // Always false since memory is removed
        wasRefresh: false
      }}
    >
      {children}
    </ScrollEffectsContext.Provider>
  );
};

export default ScrollEffectsProvider;