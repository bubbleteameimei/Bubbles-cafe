import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import theme from "./theme";

type Theme = 'dark' | 'light';

interface ThemeProviderProps {
  children: ReactNode;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'dark'; // Default to dark theme
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    const colors = theme.colors[currentTheme];

    // Remove both theme classes first
    root.classList.remove('light', 'dark');
    // Add current theme class
    root.classList.add(currentTheme);

    // Apply theme colors as CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    localStorage.setItem('theme', currentTheme);

    // Log theme change in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Theme updated:', { theme: currentTheme, colors });
    }
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme: currentTheme, 
        setTheme: setCurrentTheme,
        toggleTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};