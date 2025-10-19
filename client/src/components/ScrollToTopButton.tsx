import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScrollToTopButtonProps {
  position?: 'bottom-right' | 'bottom-left';
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const lastVisible = useRef(false);
  const ticking = useRef(false);
  const lastScrollEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const getScrollTop = (e?: Event) => {
      const tops: number[] = [];
      // Window/document scroll
      tops.push(window.pageYOffset || 0);
      if (document.documentElement) tops.push(document.documentElement.scrollTop || 0);
      if (document.body) tops.push(document.body.scrollTop || 0);

      // Main content container if scrollable
      const main = document.getElementById('main-content') as HTMLElement | null;
      if (main && main.scrollHeight > main.clientHeight) {
        tops.push(main.scrollTop || 0);
      }

      // Any scrollable target that fired the event (capture phase)
      if (e && e.target && e.target instanceof HTMLElement) {
        const t = e.target;
        if (t.scrollHeight > t.clientHeight) {
          tops.push(t.scrollTop || 0);
          lastScrollEl.current = t;
        }
      }

      return Math.max(...tops);
    };

    const handleScroll = (e?: Event) => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const visible = getScrollTop(e) > 300;

        if (visible !== lastVisible.current) {
          setIsVisible(visible);
          lastVisible.current = visible;
        }

        ticking.current = false;
      });
    };

    // Listen on window and capture scrolls from any scrollable element
    window.addEventListener('scroll', handleScroll as EventListener, { passive: true } as any);
    document.addEventListener('scroll', handleScroll as EventListener, { passive: true, capture: true } as any);

    handleScroll(); // initialize visibility

    return () => {
      window.removeEventListener('scroll', handleScroll as EventListener);
      // Must pass the same capture option for removal
      document.removeEventListener('scroll', handleScroll as EventListener, true as any);
    };
  }, []);

  const scrollToTop = () => {
    // Scroll the last scrolled element if available, else window
    const target = lastScrollEl.current || document.getElementById('main-content');
    if (target && target.scrollHeight > target.clientHeight) {
      try {
        target.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } catch {
        // fall back to immediate scroll
        target.scrollTop = 0;
        return;
      }
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const positionClasses =
    position === 'bottom-left' ? 'left-5 right-auto' : 'right-5 left-auto';

  // Avoid any DOM work when not needed
  if (!isVisible) return null;

  return (
    <Button
      variant="default"
      size="icon"
      onClick={scrollToTop}
      className={`fixed bottom-5 ${positionClasses} shadow-lg scroll-to-top opacity-100`}
      aria-label="Scroll to top"
      noOutline
    >
      <ArrowUp className="h-4 w-4" strokeWidth={1.75} />
      <span className="sr-only">Scroll to top</span>
    </Button>
  );
};

export default ScrollToTopButton;