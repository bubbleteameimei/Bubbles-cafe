
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { applyTheme, initializeTheme, toggleTheme, type ThemeMode } from '../lib/theme-toggle';

export const ThemeToggle: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('dark-mode');
  
  useEffect(() => {
    // Initialize theme on component mount
    const theme = initializeTheme();
    setCurrentTheme(theme);
    applyTheme(theme);
  }, []);
  
  const handleToggle = () => {
    const newTheme = toggleTheme(currentTheme);
    setCurrentTheme(newTheme);
  };
  
  return (
    <button
      onClick={handleToggle}
      className="theme-toggle-btn"
      aria-label={`Switch to ${currentTheme === 'dark-mode' ? 'light' : 'dark'} mode`}
      title={`Switch to ${currentTheme === 'dark-mode' ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: currentTheme === 'dark-mode' ? 'var(--text-color-dark)' : 'var(--text-color-light)'
      }}
    >
      {currentTheme === 'dark-mode' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
