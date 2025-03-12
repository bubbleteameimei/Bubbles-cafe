
import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";
import "./theme-toggle.css";

interface ThemeToggleProps {
  variant?: 'full' | 'icon' | 'animated';
}

export function ThemeToggle({ variant = 'animated' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  
  // Toggle function for all variants
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (variant === 'animated') {
    return (
      <div className="theme-toggle-container">
        <div className="wrapper">
          <input
            type="checkbox"
            className="switch"
            checked={theme === 'dark'}
            onChange={toggleTheme}
            aria-label="Toggle theme"
          />
        </div>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className="theme-toggle-icon"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-full"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
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
