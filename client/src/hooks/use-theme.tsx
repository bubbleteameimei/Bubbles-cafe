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

    // Base styles
    const body = document.body;
    body.style.padding = "0px";
    body.style.margin = "0px";
    body.style.width = "100%";
    body.style.height = "100vh";

    // Theme-specific styles with horror theme colors
    if (theme === 'dark') {
      body.style.background = `#1C232A`;
      document.documentElement.style.setProperty('--background', "hsl(215 28% 17%)");
      // Add more horror-themed dark mode colors
      document.documentElement.style.setProperty('--primary', "#8B0000"); // Deep blood red
      document.documentElement.style.setProperty('--secondary', "#2C1810"); // Dark mahogany
    } else {
      body.style.background = `#ffffff`;
      document.documentElement.style.setProperty('--background', "hsl(0 0% 100%)");
      // Add more horror-themed light mode colors
      document.documentElement.style.setProperty('--primary', "#B22222"); // Lighter blood red
      document.documentElement.style.setProperty('--secondary', "#8B4513"); // Lighter mahogany
    }

    // Match transition timing with toggle animation
    body.style.transition = "background .7s cubic-bezier(.8, .5, .2, 1.4)";

  }, [theme]);

  return {
    theme,
    setTheme: useCallback((newTheme: Theme) => {
      setTheme(newTheme);
    }, [])
  };
}

export default useTheme;