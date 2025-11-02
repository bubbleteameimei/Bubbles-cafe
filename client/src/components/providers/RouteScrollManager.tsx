import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * RouteScrollManager
 * Centrally manages scroll restoration on route changes:
 * - Resets to top on "push" navigations (programmatic or link clicks)
 * - Preserves scroll on browser back/forward (popstate)
 * - Respects in-page anchors (hash in URL), letting anchor logic handle scrolling
 * - Shifts focus to #main-content for accessibility after navigation
 */
const RouteScrollManager: React.FC = () => {
  const [location] = useLocation();
  const lastPopTsRef = useRef<number>(0);

  // Track browser back/forward navigations via popstate
  useEffect(() => {
    const onPop = () => {
      lastPopTsRef.current = Date.now();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // On route changes, reset scroll unless it was a popstate, a hash navigation, or the reader route
  useEffect(() => {
    try {
      const hasHash = typeof window !== 'undefined' ? !!window.location.hash : false;
      if (hasHash) return;

      // Preserve position on back/forward navigations
      const recentlyPop = Date.now() - lastPopTsRef.current < 200;
      if (recentlyPop) return;

      // Skip auto-resets on reader pages to avoid perceptible jank during story switches.
      const path = (typeof location === 'string' && location) ? location : (typeof window !== 'undefined' ? window.location.pathname : '');
      if (String(path).startsWith('/reader')) {
        return;
      }

      requestAnimationFrame(() => {
        try {
          window.scrollTo({ top: 0, behavior: 'auto' });
        } catch {}

        // Accessibility: focus main content landmark
        const main = document.getElementById('main-content');
        if (main && typeof (main as any).focus === 'function') {
          try {
            (main as any).focus({ preventScroll: true });
          } catch {}
        }
      });
    } catch {}
  }, [location]);

  return null;
};

export default RouteScrollManager;