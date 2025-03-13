import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GlobalThemeToggleProps {
  className?: string;
}

export function GlobalThemeToggle({ className = "" }: GlobalThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`relative overflow-hidden border border-border/30 shadow-sm rounded-md hover:shadow-md transition-all duration-300 ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <Sun 
          className="h-5 w-5 absolute top-0 left-0 transition-all duration-300 ease-out"
          style={{
            opacity: theme === 'dark' ? 1 : 0,
            transform: theme === 'dark' ? 'scale(1) rotate(0)' : 'scale(0.7) rotate(-45deg)',
          }}
        />
        <Moon 
          className="h-5 w-5 absolute top-0 left-0 transition-all duration-300 ease-out" 
          style={{
            opacity: theme === 'light' ? 1 : 0,
            transform: theme === 'light' ? 'scale(1) rotate(0)' : 'scale(0.7) rotate(45deg)',
          }}
        />
      </div>
      <span className="sr-only">
        {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  );
}