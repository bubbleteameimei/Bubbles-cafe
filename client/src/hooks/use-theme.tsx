import { useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';

    const stored = localStorage.getItem("theme") as Theme;
    if (stored) return stored;

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);

    const body = document.body;
    body.style.margin = "0px";
    body.style.width = "100%";
    body.style.height = "100vh";

    // Dark Academia theme colors
    if (theme === 'dark') {
      // Deep brown background
      document.documentElement.style.setProperty('--background', "32 15% 16%"); // #34271f
      document.documentElement.style.setProperty('--foreground', "33 7% 21%"); // #393833
      document.documentElement.style.setProperty('--card', "32 15% 16%"); // #34271f
      document.documentElement.style.setProperty('--primary', "25 29% 28%"); // #5e4d33
      document.documentElement.style.setProperty('--secondary', "50 12% 19%"); // #383929
      document.documentElement.style.setProperty('--muted', "165 23% 11%"); // #17221c
      document.documentElement.style.setProperty('--accent', "9 43% 22%"); // #502a20
    } else {
      // Light mode colors
      document.documentElement.style.setProperty('--background', "35 50% 62%"); // #c6a477
      document.documentElement.style.setProperty('--foreground', "27 41% 37%"); // #875b36
      document.documentElement.style.setProperty('--card', "35 50% 62%"); // #c6a477
      document.documentElement.style.setProperty('--primary', "27 41% 37%"); // #875b36
      document.documentElement.style.setProperty('--secondary', "24 29% 42%"); // #8c6949
      document.documentElement.style.setProperty('--muted', "33 11% 37%"); // #6e614f
      document.documentElement.style.setProperty('--accent', "27 41% 37%"); // #875b36
    }

    // Smooth transition
    body.style.transition = "background-color .3s ease-in-out, color .3s ease-in-out";

  }, [theme]);

  return {
    theme,
    setTheme: useCallback((newTheme: Theme) => {
      setTheme(newTheme);
    }, [])
  };
}

export default useTheme;