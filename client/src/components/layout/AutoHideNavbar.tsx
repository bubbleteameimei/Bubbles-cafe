import React, { useState, useEffect } from 'react';
import Navigation from './navigation';

interface AutoHideNavbarProps {
  threshold?: number;
  hideOnPaths?: string[];
}

// We're removing the auto-hide behavior since we want the header to stay visible
// and scroll together with content
const AutoHideNavbar: React.FC<AutoHideNavbarProps> = ({
  hideOnPaths = []
}) => {
  const [currentPath, setCurrentPath] = useState('');

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

  // Return a regular navigation without animation
  return <Navigation />;
};

export default AutoHideNavbar;