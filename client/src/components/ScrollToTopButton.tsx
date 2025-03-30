import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  position?: 'bottom-right' | 'bottom-left';
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Set to false for normal scroll-based behavior
  const forceVisible = false;

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

  // Simple button styles without any complex class composition
  const buttonStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    bottom: '30px',
    ...(position === 'bottom-right' ? { right: '30px' } : { left: '30px' }),
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'white',
    color: '#333',
    border: '2px solid #eaeaea',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    transition: 'opacity 0.3s, transform 0.3s',
    opacity: (isVisible || forceVisible) ? 1 : 0,
    transform: (isVisible || forceVisible) ? 'scale(1)' : 'scale(0.8)',
    pointerEvents: (isVisible || forceVisible) ? 'auto' : 'none'
  };

  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: '#f5f5f5',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)'
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={scrollToTop}
      style={{
        ...buttonStyles,
        ...(isHovered ? buttonHoverStyle : {})
      }}
      aria-label="Scroll to top"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default ScrollToTopButton;