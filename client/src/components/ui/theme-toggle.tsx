import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";
import "./theme-toggle.css";

interface ThemeToggleProps {
  variant?: 'icon' | 'animated';
}

export function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'animated') {
    return (
      <div className="wrapper">
        <input
          type="checkbox"
          className="switch"
          checked={theme === 'light'}
          onChange={toggleTheme}
          aria-label="Toggle theme"
        />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-icon"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}