
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <nav className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Bubble's Cafe</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent/50 hover:text-accent-foreground focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">
              {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
