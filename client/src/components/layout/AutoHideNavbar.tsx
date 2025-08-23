import React, { useState, useEffect, useRef } from 'react';
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
  // Do not hide on any path by default
  hideOnPaths = [] 
}) => {
  const [currentPath, setCurrentPath] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden] = useState(false);
  const lastY = React.useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [navbarHeight, setNavbarHeight] = useState<number>(56);
  const [readingProgress, setReadingProgress] = useState(0);

  // Helper to update CSS variables for progress positioning
  const updateCssVars = (isHidden: boolean, heightPx: number) => {
    const root = document.documentElement;
    root.style.setProperty('--navbar-height', `${heightPx}px`);
    root.style.setProperty('--progress-top-offset', isHidden ? '0px' : `${heightPx}px`);
    root.toggleAttribute('data-nav-hidden', isHidden);
  };

  // Track scroll state only for styling (no auto-hide)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true } as any);
    return () => window.removeEventListener('scroll', handleScroll as any);
  }, []);

  // Measure navbar height and keep CSS variables in sync
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      const rect = el?.getBoundingClientRect();
      const height = Math.max(1, Math.round(rect?.height || 56));
      setNavbarHeight(height);
      updateCssVars(hidden, height);
    };
    measure();
    window.addEventListener('resize', measure, { passive: true } as any);
    return () => window.removeEventListener('resize', measure as any);
  }, [hidden]);

  // Keep CSS vars updated when hidden state changes
  useEffect(() => {
    updateCssVars(hidden, navbarHeight);
  }, [hidden, navbarHeight]);

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
    <div ref={containerRef} className={`navbar-container transition-transform duration-300 fixed top-0 left-0 right-0 z-40 w-full ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
      style={{ width: "100%", margin: 0, padding: 0 }}>
      <div className={`${isScrolled ? 'lg:bg-background/90 lg:backdrop-blur-md lg:shadow-md' : 'lg:bg-transparent'}`}>
        <Navigation />
      </div>
    </div>
  );
};

export default AutoHideNavbar;