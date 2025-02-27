import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";
import "./theme-toggle.css";

interface ThemeToggleProps {
  variant?: 'full' | 'icon' | 'animated';
}

export function ThemeToggle({ variant = 'full' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'animated') {
    return (
      <div className="wrapper">
        <input
          type="checkbox"
          className="switch"
          checked={theme === 'dark'}
          onChange={toggleTheme}
          aria-label="Toggle theme"
        />
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
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-5 w-5" aria-hidden="true" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5" aria-hidden="true" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}