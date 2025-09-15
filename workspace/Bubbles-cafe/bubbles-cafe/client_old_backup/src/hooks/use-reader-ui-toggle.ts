import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for toggling UI visibility in reader page with a single click/tap
 * Returns state and handlers for managing reader UI visibility
 */
const useReaderUIToggle = () => {
  // State to track if UI elements should be hidden
  const [isUIHidden, setIsUIHidden] = useState(false);
  
  // State to track if the tooltip should be shown
  const [showTooltip, setShowTooltip] = useState(true);
  
  // Function to toggle UI visibility
  const toggleUI = useCallback(() => {
    setIsUIHidden(prevState => !prevState);
    
    // Add a small vibration on mobile devices for tactile feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10); // Very subtle 10ms vibration
    }
    
    // Hide the tooltip permanently once user has interacted
    if (showTooltip) {
      setShowTooltip(false);
      // Also store in localStorage that the user has seen the tooltip
      localStorage.setItem('reader_tooltip_seen', 'true');
    }
  }, [showTooltip]);
  
  // Effect to check if user has seen the tooltip before
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('reader_tooltip_seen') === 'true';
    if (hasSeenTooltip) {
      setShowTooltip(false);
    } else {
      // Auto-hide tooltip after 5 seconds even if not clicked (reduced from 10s)
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      
      return () => clearTimeout(tooltipTimer);
    }
  }, []);
  
  // Effect to allow ESC key to exit distraction-free mode
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUIHidden) {
        setIsUIHidden(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isUIHidden]);
  
  return { 
    isUIHidden, 
    toggleUI, 
    showTooltip 
  };
};

export default useReaderUIToggle;