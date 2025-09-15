import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';
import './floating-navigation.css';

interface FloatingNavigationProps {
  currentIndex: number;
  totalStories: number;
  onPrevious: () => void;
  onNext: () => void;
  onRandom: () => void;
}

export const FloatingNavigation = ({
  currentIndex,
  totalStories,
  onPrevious,
  onNext,
  onRandom
}: FloatingNavigationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationClass, setAnimationClass] = useState('floating-navigation-enter');
  
  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    
    // Function to handle visibility
    const showNavigation = () => {
      if (!isVisible) {
        setIsVisible(true);
        setAnimationClass('floating-navigation-enter');
      }
      
      // Clear any existing timers
      clearTimeout(hideTimer);
      
      // Set timer to hide after inactivity
      hideTimer = setTimeout(() => {
        setAnimationClass('floating-navigation-exit');
        setTimeout(() => setIsVisible(false), 500); // Match animation duration
      }, 5000);
    };
    
    // Show initially
    showNavigation();
    
    // Show on scroll
    window.addEventListener('scroll', showNavigation);
    
    // Show on mouse movement
    window.addEventListener('mousemove', showNavigation);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', showNavigation);
      window.removeEventListener('mousemove', showNavigation);
      clearTimeout(hideTimer);
    };
  }, [isVisible]);
  
  // Only render if we have stories
  if (totalStories <= 0) {
    return null;
  }
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`floating-navigation ${animationClass}`}>
      <div className="floating-navigation-inner">
        {/* Story counter */}
        <div className="nav-info">
          <span className="nav-progress">
            {currentIndex + 1} / {totalStories}
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="nav-buttons">
          <button
            className={`nav-button ${currentIndex === 0 ? 'disabled' : ''}`}
            onClick={onPrevious}
            disabled={currentIndex === 0}
            aria-label="Previous story"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button 
            className="nav-button random-button" 
            onClick={onRandom}
            aria-label="Random story"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span className="sr-only">Random story</span>
          </button>

          <button
            className={`nav-button ${currentIndex === totalStories - 1 ? 'disabled' : ''}`}
            onClick={onNext}
            disabled={currentIndex === totalStories - 1}
            aria-label="Next story"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};