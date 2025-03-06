import { useState, useCallback } from 'react';

export const DEFAULT_FONT_SIZE = 16;
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 24;

export function useFontSize() {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('reader-font-size');
    return saved ? parseInt(saved, 10) : DEFAULT_FONT_SIZE;
  });

  const updateFontSize = useCallback((newSize: number) => {
    const clampedSize = Math.min(Math.max(newSize, MIN_FONT_SIZE), MAX_FONT_SIZE);
    setFontSize(clampedSize);
    localStorage.setItem('reader-font-size', clampedSize.toString());
    document.documentElement.style.setProperty('--base-font-size', `${clampedSize}px`);
  }, []);

  return {
    fontSize,
    updateFontSize,
    MIN_FONT_SIZE,
    MAX_FONT_SIZE
  };
}