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
    bottom: '25px',
    right: position === 'bottom-right' ? '25px' : 'auto',
    left: position === 'bottom-left' ? '25px' : 'auto',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #e0e0e0',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    opacity: (isVisible || forceVisible) ? 1 : 0,
    transform: (isVisible || forceVisible) ? 'scale(1)' : 'scale(0.7)',
    pointerEvents: (isVisible || forceVisible) ? 'auto' : 'none'
  };

  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: '#fafafa',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-1px)'
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
      <ArrowUp size={18} />
    </button>
  );
};

export default ScrollToTopButton;