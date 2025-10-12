import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScrollToTopButtonProps {
  position?: 'bottom-right' | 'bottom-left';
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const positionClasses =
    position === 'bottom-left' ? 'left-5 right-auto' : 'right-5 left-auto';
  const visibilityClasses = isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none';

  return (
    <Button
      variant="default"
      size="icon"
      onClick={scrollToTop}
      className={`fixed bottom-5 ${positionClasses} ${visibilityClasses} z-50 shadow-lg scroll-to-top`}
      aria-label="Scroll to top"
      noOutline
    >
      <ArrowUp className="h-4 w-4" strokeWidth={1.75} />
      <span className="sr-only">Scroll to top</span>
    </Button>
  );
};

export default ScrollToTopButton;