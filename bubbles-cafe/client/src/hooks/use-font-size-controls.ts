
import { useState, useEffect } from 'react';

export function useFontSizeControls() {
  const [showControls, setShowControls] = useState(false);
  const [fadeTimeout, setFadeTimeout] = useState<NodeJS.Timeout | null>(null);

  // Auto-hide controls after period of inactivity
  useEffect(() => {
    if (showControls && fadeTimeout === null) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide after 3 seconds of inactivity
      
      setFadeTimeout(timeout);
    }
    
    return () => {
      if (fadeTimeout) {
        clearTimeout(fadeTimeout);
      }
    };
  }, [showControls, fadeTimeout]);
  
  // Reset fade timeout when controls are toggled
  const toggleControls = () => {
    if (fadeTimeout) {
      clearTimeout(fadeTimeout);
      setFadeTimeout(null);
    }
    setShowControls(prev => !prev);
  };

  return {
    showControls,
    setShowControls,
    toggleControls
  };
}
