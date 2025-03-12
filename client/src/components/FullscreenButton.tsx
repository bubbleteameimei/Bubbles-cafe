import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface FullscreenButtonProps {
  containerSelector?: string;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'default' | 'sm' | 'lg';
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  containerSelector,
  className = '',
  position = 'top-right',
  size = 'default',
  onEnterFullscreen,
  onExitFullscreen
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  // Size classes
  const sizeMap = {
    default: 'h-5 w-5',
    sm: 'h-4 w-4',
    lg: 'h-6 w-6'
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        // If not in fullscreen mode, enter fullscreen
        const element = containerSelector 
          ? document.querySelector(containerSelector) 
          : document.documentElement;
        
        if (element && element.requestFullscreen) {
          // Standard fullscreen API
          element.requestFullscreen()
            .then(() => {
              setIsFullscreen(true);
              onEnterFullscreen?.();
            })
            .catch(err => {
              console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else if (element) {
          // Try vendor-specific methods
          const requestMethod = element.requestFullscreen || 
            (element as any).mozRequestFullScreen ||
            (element as any).webkitRequestFullscreen || 
            (element as any).msRequestFullscreen;
          
          if (requestMethod) {
            requestMethod.call(element);
            setIsFullscreen(true);
            onEnterFullscreen?.();
          } else {
            console.warn('Fullscreen API is not supported in this environment');
          }
        }
      } else {
        // If in fullscreen mode, exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen()
            .then(() => {
              setIsFullscreen(false);
              onExitFullscreen?.();
            })
            .catch(err => {
              console.error(`Error attempting to exit fullscreen: ${err.message}`);
            });
        } else {
          // Try vendor-specific methods
          const exitMethod = document.exitFullscreen || 
            (document as any).mozCancelFullScreen ||
            (document as any).webkitExitFullscreen || 
            (document as any).msExitFullscreen;
          
          if (exitMethod) {
            exitMethod.call(document);
            setIsFullscreen(false);
            onExitFullscreen?.();
          }
        }
      }
    } catch (error) {
      console.warn('Fullscreen toggle failed:', error);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-40 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.1 }}
    >
      <Button
        onClick={toggleFullscreen}
        variant="secondary"
        size="icon"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        className="bg-background/80 backdrop-blur-sm shadow-md"
      >
        {isFullscreen ? (
          <Minimize className={sizeMap[size]} />
        ) : (
          <Maximize className={sizeMap[size]} />
        )}
      </Button>
    </motion.div>
  );
};

export default FullscreenButton;