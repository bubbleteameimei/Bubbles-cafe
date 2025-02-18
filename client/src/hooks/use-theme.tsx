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

    // Update body styles
    const body = document.body;
    body.style.padding = "0px";
    body.style.margin = "0px";
    body.style.width = "100%";
    body.style.height = "100vh";

    // Enhanced background transitions
    if (theme === 'dark') {
      body.style.background = `
        radial-gradient(circle at 50% 50%, 
          #1C232A 0%,
          #121518 70%,
          #0a0c0e 100%
        )
      `;
    } else {
      body.style.background = `
        radial-gradient(circle at 50% 50%,
          #8cc5ff 0%,
          #74b9ff 40%,
          #0984e3 100%
        )
      `;
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