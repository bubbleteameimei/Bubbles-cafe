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

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const visible = scrollTop > 300;

        if (visible !== lastVisible.current) {
          setIsVisible(visible);
          lastVisible.current = visible;
        }

        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initialize visibility

    return () => window.removeEventListener('scroll', handleScroll as EventListener);
  }, []);

  const scrollToTop = () => {
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
      className={`fixed bottom-5 ${positionClasses} z-50 shadow-lg scroll-to-top opacity-100`}
      aria-label="Scroll to top"
      noOutline
    >
      <ArrowUp className="h-4 w-4" strokeWidth={1.75} />
      <span className="sr-only">Scroll to top</span>
    </Button>
  );
};

export default ScrollToTopButton;