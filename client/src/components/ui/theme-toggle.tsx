import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { DayNightToggle } from "./day-night-toggle";
import "./theme-toggle.css";

interface ThemeToggleProps {
  variant?: 'full' | 'icon' | 'animated' | 'fancy' | 'day-night';
  className?: string;
}

export function ThemeToggle({ variant = 'day-night', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Use our new day-night toggle component as default
  if (variant === 'day-night') {
    return (
      <div className={className}>
        <DayNightToggle />
      </div>
    );
  }

  if (variant === 'fancy') {
    return (
      <button
        onClick={toggleTheme}
        className={`relative h-10 w-10 overflow-hidden rounded-full bg-transparent text-current 
                   hover:scale-105 active:scale-95 transition-transform duration-150 ${className}`}
        aria-label="Toggle theme"
      >
        <div className="relative h-full w-full">
          {/* Sun icon */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out
                      ${isDark ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Sun 
              size={20} 
              className="text-amber-400 filter drop-shadow-md" 
            />
          </div>
          
          {/* Moon icon */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out
                      ${isDark ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}
          >
            <Moon 
              size={20} 
              className="text-indigo-500 filter drop-shadow-md" 
            />
          </div>
        </div>
        
        {/* Background transition effect */}
        <div 
          className={`absolute inset-0 rounded-full ${
            isDark 
              ? 'bg-gradient-to-tr from-indigo-900/10 to-indigo-600/10 border border-indigo-500/20' 
              : 'bg-gradient-to-tr from-amber-500/10 to-amber-300/10 border border-amber-500/20'
          }`}
        />
      </button>
    );
  }

  if (variant === 'animated') {
    return (
      <div className={`theme-toggle-container ${className}`}>
        <label className="wrapper">
          <input
            type="checkbox"
            className="switch"
            checked={isDark}
            onChange={toggleTheme}
            aria-label="Toggle theme"
          />
        </label>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`theme-toggle-icon ${className}`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    );
  }

  // Full version with text
  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-full ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <>
          <Sun className="h-5 w-5" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}