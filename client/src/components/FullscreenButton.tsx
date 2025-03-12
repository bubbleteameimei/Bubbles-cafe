import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface FullscreenButtonProps {
  className?: string;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ className = '' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return (
    <motion.div
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      <Button
        onClick={toggleFullscreen}
        variant="outline"
        size="icon"
        className="rounded-full bg-background/80 backdrop-blur shadow-md"
        aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      >
        {isFullscreen ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </Button>
    </motion.div>
  );
};

export default FullscreenButton;