"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "sky" | "eco" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored) return stored;
      const root = typeof document !== "undefined" ? document.documentElement : null;
      if (root) {
        if (root.classList.contains("dark")) return "dark";
        if (root.classList.contains("light")) return "light";
        if (root.classList.contains("sky")) return "sky";
        if (root.classList.contains("eco")) return "eco";
      }
    } catch {}
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Prevent transition flicker when switching themes
    const transitionStyle = document.createElement('style');
    transitionStyle.appendChild(document.createTextNode(`
      * {
        -webkit-transition: none !important;
        -moz-transition: none !important;
        -o-transition: none !important;
        -ms-transition: none !important;
        transition: none !important;
      }
    `));
    document.head.appendChild(transitionStyle);
    
    // Apply theme changes
    root.classList.remove("light", "dark", "sky", "eco");

    let removeListener: (() => void) | null = null;

    if (theme === "system") {
      const systemTheme: "dark" | "light" = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      root.style.colorScheme = systemTheme === "dark" ? "dark" : "light";
      
      // Listen for changes in system preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark", "sky", "eco");
        const newTheme = e.matches ? "dark" : "light";
        root.classList.add(newTheme);
        root.style.colorScheme = newTheme === "dark" ? "dark" : "light";
      };
      
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      removeListener = () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    } else {
      // Apply explicit theme
      root.classList.add(theme);
      root.style.colorScheme = theme === "dark" ? "dark" : "light";
    }
    
    // Restore transitions after theme change is complete
    const timeout = window.setTimeout(() => {
      document.head.removeChild(transitionStyle);
    }, 50);

    return () => {
      window.clearTimeout(timeout);
      if (removeListener) removeListener();
    };
  }, [theme, storageKey]);

  // Toggle between themes in a predictable cycle (dark → light → sky → eco → dark)
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const order: Theme[] = ["dark", "light", "sky", "eco"];
      // Resolve system to an explicit starting point
      const current = prevTheme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : prevTheme;
      const idx = order.indexOf(current);
      const next = order[(idx + 1) % order.length];
      localStorage.setItem(storageKey, next);
      return next;
    });
  };

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// This naming approach helps with Fast Refresh
function useThemeContext() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}

export { useThemeContext as useTheme };