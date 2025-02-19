import { useEffect, useState, useCallback } from "react";
import { theme, type ThemeVariant } from "@/lib/theme";

type Theme = "dark" | "light";

interface ThemeState {
  mode: Theme;
  variant: ThemeVariant;
}

export function useTheme() {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    if (typeof window === 'undefined') return { mode: 'dark', variant: 'classic' };

    const stored = localStorage.getItem("theme-state");
    if (stored) {
      return JSON.parse(stored) as ThemeState;
    }

    return {
      mode: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      variant: 'classic'
    };
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const { mode, variant } = themeState;

    // Update class for light/dark mode
    root.classList.remove("light", "dark");
    root.classList.add(mode);

    // Store theme state
    localStorage.setItem("theme-state", JSON.stringify(themeState));

    const currentTheme = theme.variants[variant][mode === 'dark' ? 'darkMode' : 'lightMode'];

    // Apply theme colors
    const body = document.body;
    body.style.margin = "0px";
    body.style.width = "100%";
    body.style.height = "100vh";

    // Set CSS variables for the selected theme variant
    document.documentElement.style.setProperty('--background', currentTheme.ui.background);
    document.documentElement.style.setProperty('--foreground', currentTheme.primaryColors.text);
    document.documentElement.style.setProperty('--card', currentTheme.ui.card);
    document.documentElement.style.setProperty('--card-foreground', currentTheme.primaryColors.text);
    document.documentElement.style.setProperty('--popover', currentTheme.ui.card);
    document.documentElement.style.setProperty('--popover-foreground', currentTheme.primaryColors.text);
    document.documentElement.style.setProperty('--primary', currentTheme.accentColors.primary);
    document.documentElement.style.setProperty('--primary-foreground', currentTheme.primaryColors.text);
    document.documentElement.style.setProperty('--secondary', currentTheme.accentColors.secondary);
    document.documentElement.style.setProperty('--secondary-foreground', currentTheme.primaryColors.text);
    document.documentElement.style.setProperty('--muted', currentTheme.accentColors.muted);
    document.documentElement.style.setProperty('--muted-foreground', currentTheme.primaryColors.muted);
    document.documentElement.style.setProperty('--accent', currentTheme.primaryColors.accent);
    document.documentElement.style.setProperty('--accent-foreground', currentTheme.primaryColors.text);
    document.documentElement.style.setProperty('--destructive', '#dc2626');
    document.documentElement.style.setProperty('--destructive-foreground', currentTheme.primaryColors.text);
    document.documentElement.style.setProperty('--border', currentTheme.ui.border);
    document.documentElement.style.setProperty('--input', currentTheme.ui.background);
    document.documentElement.style.setProperty('--ring', currentTheme.accentColors.primary);

    // Add smooth transitions
    body.style.transition = theme.effects.transition.smooth;

  }, [themeState]);

  return {
    theme: themeState.mode,
    variant: themeState.variant,
    setTheme: useCallback((newTheme: Theme) => {
      setThemeState(prev => ({ ...prev, mode: newTheme }));
    }, []),
    setVariant: useCallback((newVariant: ThemeVariant) => {
      setThemeState(prev => ({ ...prev, variant: newVariant }));
    }, [])
  };
}

export default useTheme;