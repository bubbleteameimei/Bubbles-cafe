import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  position?: 'bottom-right' | 'bottom-left';
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Removed forceVisible; visibility is based on scroll position

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Check visibility on mount
    handleScroll();
    
    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Use Tailwind CSS classes via .scroll-to-top; toggle position and visibility via classes
  const positionClasses = position === 'bottom-left' ? 'left-5 right-auto' : 'right-5 left-auto';
  const visibilityClasses = isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none';

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-to-top ${positionClasses} ${visibilityClasses}`}
      aria-label="Scroll to top"
    >
      <ArrowUp size={18} />
    </button>
  );
};

export default ScrollToTopButton;