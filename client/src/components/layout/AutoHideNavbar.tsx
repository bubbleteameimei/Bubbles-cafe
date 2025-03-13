import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './navigation';

interface AutoHideNavbarProps {
  threshold?: number;
  hideOnPaths?: string[];
}

const AutoHideNavbar: React.FC<AutoHideNavbarProps> = ({
  threshold = 100,
  hideOnPaths = []
}) => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Update current path when component mounts
    setCurrentPath(window.location.pathname);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show navbar at the top of the page
      if (currentScrollY < threshold) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY + 10) {
        // Hide navbar when scrolling down (with a small buffer)
        setVisible(false);
      } else if (currentScrollY < lastScrollY - 10) {
        // Show navbar when scrolling up (with a small buffer)
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Listen for pathname changes
    const handlePathnameChange = () => {
      setCurrentPath(window.location.pathname);
      // Show navbar on page change
      setVisible(true);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', handlePathnameChange);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePathnameChange);
    };
  }, [lastScrollY, threshold]);

  // Check if current path is in the hideOnPaths array
  const shouldHideOnCurrentPath = hideOnPaths.some(path => 
    currentPath === path || 
    (path.endsWith('*') && currentPath.startsWith(path.slice(0, -1)))
  );

  // Don't render anything if we should completely hide on this path
  if (shouldHideOnCurrentPath) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <Navigation />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AutoHideNavbar;