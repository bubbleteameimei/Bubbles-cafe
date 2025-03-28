import { useEffect, useCallback, useState } from "react";
import { theme as themeConfig } from "@/lib/theme";

type ColorMode = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<ColorMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (window.localStorage.getItem('color-mode') as ColorMode) || 'dark';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('color-mode', newMode);
      }
      return newMode;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    const colors = themeConfig.colors[theme];

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
        mode: theme,
        colors: colors
      });
    }
  }, [theme]);

  return {
    theme,
    toggleTheme,
  };
}

export default useTheme;