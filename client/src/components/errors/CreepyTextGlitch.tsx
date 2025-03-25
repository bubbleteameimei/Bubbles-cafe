import React, { useEffect, useState, useRef } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
}

// More disturbing character pool for creepier glitches, with some reverse and distorted characters
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~ΨΔΩθӜӬӪӒӘƷƩƟƔҘҖԀԄᐁᐌᑕᕉᕋᕆᕲᕤᕵᑌᑎᕠᙦᙨ̸̡̛̺̤̦̖̭͉̪̤̱̬̼̥̪̳͚̻̫̬̱̙̮̤ͭ̿͒̀̏̏ͩ͆͊͐ͭ̾͛̚̚̚ͅͅͅ";

// Creepy vertical line characters for splitting text
const VERTICAL_CUT_CHARS = "│┃┆┇┊┋╎╏║|⦙⁞";

// Reversed characters for more disturbing effect
const REVERSED_TEXT_POOL = "zʎxʍʌnʇsɹbdouɯʅʞɾᴉɥƃɟǝpɔqɐZʎXʍʌՈ┴SɹQԀONWꓶꓘſIHפℲƎpƆq∀";

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
    
    // Single character glitch effect - more disturbing
    const glitchSingleCharacter = () => {
      // Pick a random position in the text that isn't a space
      let pos;
      do {
        pos = Math.floor(Math.random() * textArray.length);
      } while (textArray[pos] === ' ');
      
      // Save original character
      const originalChar = textArray[pos];
      
      // Choose glitch type based on intensity
      const glitchType = Math.random() * intensityFactor;
      
      let randomChar;
      if (glitchType > 3) {
        // For higher intensity, use more extreme distorted characters
        randomChar = GLITCH_CHARS.charAt(
          Math.floor(Math.random() * GLITCH_CHARS.length)
        );
      } else if (glitchType > 2) {
        // Use reversed characters for medium intensity
        randomChar = REVERSED_TEXT_POOL.charAt(
          Math.floor(Math.random() * REVERSED_TEXT_POOL.length)
        );
      } else if (glitchType > 1) {
        // Vertical line cuts for low intensity
        randomChar = VERTICAL_CUT_CHARS.charAt(
          Math.floor(Math.random() * VERTICAL_CUT_CHARS.length)
        );
      } else {
        // Random letter shift (slightly offset character)
        const charCode = originalChar.charCodeAt(0);
        randomChar = String.fromCharCode(charCode + (Math.random() > 0.5 ? 1 : -1));
      }
      
      // Update the text with the glitched character
      const newTextArray = [...textArray];
      newTextArray[pos] = randomChar;
      setDisplayText(newTextArray.join(''));
      
      // Apply style variations for even creepier effect
      const newStyle: React.CSSProperties = {};
      
      // More aggressive text shadow for horror feel based on intensity
      if (Math.random() < 0.4 * intensityFactor) {
        // More emphasis on reds for horror feel
        const shadowColor = `rgba(${180 + Math.floor(Math.random() * 75)}, ${Math.floor(Math.random() * 20)}, ${Math.floor(Math.random() * 20)}, 0.85)`;
        newStyle.textShadow = `0 0 ${1 + Math.random() * 3 * (intensityFactor/2)}px ${shadowColor}`;
        
        // Occasionally add slight skew for disorienting effect
        if (Math.random() < 0.2 * intensityFactor) {
          newStyle.transform = `skew(${(Math.random() - 0.5) * 2}deg)`;
        }
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