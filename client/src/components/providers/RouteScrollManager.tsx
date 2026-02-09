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

  // On route changes, reset scroll unless it was a popstate, a hash navigation,
  // or a reader route (reader manages its own scroll behaviour).
  useEffect(() => {
    try {
      const path = location || '';

      // Skip when navigating within the Reader; avoid extra scroll jumps there
      if (path.startsWith('/reader')) return;

      // Skip when navigating to an in-page anchor; handled by initSmoothScroll
      const hasHash = typeof window !== 'undefined' ? !!window.location.hash : false;
      if (hasHash) return;

      // Preserve position on back/forward navigations
      const recentlyPop = Date.now() - lastPopTsRef.current < 200;
      if (recentlyPop) return;

      // Defer to next frame to avoid competing with layout updates
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