import { useState, useEffect, useCallback } from "react";

interface UseTypewriterOptions {
  texts: string[];
  speed: number;
  onComplete?: () => void;
}

interface UseTypewriterResult {
  displayedTexts: string[];
  isTyping: boolean;
  skipTyping: () => void;
}

export function useTypewriter({
  texts,
  speed,
  onComplete
}: UseTypewriterOptions): UseTypewriterResult {
  const [displayedTexts, setDisplayedTexts] = useState<string[]>(Array(texts.length).fill(""));
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const skipTyping = useCallback(() => {
    setDisplayedTexts([...texts]);
    setCurrentTextIndex(texts.length);
    setCurrentCharIndex(0);
    setIsTyping(false);
    if (onComplete) onComplete();
  }, [texts, onComplete]);

  useEffect(() => {
    // Reset state when texts change
    setDisplayedTexts(Array(texts.length).fill(""));
    setCurrentTextIndex(0);
    setCurrentCharIndex(0);
    setIsTyping(true);
  }, [texts]);

  useEffect(() => {
    if (!isTyping || texts.length === 0) return;

    // If we've completed all texts
    if (currentTextIndex >= texts.length) {
      setIsTyping(false);
      if (onComplete) onComplete();
      return;
    }

    const currentText = texts[currentTextIndex];
    
    // If we've typed all characters in the current text
    if (currentCharIndex >= currentText.length) {
      // Move to the next text after a brief pause
      const timeout = setTimeout(() => {
        setCurrentTextIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, speed * 10); // Longer pause between paragraphs
      
      return () => clearTimeout(timeout);
    }

    // Type the next character
    const timeout = setTimeout(() => {
      setDisplayedTexts(prev => {
        const updated = [...prev];
        updated[currentTextIndex] = currentText.substring(0, currentCharIndex + 1);
        return updated;
      });
      setCurrentCharIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentTextIndex, currentCharIndex, texts, speed, isTyping, onComplete]);

  return {
    displayedTexts,
    isTyping,
    skipTyping
  };
}
