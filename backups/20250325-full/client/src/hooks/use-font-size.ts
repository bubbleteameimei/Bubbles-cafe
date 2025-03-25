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
    console.log('[FontSize] Setting font size:', fontSize);
    
    // Update CSS custom property for global access
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    
    // Also set a data attribute for easier CSS targeting
    document.documentElement.setAttribute('data-font-size', fontSize.toString());
    
    // Create or update a global style tag for consistent font sizing
    let styleTag = document.getElementById('reader-font-size-styles');
    
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'reader-font-size-styles';
      document.head.appendChild(styleTag);
    }
    
    // Set consistent styles for story content that will override any inline styles
    styleTag.textContent = `
      .story-content {
        font-size: ${fontSize}px !important;
        line-height: 1.6 !important;
      }
      .story-content p, 
      .story-content li,
      .story-content div:not(.not-content) {
        font-size: ${fontSize}px !important;
        line-height: 1.6 !important;
        font-family: 'Cormorant Garamond', serif !important;
      }
      .story-content h1 { font-size: ${fontSize * 1.8}px !important; }
      .story-content h2 { font-size: ${fontSize * 1.5}px !important; }
      .story-content h3 { font-size: ${fontSize * 1.3}px !important; }
      .story-content h4 { font-size: ${fontSize * 1.1}px !important; }
      .story-content small { font-size: ${fontSize * 0.85}px !important; }
    `;
    
    // Clean up function
    return () => {
      // We don't remove the style tag on unmount to maintain font size between page navigations
    };
  }, [fontSize]);

  const updateFontSize = useCallback((newSize: number) => {
    const clampedSize = Math.min(Math.max(newSize, MIN_FONT_SIZE), MAX_FONT_SIZE);
    console.log('[FontSize] Updating font size to:', clampedSize);
    
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