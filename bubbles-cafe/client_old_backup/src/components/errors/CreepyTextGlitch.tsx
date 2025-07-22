import React, { useEffect, useState, useRef } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
}

// Extended character pool for glitching - more unsettling symbols
const GLITCH_CHARS = "!@#$%^&*()_+-={}|[]\\:\"<>?/.,;'~`";

// Website's header fonts
const HEADER_FONTS = [
  "'Castoro Titling', serif", 
  "'Gilda Display', serif", 
  "'Newsreader', serif", 
  "'Cormorant Garamond', serif"
];

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
    scheduleRandomGlitches();
    
    return () => {
      clearAllTimeouts();
    };
  }, [text, intensityFactor]);
  
  // Schedule random, chaotic glitches
  const scheduleRandomGlitches = () => {
    clearAllTimeouts();
    
    // Completely random character replacement for chaotic effect
    const randomGlitchEffect = () => {
      // Convert text to array for character manipulation
      const chars = originalText.current.split('');
      const newChars = [...chars];
      
      // Each character has a random chance of being glitched
      for (let i = 0; i < chars.length; i++) {
        // Skip spaces
        if (chars[i] === ' ') continue;
        
        // Random chance to glitch each character - higher with more intensity
        if (Math.random() < 0.3 * intensityFactor) {
          // Replace with a random glitch character
          newChars[i] = GLITCH_CHARS.charAt(
            Math.floor(Math.random() * GLITCH_CHARS.length)
          );
        }
      }
      
      // Apply text with randomized glitched characters
      setDisplayText(newChars.join(''));
      
      // Random blur effect - more frequent and intense with higher intensity
      if (Math.random() > 0.6 - (intensityFactor * 0.1)) {
        setBlurActive(true);
        const blurDuration = 30 + Math.random() * 100;
        setTimeout(() => setBlurActive(false), blurDuration);
      }
      
      // Revert to original text after a random time
      const revertTime = 10 + Math.random() * 80; // Very random timing for unpredictability
      const revertTimeout = setTimeout(() => {
        // Small chance to not revert, creating sustained glitches
        if (Math.random() > 0.1) {
          setDisplayText(originalText.current);
        }
      }, revertTime);
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Schedule next glitch with highly variable timing
    const scheduleNext = () => {
      // Completely random timing between glitches for unpredictable effect
      const minDelay = Math.max(10, 40 - (intensityFactor * 15));
      const maxVariance = 100 - (intensityFactor * 20);
      const nextGlitchDelay = minDelay + Math.random() * maxVariance;
      
      const timeout = setTimeout(() => {
        randomGlitchEffect();
        scheduleNext();
      }, nextGlitchDelay);
      
      timeoutIds.current.push(timeout);
    };
    
    // Start the chaotic cycle
    scheduleNext();
  };
  
  // Generate randomized blur effect
  const getBlurStyle = () => {
    if (blurActive) {
      const blurAmount = 0.5 + Math.random() * 3.5;
      return `blur(${blurAmount}px)`;
    }
    return 'none';
  };
  
  // Choose a random header font from the website's fonts
  const getRandomHeaderFont = () => {
    // Default to first font if something goes wrong
    if (!HEADER_FONTS.length) return "'Castoro Titling', serif";
    
    // Randomly select one of the website's header fonts
    const randomIndex = Math.floor(Math.random() * HEADER_FONTS.length);
    return HEADER_FONTS[randomIndex];
  };
  
  return (
    <span 
      className={`pure-red-text ${className}`} // Added pure-red-text class for targeted styling
      style={{
        position: 'relative',
        display: 'inline-block',
        color: '#ff0000', // Pure red, no RGB mixing
        fontFamily: getRandomHeaderFont(),
        fontWeight: 'bold',
        letterSpacing: Math.random() < 0.5 ? '0.5px' : '-0.5px', // Random letter spacing for glitch effect
        filter: getBlurStyle(),
        transition: 'filter 0.05s ease, letter-spacing 0.1s ease', // Smooth transitions for subtle effects
        textShadow: 'none', // No shadow at all to avoid color mixing
        animation: 'none !important', // Force disable any inherited animations
        WebkitTextFillColor: '#ff0000', // Ensure text is pure red in all browsers
        WebkitTextStroke: '0 transparent', // No stroke to ensure pure color
      }}
    >
      {displayText}
    </span>
  );
}

export default CreepyTextGlitch;