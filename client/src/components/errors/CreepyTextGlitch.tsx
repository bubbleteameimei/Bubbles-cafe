import React, { useEffect, useState, useRef } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
}

// Simpler character pool for more legible but still disturbing glitches
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789¿¡§±æøåñÇçÑÆØÅ";

export function CreepyTextGlitch({ text, className = "", intensityFactor = 1 }: CreepyTextGlitchProps) {
  const [displayText, setDisplayText] = useState(text);
  const [displayStyle, setDisplayStyle] = useState<React.CSSProperties>({});
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
  }, [text]);
  
  // Schedule glitches with a slower, more deliberate pace
  const scheduleGlitches = () => {
    clearAllTimeouts();
    
    // Convert text to array for easier manipulation
    const textArray = originalText.current.split('');
    
    // Single character glitch effect - more subtle and disturbing
    const glitchSingleCharacter = () => {
      // Pick a random position in the text that isn't a space
      let pos;
      do {
        pos = Math.floor(Math.random() * textArray.length);
      } while (textArray[pos] === ' ');
      
      // Save original character
      const originalChar = textArray[pos];
      
      // Replace with random character
      const randomChar = GLITCH_CHARS.charAt(
        Math.floor(Math.random() * GLITCH_CHARS.length)
      );
      
      // Update the text with the glitched character
      const newTextArray = [...textArray];
      newTextArray[pos] = randomChar;
      setDisplayText(newTextArray.join(''));
      
      // Apply subtle style variation - just enough to be unsettling
      const newStyle: React.CSSProperties = {};
      
      // Occasionally add subtle text shadow for a creepy effect
      if (Math.random() < 0.3) {
        // More emphasis on reds for horror feel
        const shadowColor = `rgba(${180 + Math.floor(Math.random() * 75)}, 0, 0, 0.7)`;
        newStyle.textShadow = `0 0 ${1 + Math.random() * 2}px ${shadowColor}`;
      }
      
      setDisplayStyle(newStyle);
      
      // Schedule revert back to original character after a longer moment
      // Slower timing makes it more noticeable and creepy
      const revertDelay = 200 + Math.random() * 300;
      const revertTimeout = setTimeout(() => {
        const revertTextArray = [...newTextArray];
        revertTextArray[pos] = originalChar;
        setDisplayText(revertTextArray.join(''));
        setDisplayStyle({});
      }, revertDelay);
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Multiple character glitch - for more intense moments
    const glitchMultipleCharacters = () => {
      // Clone the current text
      const newTextArray = [...textArray];
      
      // Number of characters to glitch - keeps it limited for legibility
      const glitchCount = Math.min(
        Math.floor(1 + Math.random() * 2 * intensityFactor),
        Math.floor(textArray.length * 0.3) // Cap at 30% of text length for legibility
      );
      
      const positions: number[] = [];
      
      // Select random positions to glitch
      for (let i = 0; i < glitchCount; i++) {
        let pos;
        do {
          pos = Math.floor(Math.random() * textArray.length);
        } while (
          newTextArray[pos] === ' ' || 
          positions.includes(pos)
        );
        
        positions.push(pos);
        
        // Get random replacement character
        const randomChar = GLITCH_CHARS.charAt(
          Math.floor(Math.random() * GLITCH_CHARS.length)
        );
        
        newTextArray[pos] = randomChar;
      }
      
      // Apply subtle style variations
      const newStyle: React.CSSProperties = {};
      
      // Add text shadow for a creepy glow effect
      if (Math.random() < 0.5) {
        const color = `rgba(${180 + Math.floor(Math.random() * 75)}, 0, 0, 0.85)`;
        newStyle.textShadow = `0 0 ${1 + Math.random() * 3}px ${color}`;
      }
      
      // Set the glitched text and style
      setDisplayText(newTextArray.join(''));
      setDisplayStyle(newStyle);
      
      // Schedule revert after a moment - slower for more impact
      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
        setDisplayStyle({});
      }, 400 + Math.random() * 200);
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Schedule glitches at a slower, more deliberate pace
    const scheduleNext = () => {
      // Longer delays between glitches for a more unsettling, deliberate effect
      // The unpredictability of timing is part of what makes it creepy
      const baseDelay = 800; // Base delay in milliseconds
      const randomVariation = 1200; // Random variation added to the base
      const nextGlitchDelay = baseDelay + Math.random() * randomVariation;
      
      const timeout = setTimeout(() => {
        // Higher probability of single character glitches for subtlety
        if (Math.random() < 0.7) {
          glitchSingleCharacter();
        } else {
          glitchMultipleCharacters();
        }
        
        // Continue the cycle
        scheduleNext();
      }, nextGlitchDelay);
      
      timeoutIds.current.push(timeout);
    };
    
    // Start the cycle
    scheduleNext();
  };
  
  return (
    <span className={className} style={displayStyle}>{displayText}</span>
  );
}

export default CreepyTextGlitch;