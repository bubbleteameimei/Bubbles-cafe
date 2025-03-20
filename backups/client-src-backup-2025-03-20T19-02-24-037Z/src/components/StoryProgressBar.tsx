import React, { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

interface StoryProgressBarProps {
  className?: string;
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

const StoryProgressBar: React.FC<StoryProgressBarProps> = ({
  className = "",
  color = "",
  height = 4,
  showPercentage = false
}) => {
  const [progress, setProgress] = useState(0);
  
  // Use spring animation for smoother progress changes
  const smoothProgress = useSpring(progress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001
  });

  useEffect(() => {
    const updateProgress = () => {
      // Calculate how far down the page the user has scrolled
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      
      // Convert to percentage and limit between 0-100
      const calculatedProgress = Math.min(Math.max(scrollPercent * 100, 0), 100);
      setProgress(calculatedProgress);
      
      // Optionally save reading progress (for longer stories)
      if (calculatedProgress > 5) {
        // Save progress only if we've scrolled a bit (to avoid saving just opening the page)
        const path = window.location.pathname;
        if (path.includes('/reader/')) {
          const slug = path.split('/reader/')[1];
          localStorage.setItem(`readingProgress_${slug}`, calculatedProgress.toString());
        }
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", updateProgress);
    
    // Initial calculation
    updateProgress();
    
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <>
      <motion.div
        className={`fixed bottom-0 left-0 ${color || "bg-accent"} z-50 ${className}`}
        style={{
          height: `${height}px`,
          width: smoothProgress,
          scaleX: 1,
          transformOrigin: "left",
        }}
      />
      
      {showPercentage && progress > 5 && (
        <div className="fixed bottom-4 right-4 bg-background border border-border rounded-md px-2 py-1 text-xs shadow-md z-50">
          {Math.round(progress)}% read
        </div>
      )}
    </>
  );
};

export default StoryProgressBar;