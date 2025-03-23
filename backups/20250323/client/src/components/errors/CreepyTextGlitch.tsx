import React, { useEffect, useState, useRef } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
}

// Character pool for random replacements
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789¿¡§±æøåñÇçÑÆØÅ";

export function CreepyTextGlitch({ text, className = "" }: CreepyTextGlitchProps) {
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
    scheduleRandomGlitches();
    
    return () => {
      clearAllTimeouts();
    };
  }, [text]);
  
  // Schedule random glitches throughout the text
  const scheduleRandomGlitches = () => {
    clearAllTimeouts();
    
    // Convert text to array for easier manipulation
    const textArray = originalText.current.split('');
    
    // Intensified glitch effect - multiple characters at once
    const intensiveGlitch = () => {
      // Clone the current text
      const newTextArray = [...textArray];
      
      // Number of characters to glitch (between 2 and 4)
      const glitchCount = 2 + Math.floor(Math.random() * 3);
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
      
      // Apply a subtle style variation
      const newStyle: React.CSSProperties = {};
      
      // Randomly add a subtle filter or transform
      if (Math.random() < 0.3) {
        newStyle.filter = `blur(${0.2 + Math.random() * 0.5}px)`;
      }
      
      if (Math.random() < 0.3) {
        newStyle.transform = `skew(${(Math.random() - 0.5) * 2}deg)`;
      }
      
      // Set the glitched text and style
      setDisplayText(newTextArray.join(''));
      setDisplayStyle(newStyle);
      
      // Schedule revert after a brief moment
      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
        setDisplayStyle({});
      }, 80 + Math.random() * 170); // Revert after 80-250ms
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Function to glitch a single character at a random position
    const glitchRandomCharacter = () => {
      // Pick a random position in the text
      const pos = Math.floor(Math.random() * textArray.length);
      
      // Skip spaces
      if (textArray[pos] === ' ') {
        return;
      }
      
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
      
      // Schedule revert back to original character after a brief moment
      const revertTimeout = setTimeout(() => {
        const revertTextArray = [...newTextArray];
        revertTextArray[pos] = originalChar;
        setDisplayText(revertTextArray.join(''));
      }, 80 + Math.random() * 120); // Revert after 80-200ms
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Schedule irregular glitches
    const scheduleNext = () => {
      // Random delay between 50ms and 800ms for next glitch
      const nextGlitchDelay = 50 + Math.random() * 750;
      
      const timeout = setTimeout(() => {
        // 1 in 5 chance of intensive glitch (multiple characters)
        if (Math.random() < 0.2) {
          intensiveGlitch();
        } else {
          glitchRandomCharacter();
        }
        
        scheduleNext(); // Continue the cycle
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