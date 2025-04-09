import { useEffect, useCallback, useState } from "react";
import { theme as themeConfig } from "@/lib/theme";

type ColorMode = 'light' | 'dark';

interface ThemeState {
  mode: ColorMode;
  appearance: 'light' | 'dark' | 'system';
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeState>(() => {
    if (typeof window === 'undefined') return { mode: 'dark', appearance: 'system' };
    
    const savedMode = window.localStorage.getItem('color-mode') as ColorMode || 'dark';
    const savedAppearance = window.localStorage.getItem('theme-appearance') as 'light' | 'dark' | 'system' || 'system';
    
    return { 
      mode: savedMode,
      appearance: savedAppearance
    };
  });

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const newMode = prev.mode === 'light' ? 'dark' : 'light';
      const newAppearance = newMode; // Also update appearance when toggling
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('color-mode', newMode);
        window.localStorage.setItem('theme-appearance', newAppearance);
      }
      
      return {
        mode: newMode,
        appearance: newAppearance
      };
    });
  }, []);
  
  const setTheme = useCallback((newTheme: Partial<ThemeState>) => {
    setThemeState(prev => {
      const updatedTheme = { ...prev, ...newTheme };
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        if (newTheme.mode) {
          window.localStorage.setItem('color-mode', newTheme.mode);
        }
        if (newTheme.appearance) {
          window.localStorage.setItem('theme-appearance', newTheme.appearance);
        }
      }
      
      return updatedTheme;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    const colors = themeConfig.colors[theme.mode];

    // Apply theme colors as CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      // Convert the color to CSS custom property format
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value as string);
    });

    // Apply base styles
    const body = document.body;
    body.style.backgroundColor = colors.background;
    body.style.color = colors.foreground;
    body.style.transition = themeConfig.effects.transition.theme;

    // Add debug information
    if (process.env.NODE_ENV === 'development') {
      console.log('Theme applied:', {
        theme: theme,
        colors: colors
      });
    }
  }, [theme.mode]);

  return {
    theme,
    toggleTheme,
    setTheme
  };
}

export default useTheme;