import React, { useEffect, useState, useRef } from 'react';

interface SimpleGlitchTextProps {
  text: string;
  className?: string;
}

// Character pool for random replacements (simplified)
const GLITCH_CHARS = "!@#$%^&*()_+-={}|;:<>?";

export function SimpleGlitchText({ text, className = "" }: SimpleGlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
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
  
  // Schedule occasional glitches throughout the text
  const scheduleGlitches = () => {
    clearAllTimeouts();
    
    // Convert text to array for easier manipulation
    const textArray = originalText.current.split('');
    
    // Function to glitch a random character
    const glitchSingleCharacter = () => {
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
      
      // Schedule revert back to original character
      const revertTimeout = setTimeout(() => {
        const revertTextArray = [...newTextArray];
        revertTextArray[pos] = originalChar;
        setDisplayText(revertTextArray.join(''));
      }, 80 + Math.random() * 120); // Revert after 80-200ms
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Schedule periodic glitches at a lower frequency
    const scheduleNext = () => {
      // Random delay between 500ms and 3000ms for next glitch
      const nextGlitchDelay = 500 + Math.random() * 2500;
      
      const timeout = setTimeout(() => {
        glitchSingleCharacter();
        scheduleNext(); // Continue the cycle
      }, nextGlitchDelay);
      
      timeoutIds.current.push(timeout);
    };
    
    // Start the cycle
    scheduleNext();
  };
  
  return (
    <span className={`glitch-text ${className}`}>{displayText}</span>
  );
}

export default SimpleGlitchText;