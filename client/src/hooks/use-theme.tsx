import { useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    // Check local storage first
    const stored = localStorage.getItem("theme") as Theme;
    if (stored) return stored;

    // Then check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing classes before adding new ones
    root.classList.remove("light", "dark");

    // Add new theme class with transition
    root.classList.add(theme);
    root.style.setProperty('--theme-transition', 'all 0.15s ease');

    // Store theme preference
    localStorage.setItem("theme", theme);

    // Clean up transition after theme change
    const cleanup = setTimeout(() => {
      root.style.removeProperty('--theme-transition');
    }, 150);

    return () => clearTimeout(cleanup);
  }, [theme]);

  return {
    theme,
    setTheme: useCallback((newTheme: Theme) => {
      setTheme(newTheme);
    }, [])
  };
}

export default useTheme;