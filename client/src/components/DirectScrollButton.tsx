import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A very simple scroll-to-top button that sits at the bottom right corner
 * with no fancy features - just guaranteed positioning
 */
const DirectScrollButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initially
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Styles to guarantee position
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    bottom: '24px',
    right: '24px', 
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    padding: 0
  };

  // This is a super simplified component with just the essentials
  return (
    <>
      {isVisible && (
        <button 
          onClick={scrollToTop} 
          style={buttonStyle}
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </>
  );
};

export default DirectScrollButton;