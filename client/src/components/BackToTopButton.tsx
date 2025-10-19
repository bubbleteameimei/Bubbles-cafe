import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

type ScrollContainer = 'window' | 'main';

const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [container, setContainer] = useState<ScrollContainer>('window');
  const lastScrollEl = useRef<HTMLElement | null>(null);
  const ticking = useRef(false);

  // Detect primary scroll container and listen broadly for scrolls
  useEffect(() => {
    const main = document.getElementById('main-content');
    const usesMain =
      !!main && main.scrollHeight - main.clientHeight > 8; // significant overflow

    setContainer(usesMain ? 'main' : 'window');

    const computeTop = (e?: Event) => {
      const tops: number[] = [];

      // window/document
      tops.push(window.pageYOffset || 0);
      if (document.documentElement) tops.push(document.documentElement.scrollTop || 0);
      if (document.body) tops.push(document.body.scrollTop || 0);

      // main content
      if (main && main.scrollHeight > main.clientHeight) {
        tops.push(main.scrollTop || 0);
      }

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

    const onScroll = (e?: Event) => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const top = computeTop(e);
        setVisible(top > 300);
        ticking.current = false;
      });
    };

    // Broad listeners to catch nested scroll containers
    window.addEventListener('scroll', onScroll as EventListener, { passive: true } as any);
    document.addEventListener('scroll', onScroll as EventListener, { passive: true, capture: true } as any);
    if (main) main.addEventListener('scroll', onScroll as EventListener, { passive: true } as any);

    // Initialize state
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll as EventListener);
      document.removeEventListener('scroll', onScroll as EventListener, true as any);
      if (main) main.removeEventListener('scroll', onScroll as EventListener);
    };
  }, []);

  const handleClick = () => {
    const main = document.getElementById('main-content');
    const target = lastScrollEl.current && lastScrollEl.current.scrollHeight > lastScrollEl.current.clientHeight
      ? lastScrollEl.current
      : (main && main.scrollHeight > main.clientHeight ? main : null);

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
    'fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100000] flex items-center justify-center rounded-full ' +
    'h-12 w-12 md:h-14 md:w-14 bg-primary text-primary-foreground shadow-xl ' +
    'ring-2 ring-primary/30 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
    'transition-transform transition-opacity duration-300 ease-out will-change-transform';

  const stateClasses = visible
    ? 'opacity-100 translate-y-0 pointer-events-auto'
    : 'opacity-0 translate-y-2 pointer-events-none';

  return (
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
};

export default BackToTopButton;