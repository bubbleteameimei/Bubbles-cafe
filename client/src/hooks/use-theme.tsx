import { useEffect, useCallback } from "react";
import { theme } from "@/lib/theme";

export function useTheme() {
  // Apply theme colors as CSS variables
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;

      // Set CSS variables for the theme
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });

      // Apply base styles to body
      const body = document.body;
      body.style.margin = "0px";
      body.style.width = "100%";
      body.style.height = "100vh";
      body.style.transition = theme.effects.transition.smooth;

      // Debug log
      console.log('Theme applied:', {
        fonts: {
          body: window.getComputedStyle(body).fontFamily,
          size: window.getComputedStyle(body).fontSize,
          lineHeight: window.getComputedStyle(body).lineHeight
        },
        colors: theme.colors
      });
    }
  }, []);

  // Return theme object for component usage
  return { theme };
}

export default useTheme;