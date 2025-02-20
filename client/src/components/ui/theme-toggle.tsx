import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Toggle } from "./toggle";

interface ThemeToggleProps {
  variant?: 'full' | 'icon';
}

export function ThemeToggle({ variant = 'full' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <Toggle
        variant="ghost"
        onClick={toggleTheme}
        className="w-10 h-10 p-0"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Toggle>
    );
  }

  return (
    <Toggle
      variant="outline"
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 w-full text-base"
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
    </Toggle>
  );
}