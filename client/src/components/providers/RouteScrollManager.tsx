import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * RouteScrollManager: one place that decides where the page is scrolled after navigation.
 *
 * - New navigation (link, button, sidebar): start at the top of the page. Reader pages
 *   included; previously they were skipped, so opening a story from the index kept the
 *   index's scroll position and the story opened partway down.
 * - Back / forward: return to where the visitor was on that page. The position is
 *   re-applied for a short while because stories load after the first render; the
 *   browser's own restoration ran too early and landed mid-page.
 * - Story-to-story moves inside the reader are left to the reader (it scrolls to the
 *   title itself), and in-page #anchors are left to the anchor handler.
 */
const positions = new Map<string, number>();

const RouteScrollManager: React.FC = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string | null>(null);
  const popPendingRef = useRef(false);

  useEffect(() => {
    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    } catch {}
    const onPop = () => {
      popPendingRef.current = true;
    };
    // Remember the position of the page being shown, so Back can return to it.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (prevLocationRef.current !== null) positions.set(prevLocationRef.current, window.scrollY);
      });
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Layout effect: runs before paint, so a new page never flashes at the old position.
  useLayoutEffect(() => {
    const prev = prevLocationRef.current;
    prevLocationRef.current = location;
    if (prev === null) return; // first render: the browser/initial load decides
    if (prev === location) return;

    const isPop = popPendingRef.current;
    popPendingRef.current = false;

    if (!isPop && window.location.hash) return;
    if (!isPop && prev.startsWith('/reader') && location.startsWith('/reader')) return;

    const target = isPop ? positions.get(location) ?? 0 : 0;
    window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior });

    if (target > 0) {
      // Content (stories, comments) arrives after the route renders; keep re-applying
      // the saved position until the page is tall enough, or the visitor scrolls.
      let tries = 0;
      let userMoved = false;
      const stop = () => {
        userMoved = true;
      };
      window.addEventListener('wheel', stop, { passive: true, once: true });
      window.addEventListener('touchmove', stop, { passive: true, once: true });
      const tick = () => {
        if (userMoved || tries++ > 20) return cleanup();
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: Math.min(target, Math.max(0, max)), behavior: 'instant' as ScrollBehavior });
        if (max >= target) return cleanup();
        timer = window.setTimeout(tick, 100);
      };
      let timer = window.setTimeout(tick, 50);
      const cleanup = () => {
        window.clearTimeout(timer);
        window.removeEventListener('wheel', stop);
        window.removeEventListener('touchmove', stop);
      };
      return cleanup;
    }

    // Accessibility: move focus to the new page's content without scrolling.
    requestAnimationFrame(() => {
      try {
        document.getElementById('main-content')?.focus({ preventScroll: true });
      } catch {}
    });
    return undefined;
  }, [location]);

  return null;
};

export default RouteScrollManager;
