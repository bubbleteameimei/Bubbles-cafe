import React, { useState, useEffect } from 'react';
import Navigation from './navigation';

interface AutoHideNavbarProps {
  threshold?: number;
  hideOnPaths?: string[];
}

/**
 * AutoHideNavbar component - optimized for tablet, desktop, and laptop layouts
 * 
 * This component handles:
 * 1. Path-based conditional rendering of navigation
 * 2. Device-specific layout adjustments
 * 3. Navigation visibility based on page context
 */
const AutoHideNavbar: React.FC<AutoHideNavbarProps> = ({
  // Modified to show navigation on reader pages
  hideOnPaths = ['/community-story/*'] 
}) => {
  const [currentPath, setCurrentPath] = useState('');
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

  useEffect(() => {
    // Update current path when component mounts
    setCurrentPath(window.location.pathname);

    // Listen for pathname changes
    const handlePathnameChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePathnameChange);
    
    return () => {
      window.removeEventListener('popstate', handlePathnameChange);
    };
  }, []);

  // Check if current path is in the hideOnPaths array
  const shouldHideOnCurrentPath = hideOnPaths.some(path => 
    currentPath === path || 
    (path.endsWith('*') && currentPath.startsWith(path.slice(0, -1)))
  );

  // Don't render anything if we should completely hide on this path
  if (shouldHideOnCurrentPath) {
    return null;
  }

  // Return navigation with responsive class for device optimization
  return (
    <div className={`navbar-container transition-all duration-300 fixed top-0 left-0 right-0 z-40 flex justify-center ${
      isScrolled ? 'lg:bg-background/90 lg:backdrop-blur-md lg:shadow-md' : 'lg:bg-transparent'
    }`}>
      <Navigation />
    </div>
  );
};

export default AutoHideNavbar;