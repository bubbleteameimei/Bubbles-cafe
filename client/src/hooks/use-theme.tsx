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

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(theme);

    // Store theme preference
    localStorage.setItem("theme", theme);

    // Update body background based on theme
    document.body.style.background = theme === 'dark' 
      ? 'url(https://raw.githubusercontent.com/ahmadbassamemran/dark-light-toggle/master/public/night.png)'
      : 'url(https://raw.githubusercontent.com/ahmadbassamemran/dark-light-toggle/master/public/day.png)';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.transition = 'all 0.3s ease-in-out';

  }, [theme]);

  return {
    theme,
    setTheme: useCallback((newTheme: Theme) => {
      setTheme(newTheme);
    }, [])
  };
}

export default useTheme;