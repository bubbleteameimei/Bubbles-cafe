import { useState, useCallback, useEffect } from 'react';

// Available font options
export const FONT_FAMILIES = {
  'cormorant': {
    name: 'Cormorant Garamond',
    family: "'Cormorant Garamond', var(--font-serif, Georgia, 'Times New Roman', serif)",
    type: 'serif',
    description: 'An elegant serif font with literary character'
  },
  'merriweather': {
    name: 'Merriweather',
    family: "'Merriweather', var(--font-serif, Georgia, 'Times New Roman', serif)",
    type: 'serif',
    description: 'A traditional serif font designed for readability'
  },
  'lora': {
    name: 'Lora',
    family: "'Lora', var(--font-serif, Georgia, 'Times New Roman', serif)",
    type: 'serif',
    description: 'A well-balanced serif with moderate contrast'
  },
  'roboto': {
    name: 'Roboto',
    family: "'Roboto', var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
    type: 'sans-serif',
    description: 'A clean, modern sans-serif font'
  },
  'opensans': {
    name: 'Open Sans',
    family: "'Open Sans', var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif)",
    type: 'sans-serif',
    description: 'A humanist sans-serif with excellent readability'
  },
  'literata': {
    name: 'Literata',
    family: "'Literata', var(--font-serif, Georgia, 'Times New Roman', serif)",
    type: 'serif',
    description: 'A contemporary serif designed for e-books'
  }
};

export type FontFamilyKey = keyof typeof FONT_FAMILIES;

export const DEFAULT_FONT_FAMILY: FontFamilyKey = 'roboto';

export function useFontFamily() {
  const [fontFamily, setFontFamily] = useState<FontFamilyKey>(() => {
    try {
      // Get saved font family from localStorage
      const saved = localStorage.getItem('reader-font-family');
      return (saved && saved in FONT_FAMILIES) 
        ? saved as FontFamilyKey 
        : DEFAULT_FONT_FAMILY;
    } catch (error) {
      console.error('[FontFamily] Error reading from localStorage:', error);
      return DEFAULT_FONT_FAMILY;
    }
  });

  // Apply the font family when the component mounts and whenever it changes
  useEffect(() => {
    // Update CSS custom property for global access in a rAF to avoid reflow thrash
    const raf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--reader-font-family', FONT_FAMILIES[fontFamily].family);
      document.documentElement.setAttribute('data-font-family', fontFamily);
    });
    return () => cancelAnimationFrame(raf);
  }, [fontFamily]);

  const updateFontFamily = useCallback((newFamily: FontFamilyKey) => {
    if (!(newFamily in FONT_FAMILIES)) {
      console.error('[FontFamily] Invalid font family:', newFamily);
      return;
    }
    
    // Save to localStorage before updating state
    try {
      localStorage.setItem('reader-font-family', newFamily);
    } catch (error) {
      console.error('[FontFamily] Error saving to localStorage:', error);
    }
    
    // Update state (will trigger the useEffect)
    setFontFamily(newFamily);
  }, []);

  return {
    fontFamily,
    updateFontFamily,
    availableFonts: FONT_FAMILIES,
  };
}