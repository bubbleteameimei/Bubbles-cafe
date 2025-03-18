import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface GlobalThemeToggleProps {
  className?: string;
  noOutline?: boolean;
}

export function GlobalThemeToggle({ className = "", noOutline = false }: GlobalThemeToggleProps) {
  const { toggleTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`w-7 h-7 rounded-md bg-transparent hover:bg-accent/20 active:bg-accent/30 touch-manipulation transition-all duration-150 ease-out active:scale-95 ${className}`}
      aria-label="Toggle theme"
      noOutline={noOutline}
    >
      <span className="relative">
        <Sun 
          className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0 dark:opacity-0"
          strokeWidth={1.75}
        />
        <Moon 
          className="absolute top-0 left-0 h-4 w-4 rotate-90 scale-0 opacity-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100 dark:opacity-100"
          strokeWidth={1.75}
        />
        <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 active:opacity-10 transition-opacity duration-150 rounded-md" />
      </span>
    </Button>
  );
}