
// Theme toggle functionality
export type ThemeMode = 'dark-mode' | 'light-mode';

export const initializeTheme = (): ThemeMode => {
  // Check for saved theme in localStorage
  const savedTheme = localStorage.getItem('theme') as ThemeMode;
  
  // If no saved theme, use system preference or fallback to dark
  if (!savedTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark-mode' : 'light-mode';
  }
  
  return savedTheme;
};

export const toggleTheme = (currentTheme: ThemeMode): ThemeMode => {
  const newTheme: ThemeMode = currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
  
  // Apply theme to document body
  document.body.classList.remove(currentTheme);
  document.body.classList.add(newTheme);
  
  // Save to localStorage
  localStorage.setItem('theme', newTheme);
  
  return newTheme;
};

export const applyTheme = (theme: ThemeMode): void => {
  // Remove both possible themes
  document.body.classList.remove('dark-mode', 'light-mode');
  
  // Apply the selected theme
  document.body.classList.add(theme);
};
