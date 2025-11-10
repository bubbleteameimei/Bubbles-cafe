"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";

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
  const mountedRef = useRef(false);
  const smoothTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;

    // Apply smooth color-only transitions during user-initiated theme changes (skip first mount)
    if (mountedRef.current) {
      try {
        root.classList.add("theme-smooth");
        if (smoothTimeoutRef.current != null) window.clearTimeout(smoothTimeoutRef.current);
        smoothTimeoutRef.current = window.setTimeout(() => {
          try {
            root.classList.remove("theme-smooth");
          } catch {}
          smoothTimeoutRef.current = null;
        }, 180); // shortened to match CSS 160ms for snappier transitions
      } catch {}
    } else {
      mountedRef.current = true;
    }

    // Apply theme classes
    root.classList.remove("light", "dark", "sky", "eco");

    let removeListener: (() => void) | null = null;

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const systemTheme: "dark" | "light" = mediaQuery.matches ? "dark" : "light";

      root.classList.add(systemTheme);
      root.style.colorScheme = systemTheme === "dark" ? "dark" : "light";

      // Listen for changes in system preference
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark", "sky", "eco");
        const newTheme = e.matches ? "dark" : "light";

        // Smooth transition for system-triggered changes as well
        try {
          root.classList.add("theme-smooth");
          if (smoothTimeoutRef.current != null) window.clearTimeout(smoothTimeoutRef.current);
          smoothTimeoutRef.current = window.setTimeout(() => {
            try {
              root.classList.remove("theme-smooth");
            } catch {}
            smoothTimeoutRef.current = null;
          }, 180);
        } catch {}

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

    return () => {
      if (smoothTimeoutRef.current != null) {
        window.clearTimeout(smoothTimeoutRef.current);
        smoothTimeoutRef.current = null;
        try {
          root.classList.remove("theme-smooth");
        } catch {}
      }
      if (removeListener) removeListener();
    };
  }, [theme]);

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