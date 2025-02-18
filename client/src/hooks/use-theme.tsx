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

    // Theme-specific styles
    if (theme === 'dark') {
      body.style.background = `#1C232A`;
      document.documentElement.style.setProperty('--background', "hsl(215 28% 17%)");
    } else {
      body.style.background = `#ffffff`;
      document.documentElement.style.setProperty('--background', "hsl(214 100% 90%)");
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