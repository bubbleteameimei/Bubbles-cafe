// This is a placeholder file until Zustand is properly installed
// Using React's useState as a temporary solution

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Default state that will be replaced with proper Zustand store
let state: Theme = 'system';

// Mock Zustand store
export const useThemeStore = () => {
  return {
    theme: state,
    setTheme: (theme: Theme) => { state = theme; },
    toggleTheme: () => { 
      state = state === 'light' 
        ? 'dark' 
        : state === 'dark' 
          ? 'system' 
          : 'light'; 
    }
  };
};