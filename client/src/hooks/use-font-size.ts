import { useState, useCallback, useEffect } from 'react';

export const DEFAULT_FONT_SIZE = 16;
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 24;

export function useFontSize() {
  const [fontSize, setFontSize] = useState(() => {
    try {
      // Get saved font size from localStorage
      const saved = localStorage.getItem('reader-font-size');
      return saved ? parseInt(saved, 10) : DEFAULT_FONT_SIZE;
    } catch (error) {
      console.error('[FontSize] Error reading from localStorage:', error);
      return DEFAULT_FONT_SIZE;
    }
  });

  // Apply the font size when the component mounts and whenever it changes
  useEffect(() => {
    // Throttle DOM writes into a single rAF to avoid jitter
    const raf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
      document.documentElement.setAttribute('data-font-size', fontSize.toString());
    });
    return () => cancelAnimationFrame(raf);
  }, [fontSize]);

  const updateFontSize = useCallback((newSize: number) => {
    const clampedSize = Math.min(Math.max(newSize, MIN_FONT_SIZE), MAX_FONT_SIZE);
    
    // Save to localStorage before updating state
    try {
      localStorage.setItem('reader-font-size', clampedSize.toString());
    } catch (error) {
      console.error('[FontSize] Error saving to localStorage:', error);
    }
    
    // Update state (will trigger the useEffect)
    setFontSize(clampedSize);
  }, []);

  const increaseFontSize = useCallback(() => {
    updateFontSize(fontSize + 1);
  }, [fontSize, updateFontSize]);

  const decreaseFontSize = useCallback(() => {
    updateFontSize(fontSize - 1);
  }, [fontSize, updateFontSize]);

  return {
    fontSize,
    updateFontSize,
    increaseFontSize,
    decreaseFontSize,
    MIN_FONT_SIZE,
    MAX_FONT_SIZE
  };
}