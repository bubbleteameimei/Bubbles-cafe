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

  // On route changes, reset scroll unless it was a popstate or a hash navigation
  useEffect(() => {
    try {
      const hasHash = typeof window !== 'undefined' ? !!window.location.hash : false;
      if (hasHash) return;

      // Preserve position on back/forward navigations
      const recentlyPop = Date.now() - lastPopTsRef.current < 200;
      if (recentlyPop) return;

      const isOverlayActive = () => {
        try {
          const htmlHas = document.documentElement.classList.contains('overlay-active');
          const bodyHas = document.body.classList.contains('overlay-active');
          const htmlOverflow = getComputedStyle(document.documentElement).overflow;
          const bodyOverflow = getComputedStyle(document.body).overflow;
          return htmlHas || bodyHas || htmlOverflow.includes('hidden') || bodyOverflow.includes('hidden');
        } catch {
          return false;
        }
      };

      const resetAll = () => {
        // Window
        try {
          window.scrollTo({ top: 0, behavior: 'auto' });
        } catch {}

        // Main landmark and common containers
        const main = document.getElementById('main-content');
        if (main) {
          try {
            (main as any).scrollTo?.({ top: 0, behavior: 'auto' });
          } catch {
            (main as any).scrollTop = 0;
          }
        }

        // Known scrollable containers
        try {
          const selectors = [
            '.overflow-y-auto',
            '.scroll-area',
            '[data-scroll-container="true"]',
            '[data-scrollable="true"]',
          ].join(',');
          const candidates = Array.from(document.querySelectorAll<HTMLElement>(selectors));
          for (const el of candidates) {
            try {
              el.scrollTo?.({ top: 0, behavior: 'auto' });
            } catch {
              el.scrollTop = 0;
            }
          }
        } catch {}

        // Accessibility: focus main content landmark
        if (main && typeof (main as any).focus === 'function') {
          try {
            (main as any).focus({ preventScroll: true });
          } catch {}
        }
      };

      const runReset = () => {
        if (isOverlayActive()) {
          // Wait briefly for overlay to release scroll-lock, then reset
          let tries = 0;
          const it = setInterval(() => {
            tries += 1;
            if (!isOverlayActive() || tries > 10) {
              clearInterval(it);
              requestAnimationFrame(() => {
                resetAll();
                // Double RAF to avoid races with late layout writes
                requestAnimationFrame(resetAll);
              });
            }
          }, 100);
        } else {
          requestAnimationFrame(() => {
            resetAll();
            requestAnimationFrame(resetAll);
          });
        }
      };

      runReset();
    } catch {}
  }, [location]);

  return null;
};

export default RouteScrollManager;