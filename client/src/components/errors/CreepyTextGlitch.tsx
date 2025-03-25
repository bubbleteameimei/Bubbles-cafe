import React, { useEffect, useState, useRef } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
}

// Simple character pool for glitching - only regular ASCII
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~";

export function CreepyTextGlitch({ text, className = "", intensityFactor = 1 }: CreepyTextGlitchProps) {
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
  }, [text, intensityFactor]);
  
  // Schedule occasional glitches throughout the text
  const scheduleGlitches = () => {
    clearAllTimeouts();
    
    // Split text by words and whitespace
    const segments = originalText.current.split(/(\s+)/);
    
    // Function to glitch a word
    const glitchWord = () => {
      // Select a random word to glitch (not whitespace)
      let wordIndex;
      do {
        wordIndex = Math.floor(Math.random() * segments.length);
      } while (segments[wordIndex].trim() === '');
      
      // Save original word
      const originalWord = segments[wordIndex];
      
      // Create a glitched version of the word
      let glitchedWord = '';
      for (let i = 0; i < originalWord.length; i++) {
        if (Math.random() > 0.6) { // 40% chance to glitch each character
          const randomChar = GLITCH_CHARS.charAt(
            Math.floor(Math.random() * GLITCH_CHARS.length)
          );
          glitchedWord += randomChar;
        } else {
          glitchedWord += originalWord[i];
        }
      }
      
      // Update the text with the glitched word
      const newSegments = [...segments];
      newSegments[wordIndex] = glitchedWord;
      setDisplayText(newSegments.join(''));
      
      // Schedule revert back to original word
      const revertTimeout = setTimeout(() => {
        const revertSegments = [...newSegments];
        revertSegments[wordIndex] = originalWord;
        setDisplayText(revertSegments.join(''));
      }, 50 + Math.random() * 150); // Revert after 50-200ms
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Function to glitch an individual character
    const glitchChar = () => {
      // Convert text to array for character-level manipulation
      const chars = originalText.current.split('');
      
      // Pick a random position in the text that isn't a space
      let pos;
      do {
        pos = Math.floor(Math.random() * chars.length);
      } while (chars[pos] === ' ');
      
      // Save original character
      const originalChar = chars[pos];
      
      // Replace with random character
      const randomChar = GLITCH_CHARS.charAt(
        Math.floor(Math.random() * GLITCH_CHARS.length)
      );
      
      // Update the text with the glitched character
      const newChars = [...chars];
      newChars[pos] = randomChar;
      setDisplayText(newChars.join(''));
      
      // Schedule revert back to original character
      const revertTimeout = setTimeout(() => {
        const revertChars = [...newChars];
        revertChars[pos] = originalChar;
        setDisplayText(revertChars.join(''));
      }, 30 + Math.random() * 100); // Revert after 30-130ms for faster glitches
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Schedule periodic glitches
    const scheduleNext = () => {
      // Random delay between 50ms and 400ms for next glitch
      const nextGlitchDelay = 50 + Math.random() * 350 / intensityFactor;
      
      const timeout = setTimeout(() => {
        // Randomly choose between word and character glitching
        if (Math.random() > 0.5) {
          glitchWord();
        } else {
          glitchChar();
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
    <span className={`glitch-text ${className}`} 
      style={{
        position: 'relative',
        display: 'inline-block',
        textShadow: '0.03em 0 1px rgba(255,0,0,0.4), -0.03em 0 1px rgba(0,0,255,0.4)',
      }}
    >
      {displayText}
    </span>
  );
}

export default CreepyTextGlitch;