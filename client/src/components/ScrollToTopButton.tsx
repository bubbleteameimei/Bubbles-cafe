import React, { useEffect, useState } from 'react';
import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  position?: 'bottom-right' | 'bottom-left';
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ position = 'bottom-right' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const positionClasses = position === 'bottom-left' ? 'left-5 right-auto' : 'right-5 left-auto';
  const visibilityClasses = isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none';

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-to-top ${positionClasses} ${visibilityClasses}`}
      aria-label="Scroll to top"
      type="button"
    >
      <ArrowUp size={18} aria-hidden="true" />
      <span className="sr-only">Scroll to top</span>
    </button>
  );
};

export default ScrollToTopButton;
