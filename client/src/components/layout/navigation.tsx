import { useLocation } from "wouter";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export default function Navigation() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <a href="/" className="text-xl font-bold">Horror Blog</a>
          <a 
            href="/" 
            className={location === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"}
          >
            Home
          </a>
          <a 
            href="/secret"
            className={location === "/secret" ? "text-primary" : "text-muted-foreground hover:text-primary"}
          >
            Secret Stories
          </a>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </nav>
  );
}
