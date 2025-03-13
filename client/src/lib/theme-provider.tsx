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

// Add these styles to the document head once on mount
const injectTransitionStyles = () => {
  // Check if styles already exist
  if (document.getElementById('theme-transition-styles')) return;
  
  const styleEl = document.createElement('style');
  styleEl.id = 'theme-transition-styles';
  styleEl.innerHTML = `
    html.theme-transition,
    html.theme-transition *,
    html.theme-transition *:before,
    html.theme-transition *:after {
      transition: background-color 150ms ease-out,
                  color 150ms ease-out,
                  border-color 150ms ease-out,
                  fill 150ms ease-out,
                  stroke 150ms ease-out !important;
    }
  `;
  document.head.appendChild(styleEl);
};

// Enhanced implementation for smoother theme transitions
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'system'
  );
  
  // Inject transition styles once on mount
  useEffect(() => {
    injectTransitionStyles();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Start transition
    root.classList.add('theme-transition');
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        // Start transition
        root.classList.add('theme-transition');
        
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
        
        // Remove transition class after animation completes
        setTimeout(() => {
          root.classList.remove('theme-transition');
        }, 150);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      root.classList.add(theme);
    }
    
    // Remove transition class after animation completes
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 150);
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