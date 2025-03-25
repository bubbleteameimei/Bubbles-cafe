import React, { useEffect, useState, useRef } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
}

// Simple character pool for glitching - ASCII only 
const GLITCH_CHARS = "!@#$%^&*()_+-={}|;:<>?";

export function CreepyTextGlitch({ text, className = "", intensityFactor = 1 }: CreepyTextGlitchProps) {
  const [displayText, setDisplayText] = useState(text);
  const [blurActive, setBlurActive] = useState(false);
  const originalText = useRef(text);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);
  
  // Cleanup function to clear all timeouts
  const clearAllTimeouts = () => {
    timeoutIds.current.forEach(id => clearTimeout(id));
    timeoutIds.current = [];
  };
  
  // Initialize and cleanup glitch effect
  useEffect(() => {
    originalText.current = text;
    setDisplayText(text);
    scheduleGlitches();
    
    return () => {
      clearAllTimeouts();
    };
  }, [text, intensityFactor]);
  
  // Schedule fast, unnerving glitches
  const scheduleGlitches = () => {
    clearAllTimeouts();
    
    // Multiple character glitch for intense effect
    const glitchMultipleChars = () => {
      // Convert text to array for character manipulation
      const chars = originalText.current.split('');
      const newChars = [...chars];
      
      // Number of characters to glitch (more with higher intensity)
      const glitchCount = Math.max(1, Math.floor(chars.length * 0.3 * intensityFactor));
      
      // Randomly replace characters
      for (let i = 0; i < glitchCount; i++) {
        const pos = Math.floor(Math.random() * chars.length);
        if (chars[pos] !== ' ') { // Skip spaces
          newChars[pos] = GLITCH_CHARS.charAt(
            Math.floor(Math.random() * GLITCH_CHARS.length)
          );
        }
      }
      
      // Apply text with glitched characters
      setDisplayText(newChars.join(''));
      
      // Occasionally add blur effect for more intensity
      if (Math.random() > 0.7) {
        setBlurActive(true);
        setTimeout(() => setBlurActive(false), 50 + Math.random() * 50);
      }
      
      // Revert quickly for fast flickering effect
      const revertTime = Math.max(20, 40 - intensityFactor * 5);
      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
      }, revertTime);
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Schedule very rapid glitches
    const scheduleNext = () => {
      // Very short delay between glitches (faster with higher intensity)
      const baseDelay = Math.max(30, 80 - (intensityFactor * 10));
      const nextGlitchDelay = baseDelay + Math.random() * 50;
      
      const timeout = setTimeout(() => {
        glitchMultipleChars();
        scheduleNext();
      }, nextGlitchDelay);
      
      timeoutIds.current.push(timeout);
    };
    
    // Start the cycle
    scheduleNext();
  };
  
  // Generate appropriate blur based on whether the effect is active
  const getBlurStyle = () => {
    if (blurActive) {
      const blurAmount = 1 + Math.random() * 2;
      return `blur(${blurAmount}px)`;
    }
    return 'none';
  };
  
  return (
    <span 
      className={`glitch-text ${className}`} 
      style={{
        position: 'relative',
        display: 'inline-block',
        color: '#ff0000',
        fontFamily: "'Arial', sans-serif",
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        filter: getBlurStyle(),
        transition: 'filter 0.05s ease',
      }}
    >
      {displayText}
    </span>
  );
}

export default CreepyTextGlitch;