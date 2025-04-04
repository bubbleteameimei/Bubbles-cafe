/**
 * Choice Button Component
 * 
 * This component displays an interactive button for player choices.
 * The appearance and animations are affected by sanity and corruption levels.
 */
import React, { useState, useEffect } from 'react';
import { ChoiceButtonProps } from '../types';
import '../styles/choice-button.css';

const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  choice,
  onSelect,
  disabled = false,
  sanity,
  corruption,
  showTypewriterEffect = false,
  textSpeed = 30
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedChars, setDisplayedChars] = useState<string[]>([]);
  const [isFullyTyped, setIsFullyTyped] = useState(!showTypewriterEffect);

  // Apply sanity effects to button
  const getSanityClass = () => {
    if (sanity < 30) return 'eden-choice-glitch';
    if (sanity < 60) return 'eden-choice-low-sanity';
    return '';
  };

  // Apply corruption effects to button
  const getCorruptionClass = () => {
    if (corruption > 70) return 'eden-choice-corrupted';
    if (corruption > 40) return 'eden-choice-corruption-touch';
    return '';
  };

  // Handle choice selection
  const handleClick = () => {
    if (!disabled && isFullyTyped) {
      setIsAnimating(true);
      // Slight delay to allow the click animation to play
      setTimeout(() => {
        onSelect(choice);
        setIsAnimating(false);
      }, 200);
    }
  };

  // Typewriter effect for the choice text
  useEffect(() => {
    if (showTypewriterEffect) {
      const text = choice.text;
      const chars: string[] = [];
      let currentIndex = 0;
      
      setDisplayedChars([]);
      setIsFullyTyped(false);
      
      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          chars.push(text[currentIndex]);
          setDisplayedChars([...chars]);
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsFullyTyped(true);
        }
      }, textSpeed);
      
      return () => clearInterval(typeInterval);
    } else {
      setDisplayedChars(choice.text.split(''));
      setIsFullyTyped(true);
    }
  }, [choice.text, showTypewriterEffect, textSpeed]);

  // Combine all the button classes
  const buttonClass = `eden-choice-button 
    ${getSanityClass()} 
    ${getCorruptionClass()} 
    ${isAnimating ? 'eden-choice-animating' : ''} 
    ${disabled ? 'eden-choice-disabled' : ''}`;

  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || !isFullyTyped}
      data-text={choice.text} // For glitch effect
    >
      {showTypewriterEffect ? (
        displayedChars.map((char, index) => (
          <span 
            key={index}
            className="eden-choice-text-char"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            {char}
          </span>
        ))
      ) : (
        choice.text
      )}
    </button>
  );
};

export default ChoiceButton;