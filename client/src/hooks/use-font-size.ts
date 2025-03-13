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

  // Apply the font size when the component mounts
  useEffect(() => {
    console.log('[FontSize] Initializing font size:', fontSize);
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    
    // Also set a data attribute for easier CSS targeting
    document.documentElement.setAttribute('data-font-size', fontSize.toString());
  }, []);

  const updateFontSize = useCallback((newSize: number) => {
    const clampedSize = Math.min(Math.max(newSize, MIN_FONT_SIZE), MAX_FONT_SIZE);
    console.log('[FontSize] Updating font size to:', clampedSize);
    
    // Update state
    setFontSize(clampedSize);
    
    // Save to localStorage
    try {
      localStorage.setItem('reader-font-size', clampedSize.toString());
    } catch (error) {
      console.error('[FontSize] Error saving to localStorage:', error);
    }
    
    // Update CSS custom property for global access
    document.documentElement.style.setProperty('--base-font-size', `${clampedSize}px`);
    
    // Update data attribute for easier CSS targeting
    document.documentElement.setAttribute('data-font-size', clampedSize.toString());
    
    // Force update any story content by applying styles directly to elements with a proper selector
    const storyContentElements = document.querySelectorAll('.story-content p, .story-content li, .story-content, .story-content div');
    
    // Apply styles immediately to ensure instant feedback
    requestAnimationFrame(() => {
      storyContentElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.fontSize = `${clampedSize}px`;
        }
      });
      
      // Force a reflow/repaint for immediate visual update
      document.body.style.zoom = '99.99%';
      requestAnimationFrame(() => {
        document.body.style.zoom = '100%';
      });
    });
    
    // Also update the dynamically injected style tag for better coverage
    const styleTag = document.getElementById('reader-dynamic-styles');
    if (styleTag && styleTag instanceof HTMLStyleElement) {
      const currentStyles = styleTag.textContent || '';
      const updatedStyles = currentStyles.replace(
        /font-size:\s*\d+px\s*!/g, 
        `font-size: ${clampedSize}px!`
      );
      styleTag.textContent = updatedStyles;
    }
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