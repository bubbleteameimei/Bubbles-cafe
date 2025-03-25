import React from 'react';
import './day-night-toggle.css';
import { useTheme } from '../../components/theme-provider';

interface DayNightToggleProps {
  className?: string;
}

export function DayNightToggle({ className = '' }: DayNightToggleProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={`wrapper ${className}`}>
      <input 
        type="checkbox" 
        className="switch"
        checked={theme === 'dark'}
        onChange={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      />
    </div>
  );
}

export default DayNightToggle;