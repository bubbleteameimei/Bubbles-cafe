import React, { useEffect, useState, useRef } from 'react';

interface SimpleGlitchTextProps {
  text: string;
  className?: string;
  lineGlitch?: boolean; // Option to glitch entire lines/sentences
}

// Character pool for random replacements (horror-themed set)
const GLITCH_CHARS = "!@#$%^&*()_+-={}|;:<>?²³½¾ÆØÞßæþđŋħœ꧁꧂†‡☠⍟ⓧ⊗";

export function SimpleGlitchText({ text, className = "", lineGlitch = true }: SimpleGlitchTextProps) {
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
  }, [text, lineGlitch]);
  
  // Schedule occasional glitches throughout the text
  const scheduleGlitches = () => {
    clearAllTimeouts();
    
    // Split text by words/sentences for line-by-line glitching, or by characters for individual glitches
    const segments = lineGlitch 
      ? originalText.current.split(/(\s+)/) // Split by whitespace but keep the whitespace
      : originalText.current.split('');
    
    // Function to glitch characters or words depending on mode
    const glitchSegment = () => {
      if (lineGlitch) {
        // Line glitching - select a random word to glitch
        let wordIndex = Math.floor(Math.random() * segments.length);
        
        // Keep trying if we selected whitespace or an empty segment
        while (segments[wordIndex].trim() === '') {
          wordIndex = Math.floor(Math.random() * segments.length);
        }
        
        // Save original word
        const originalWord = segments[wordIndex];
        
        // Create a glitched version of the word by replacing some characters
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
      } else {
        // Character glitching - traditional approach
        // Pick a random position in the text
        const pos = Math.floor(Math.random() * segments.length);
        
        // Skip spaces
        if (segments[pos] === ' ') {
          return;
        }
        
        // Save original character
        const originalChar = segments[pos];
        
        // Replace with random character
        const randomChar = GLITCH_CHARS.charAt(
          Math.floor(Math.random() * GLITCH_CHARS.length)
        );
        
        // Update the text with the glitched character
        const newSegments = [...segments];
        newSegments[pos] = randomChar;
        setDisplayText(newSegments.join(''));
        
        // Schedule revert back to original character with quicker glitches
        const revertTimeout = setTimeout(() => {
          const revertSegments = [...newSegments];
          revertSegments[pos] = originalChar;
          setDisplayText(revertSegments.join(''));
        }, 30 + Math.random() * 100); // Revert after 30-130ms for faster glitches
        
        timeoutIds.current.push(revertTimeout);
      }
    };
    
    // Schedule periodic glitches at a higher frequency
    const scheduleNext = () => {
      // Random delay between 50ms and 600ms for next glitch (more frequent)
      const nextGlitchDelay = 50 + Math.random() * 550;
      
      const timeout = setTimeout(() => {
        // Determine number of segments to glitch in this cycle
        const glitchIntensity = Math.random();
        let glitchCount;
        
        if (glitchIntensity > 0.85) {
          // High intensity: glitch multiple segments
          glitchCount = Math.floor(Math.random() * 3) + 2;
        } else if (glitchIntensity > 0.6) {
          // Medium intensity: glitch 1-2 segments
          glitchCount = Math.floor(Math.random() * 2) + 1;
        } else {
          // Normal intensity: glitch 1 segment
          glitchCount = 1;
        }
        
        for (let i = 0; i < glitchCount; i++) {
          glitchSegment();
        }
        
        scheduleNext(); // Continue the cycle
      }, nextGlitchDelay);
      
      timeoutIds.current.push(timeout);
    };
    
    // Start the cycle
    scheduleNext();
  };
  
  return (
    <span className={`glitch-text inline-block ${className}`} 
      style={{
        textShadow: '0.03em 0 1px rgba(255,0,0,0.4), -0.03em 0 1px rgba(0,0,255,0.4)',
        position: 'relative',
        display: 'inline-block'
      }}
    >
      {displayText}
    </span>
  );
}

export default SimpleGlitchText;