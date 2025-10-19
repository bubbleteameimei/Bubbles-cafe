import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp } from 'lucide-react';

type ScrollContainer = 'window' | 'main';

const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [container, setContainer] = useState<ScrollContainer>('window');
  const lastScrollEl = useRef<HTMLElement | null>(null);
  const ticking = useRef(false);
  const containerListeners = useRef<Set<HTMLElement>>(new Set());

  const getScrollableCandidates = () => {
    const candidates = new Set<HTMLElement>();
    const main = document.getElementById('main-content');
    if (main) candidates.add(main);

    // Common patterns used across the app
    document.querySelectorAll<HTMLElement>([
      '.overflow-y-auto',
      '.scroll-area',
      '[data-scrollable="true"]',
      '[data-scroll-container="true"]',
      '[class*="scroll"]',
    ].join(','))?.forEach(el => {
      // Heuristic: consider only elements that can actually scroll
      const styles = getComputedStyle(el);
      const canScrollY =
        (styles.overflowY === 'auto' || styles.overflowY === 'scroll' || el.className.includes('overflow-y')) &&
        el.scrollHeight > el.clientHeight + 8;
      if (canScrollY) candidates.add(el);
    });

    return candidates;
  };

  const computeTop = (e?: Event) => {
    const tops: number[] = [];

    // window/document
    tops.push(window.pageYOffset || 0);
    if (document.documentElement) tops.push(document.documentElement.scrollTop || 0);
    if (document.body) tops.push(document.body.scrollTop || 0);

    // known containers
    containerListeners.current.forEach(el => {
      if (el.scrollHeight > el.clientHeight) {
        tops.push(el.scrollTop || 0);
      }
    });

    // event target if scrollable
    if (e && e.target && e.target instanceof HTMLElement) {
      const t = e.target;
      if (t.scrollHeight > t.clientHeight) {
        tops.push(t.scrollTop || 0);
        lastScrollEl.current = t;
      }
    }

    return Math.max(...tops);
  };

  useEffect(() => {
    const main = document.getElementById('main-content');
    const usesMain =
      !!main && main.scrollHeight - main.clientHeight > 8; // significant overflow

    setContainer(usesMain ? 'main' : 'window');

    const onScroll = (e?: Event) => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const top = computeTop(e);
        setVisible(top > 300);
        ticking.current = false;
      });
    };

    // Heuristic update based on content height in case we miss scroll events
    const heuristicUpdate = () => {
      const maxDoc = Math.max(
        document.documentElement?.scrollHeight || 0,
        document.body?.scrollHeight || 0
      );
      const diff = maxDoc - window.innerHeight;
      if (diff > 1500) {
        // If page is very long, show control even before the first scroll event
        setVisible(prev => prev || true);
      }
    };

    // Always listen to window/document
    window.addEventListener('scroll', onScroll as EventListener, { passive: true } as any);
    window.addEventListener('resize', heuristicUpdate, { passive: true } as any);
    if (main) main.addEventListener('scroll', onScroll as EventListener, { passive: true } as any);

    // Attach to candidate scrollable containers
    const attachToCandidates = () => {
      const candidates = getScrollableCandidates();
      candidates.forEach(el => {
        if (!containerListeners.current.has(el)) {
          el.addEventListener('scroll', onScroll as EventListener, { passive: true } as any);
          containerListeners.current.add(el);
        }
      });
      // Remove listeners from elements no longer in DOM or no longer scrollable
      containerListeners.current.forEach(el => {
        if (!document.body.contains(el) || el.scrollHeight <= el.clientHeight) {
          el.removeEventListener('scroll', onScroll as EventListener);
          containerListeners.current.delete(el);
        }
      });
    };

    attachToCandidates();

    // Re-scan periodically to catch route/content changes
    const interval = window.setInterval(attachToCandidates, 1500);

    // Initialize state
    onScroll();
    heuristicUpdate();

    return () => {
      window.removeEventListener('scroll', onScroll as EventListener);
      window.removeEventListener('resize', heuristicUpdate as EventListener);
      if (main) main.removeEventListener('scroll', onScroll as EventListener);
      containerListeners.current.forEach(el => {
        el.removeEventListener('scroll', onScroll as EventListener);
      });
      containerListeners.current.clear();
      clearInterval(interval);
    };
  }, []);

  const handleClick = () => {
    const main = document.getElementById('main-content');
    const target =
      (lastScrollEl.current && lastScrollEl.current.scrollHeight > lastScrollEl.current.clientHeight && lastScrollEl.current) ||
      (main && main.scrollHeight > main.clientHeight ? main : null);

    if (target) {
      try {
        target.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        target.scrollTop = 0;
      }
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const baseClasses =
    'fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[2147483647] flex items-center justify-center rounded-full ' + // max practical z-index
    'h-12 w-12 md:h-14 md:w-14 bg-primary text-primary-foreground shadow-xl ' +
    'ring-2 ring-primary/30 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
    'transition-transform transition-opacity duration-300 ease-out will-change-transform';

  const stateClasses = visible
    ? 'opacity-100 translate-y-0 pointer-events-auto'
    : 'opacity-0 translate-y-2 pointer-events-none';

  const button = (
    <button
      type="button"
      aria-label="Scroll to top"
      title="Scroll to top"
      className={`${baseClasses} ${stateClasses}`}
      onClick={handleClick}
    >
      <ArrowUp className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
      <span className="sr-only">Back to top</span>
    </button>
  );

  // Render into body to escape any overflow/transform stacking contexts
  return typeof document !== 'undefined' ? createPortal(button, document.body) : button;
};

export default BackToTopButton;