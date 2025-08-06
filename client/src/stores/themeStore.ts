import { create } from 'zustand';

interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Default state that will be replaced with proper Zustand store
let state: ThemeStore['theme'] = 'system';

// Mock Zustand store
export const useThemeStore = () => {
  return {
    theme: state,
    setTheme: (theme: ThemeStore['theme']) => { state = theme; },
    toggleTheme: () => { 
      state = state === 'light' 
        ? 'dark' 
        : state === 'dark' 
          ? 'system' 
          : 'light'; 
    }
  };
};