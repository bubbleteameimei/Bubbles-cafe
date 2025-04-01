import React, { useState, useEffect } from 'react';
import Navigation from './navigation';

interface AutoHideNavbarProps {
  threshold?: number;
}

/**
 * AutoHideNavbar component - optimized for tablet, desktop, and laptop layouts
 * 
 * This component handles:
 * 1. Device-specific layout adjustments
 * 2. Navigation visibility based on scroll position
 */
const AutoHideNavbar: React.FC<AutoHideNavbarProps> = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position for desktop and laptop enhancements
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Initial check
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Return navigation with responsive class for device optimization
  return (
    <div className={`navbar-container transition-all duration-300 fixed top-0 left-0 right-0 z-40 ${
      isScrolled ? 'lg:bg-background/90 lg:backdrop-blur-md lg:shadow-md' : 'lg:bg-transparent'
    }`}>
      <Navigation />
    </div>
  );
};

export default AutoHideNavbar;