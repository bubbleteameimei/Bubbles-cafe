import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GlobalThemeToggleProps {
  className?: string;
}

export function GlobalThemeToggle({ className = "" }: GlobalThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`rounded-full p-2 ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}