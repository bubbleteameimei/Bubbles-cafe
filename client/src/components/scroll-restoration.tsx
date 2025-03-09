
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const SCROLL_RESTORATION_KEY = 'horror-blog-scroll-positions';

interface ScrollPositions {
  [key: string]: number;
}

export function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Load saved positions from sessionStorage
  const getSavedScrollPositions = (): ScrollPositions => {
    try {
      const saved = sessionStorage.getItem(SCROLL_RESTORATION_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('[ScrollRestoration] Error loading scroll positions:', error);
      return {};
    }
  };

  // Save current scroll position
  const saveScrollPosition = (path: string) => {
    try {
      const scrollY = window.scrollY;
      const positions = getSavedScrollPositions();
      positions[path] = scrollY;
      sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(positions));
    } catch (error) {
      console.error('[ScrollRestoration] Error saving scroll position:', error);
    }
  };

  // Restore scroll position if available
  const restoreScrollPosition = (path: string) => {
    try {
      const positions = getSavedScrollPositions();
      const savedPosition = positions[path];
      
      if (savedPosition !== undefined) {
        // Use timeout to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo(0, savedPosition);
        }, 0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[ScrollRestoration] Error restoring scroll position:', error);
      return false;
    }
  };

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Return early for hash links
    if (location.hash) {
      return;
    }

    if (navigationType === 'POP') {
      // Browser back/forward - restore position
      const restored = restoreScrollPosition(currentPath);
      if (!restored) {
        window.scrollTo(0, 0);
      }
    } else if (navigationType === 'PUSH') {
      // New navigation - scroll to top
      window.scrollTo(0, 0);
    }

    // Save position on unmount
    return () => {
      saveScrollPosition(currentPath);
    };
  }, [location, navigationType]);

  // Also save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition(location.pathname + location.search);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location]);

  return null; // This component doesn't render anything
}
