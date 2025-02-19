import { useEffect, useState, useCallback } from "react";
import { theme, type ThemeVariant } from "@/lib/theme";

interface ThemeState {
  mode: "light" | "dark";
  variant: ThemeVariant;
}

export function useTheme() {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    if (typeof window === 'undefined') return { mode: 'dark', variant: 'classic' };

    const stored = localStorage.getItem("theme-state");
    if (stored) {
      try {
        return JSON.parse(stored) as ThemeState;
      } catch (e) {
        console.error('Failed to parse stored theme:', e);
      }
    }

    return {
      mode: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      variant: 'gothic' // Default to gothic theme for horror theme
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
    Object.entries({
      '--background': currentTheme.ui.background,
      '--foreground': currentTheme.primaryColors.text,
      '--card': currentTheme.ui.card,
      '--card-foreground': currentTheme.primaryColors.text,
      '--popover': currentTheme.ui.card,
      '--popover-foreground': currentTheme.primaryColors.text,
      '--primary': currentTheme.accentColors.primary,
      '--primary-foreground': currentTheme.primaryColors.text,
      '--secondary': currentTheme.accentColors.secondary,
      '--secondary-foreground': currentTheme.primaryColors.text,
      '--muted': currentTheme.accentColors.muted,
      '--muted-foreground': currentTheme.primaryColors.muted,
      '--accent': currentTheme.primaryColors.accent,
      '--accent-foreground': currentTheme.primaryColors.text,
      '--destructive': '#dc2626',
      '--destructive-foreground': currentTheme.primaryColors.text,
      '--border': currentTheme.ui.border,
      '--input': currentTheme.ui.background,
      '--ring': currentTheme.accentColors.primary
    }).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Add smooth transitions
    document.body.style.transition = theme.effects.transition.smooth;

  }, [themeState]);

  return {
    theme: themeState.mode,
    variant: themeState.variant,
    setTheme: useCallback((newTheme: "light" | "dark") => {
      setThemeState(prev => ({ ...prev, mode: newTheme }));
    }, []),
    setVariant: useCallback((newVariant: ThemeVariant) => {
      setThemeState(prev => ({ ...prev, variant: newVariant }));
    }, [])
  };
}

export default useTheme;