// Main theme provider implementation for the application
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const initialValue: ThemeContextValue = {
  theme: 'system',
  setTheme: () => null,
  toggleTheme: () => null
};

const ThemeContext = createContext<ThemeContextValue>(initialValue);

// Original implementation restored for better performance
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'system'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => {
      // If system, use detected system theme to determine toggle direction
      if (prevTheme === 'system') {
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemIsDark ? 'light' : 'dark';
      }
      // Otherwise toggle between light and dark
      return prevTheme === 'dark' ? 'light' : 'dark';
    });
  };
  
  const contextValue = {
    theme,
    setTheme: (t: Theme) => {
      localStorage.setItem('theme', t);
      setTheme(t);
    },
    toggleTheme
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
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