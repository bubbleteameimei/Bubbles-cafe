/**
 * Eden's Hollow Typewriter Text Component
 * Creates a progressive text reveal effect for narrative text
 */

import React, { useState, useEffect, useRef } from 'react';
import './TypewriterText.css';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  initialDelay?: number;
  onComplete?: () => void;
}

/**
 * Typewriter Text Component
 * Displays text with a typewriter animation effect 
 */
const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 40,
  initialDelay = 300,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isFastForward, setIsFastForward] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  
  // Manage the typewriter effect
  useEffect(() => {
    if (text === '') {
      setDisplayedText('');
      setIsComplete(true);
      return;
    }
    
    // Reset state when text changes
    setDisplayedText('');
    setIsComplete(false);
    setIsFastForward(false);
    
    let charIndex = 0;
    let timeout: NodeJS.Timeout;
    
    // Initial delay before typing starts
    const initialTimeout = setTimeout(() => {
      // Start typing each character
      const typeNextChar = () => {
        setDisplayedText(prev => {
          const nextText = text.substring(0, charIndex + 1);
          charIndex++;
          return nextText;
        });
        
        // Check if typing is complete
        if (charIndex >= text.length) {
          setIsComplete(true);
          if (onComplete) onComplete();
        } else {
          // Calculate delay for next character
          const nextDelay = isFastForward ? 5 : getCharDelay(text[charIndex]);
          timeout = setTimeout(typeNextChar, nextDelay);
        }
      };
      
      typeNextChar();
    }, initialDelay);
    
    // Cleanup timeouts on unmount or text change
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(timeout);
    };
  }, [text, speed, initialDelay, onComplete, isFastForward]);
  
  // Calculate delay based on character type for a more natural effect
  const getCharDelay = (char: string): number => {
    if (isFastForward) return 5;
    
    // Punctuation gets longer delays
    if ('.!?'.includes(char)) return speed * 4;
    if (',;:'.includes(char)) return speed * 2.5;
    if ('-—()[]{}""\''.includes(char)) return speed * 1.5;
    if (char === '\n') return speed * 2; // Line break delay
    
    // Randomize slightly for natural feel
    return speed * (0.8 + Math.random() * 0.4);
  };
  
  // Handle user click to fast-forward
  const handleClick = () => {
    if (!isComplete) {
      setIsFastForward(true);
    }
  };
  
  // If already complete, show full text
  if (isComplete) {
    return (
      <div className="eden-typewriter-text eden-text-complete" ref={textRef}>
        {text.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < text.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    );
  }
  
  // Show text as it's being typed
  return (
    <div 
      className="eden-typewriter-text" 
      onClick={handleClick}
      ref={textRef}
    >
      {displayedText.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < displayedText.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
      <span className="eden-cursor"></span>
    </div>
  );
};

export default TypewriterText;