// This file exists for backward compatibility with components that still use the old ThemeProvider
// It forwards to the new ThemeProvider implementation in components/theme-provider.tsx
import { type ReactNode } from "react";
import { 
  ThemeProvider as NewThemeProvider, 
  useTheme as useNewTheme
} from "../components/theme-provider";

interface ThemeProviderProps {
  children: ReactNode;
}

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Wrapper component that provides the old API with the new implementation
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NewThemeProvider>
      {children}
    </NewThemeProvider>
  );
}

// Wrapper hook that provides the old API with the new implementation
export const useTheme = (): ThemeContextValue => {
  const { theme, setTheme } = useNewTheme();
  
  // Add the toggleTheme function that old code expects
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    console.log(`Theme switched to: ${newTheme}`);
  };
  
  return {
    theme,
    setTheme,
    toggleTheme
  };
};