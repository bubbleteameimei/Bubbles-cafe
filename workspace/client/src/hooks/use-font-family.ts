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

export const DEFAULT_FONT_FAMILY: FontFamilyKey = 'cormorant';

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
     // Make sure the fonts are loaded from Google Fonts if needed
     const fontUrls = {
       'cormorant': 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
       'merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap',
       'lora': 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
       'roboto': 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap',
       'opensans': 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
       'literata': 'https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap',
     };
 
     // Only load the necessary font
     const fontUrl = fontUrls[fontFamily];
     
     // Check if the font link is already in the document
     const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
     
     if (!existingLink && fontUrl) {
       const fontLink = document.createElement('link');
       fontLink.rel = 'stylesheet';
       fontLink.href = fontUrl;
       document.head.appendChild(fontLink);
     }
     
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