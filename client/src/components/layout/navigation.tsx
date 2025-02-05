import { useLocation } from "wouter";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export default function Navigation() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-border">
      <div className="stained-glass-header h-48 flex items-center justify-center">
        <div className="text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">Bubble's Cafe</h1>
          <p className="text-lg md:text-xl text-gray-200">Thoughts and emotions made into art</p>
        </div>
      </div>

      <nav className="gothic-menu">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
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
            <a 
              href="/about"
              className={location === "/about" ? "text-primary" : "text-muted-foreground hover:text-primary"}
            >
              About
            </a>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={useAudio().toggleAudio}
            className="mr-2"
          >
            {useAudio().isPlaying ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </nav>
    </header>
  );
}