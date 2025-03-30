import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlobalScrollButtonProps {
  threshold?: number;
  showLabel?: boolean;
}

/**
 * A global scroll-to-top button that attaches directly to the document body
 * to ensure it always appears in the correct position.
 */
const GlobalScrollButton: React.FC<GlobalScrollButtonProps> = ({
  threshold = 300,
  showLabel = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  // Create and mount the button container
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Check if we already have a button in the DOM
    let container = document.getElementById('global-scroll-button-container');
    if (!container) {
      // If not, create a new button container
      container = document.createElement('div');
      container.id = 'global-scroll-button-container';
      container.style.position = 'fixed';
      container.style.bottom = '24px';
      container.style.right = '24px';
      container.style.left = 'auto';
      container.style.zIndex = '9999';
      container.style.pointerEvents = 'auto';
      container.style.display = 'block';
      
      // Append to body
      document.body.appendChild(container);
    }
    
    setPortalRoot(container);
    
    // Clean up on unmount
    return () => {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // Scroll handler
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initially
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Don't render anything if we're on the server or if the portal root isn't ready
  if (!portalRoot) return null;

  // Use React Portal to render our button into the dedicated container
  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: 'auto',
            height: 'auto',
            margin: '0',
            padding: '0'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={scrollToTop}
            variant="outline"
            aria-label="Scroll to top"
            style={{
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <ArrowUp size={24} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot
  );
};

export default GlobalScrollButton;