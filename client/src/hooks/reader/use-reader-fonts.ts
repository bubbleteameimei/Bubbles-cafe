import { useEffect } from 'react';
import { useFontSize } from '@/hooks/use-font-size';
import { useFontFamily } from '@/hooks/use-font-family';
import { useTheme } from '@/components/theme-provider';

const DARK_TEXT_COLOR = 'rgba(255, 255, 255, 0.95)';
const LIGHT_TEXT_COLOR = 'rgba(0, 0, 0, 0.95)';

export function useReaderFonts() {
  const { theme } = useTheme();
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();
  const { fontFamily, availableFonts, updateFontFamily } = useFontFamily();

  // Apply font styles using CSS variables for smooth transitions across the reader.
  useEffect(() => {
    try {
      if (import.meta.env?.DEV) {
        // Keep the same debug logging semantics the reader had previously.
        console.log('[ReaderFonts] Updating font styles with CSS variables:', {
          fontFamily,
          fontSize,
          theme,
        });
      }
      const root = document.documentElement;
      const familyDef = availableFonts[fontFamily];

      if (familyDef && familyDef.family) {
        root.style.setProperty('--reader-font-family', familyDef.family);
      }

      root.style.setProperty('--reader-font-size', `${fontSize}px`);
      root.style.setProperty(
        '--reader-text-color',
        theme === 'dark' ? DARK_TEXT_COLOR : LIGHT_TEXT_COLOR,
      );
    } catch (error) {
      console.error('[ReaderFonts] Error applying font styles:', error);
    }
  }, [fontFamily, fontSize, availableFonts, theme]);

  return {
    theme,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    fontFamily,
    availableFonts,
    updateFontFamily,
  };
}

export default useReaderFonts;