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
  
  // Schedule more controlled and less jarring glitches
  const scheduleRandomGlitches = () => {
    clearAllTimeouts();
    
    // Simplified glitch effect with more predictable behavior
    const glitchEffect = () => {
      // Convert text to array for character manipulation
      const chars = originalText.current.split('');
      const newChars = [...chars];
      
      // Each character has a chance to glitch, but we limit the total number of glitches
      const maxGlitches = Math.ceil(chars.length * 0.2 * intensityFactor);
      let glitchCount = 0;
      
      // Generate random positions to glitch
      for (let i = 0; i < chars.length && glitchCount < maxGlitches; i++) {
        // Skip spaces
        if (chars[i] === ' ') continue;
        
        // Limited chance to glitch each character, creating a more controlled effect
        if (Math.random() < 0.2) {
          // Replace with a random glitch character
          newChars[i] = GLITCH_CHARS.charAt(
            Math.floor(Math.random() * GLITCH_CHARS.length)
          );
          glitchCount++;
        }
      }
      
      // Apply text with controlled glitched characters
      setDisplayText(newChars.join(''));
      
      // Subtle blur effect with consistent duration
      if (Math.random() > 0.7) {
        setBlurActive(true);
        const blurDuration = 80; // Consistent timing for a more stable effect
        setTimeout(() => setBlurActive(false), blurDuration);
      }
      
      // Always revert to original text after a fixed time
      const revertTime = 120; // Consistent timing
      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
      }, revertTime);
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Schedule next glitch with more predictable timing
    const scheduleNext = () => {
      // More consistent timing between glitches
      const baseDelay = 200;
      const variance = 100;
      const nextGlitchDelay = baseDelay + (Math.random() * variance);
      
      const timeout = setTimeout(() => {
        glitchEffect();
        scheduleNext();
      }, nextGlitchDelay);
      
      timeoutIds.current.push(timeout);
    };
    
    // Start the more controlled cycle
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