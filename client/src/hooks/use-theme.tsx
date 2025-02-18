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

    // Apply transition class before theme change
    root.classList.add('transition-colors', 'duration-300');

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(theme);

    // Store theme preference
    localStorage.setItem("theme", theme);

    // Optional: Remove transition classes after theme change to prevent transitions
    // during other state changes
    const cleanup = setTimeout(() => {
      root.classList.remove('transition-colors', 'duration-300');
    }, 300);

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