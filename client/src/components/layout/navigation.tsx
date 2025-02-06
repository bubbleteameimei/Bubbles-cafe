import { useLocation } from "wouter";
import { Moon, Sun, Volume2, VolumeX, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; 
import { useTheme } from "@/hooks/use-theme";
import { useAudio } from "@/components/effects/audio";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function Navigation() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isPlaying, toggleAudio, volume, setVolume, audioReady } = useAudio();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

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
              href="/posts"
              className={location === "/posts" ? "text-primary" : "text-muted-foreground hover:text-primary"}
            >
              Posts
            </a>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>More <ChevronDown className="h-4 w-4 ml-2"/></NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[200px]">
                      <NavigationMenuLink asChild>
                        <a 
                          href="/secret"
                          className={`block p-2 hover:bg-accent rounded-md ${location === "/secret" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                        >
                          Secret Stories
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a 
                          href="/about"
                          className={`block p-2 hover:bg-accent rounded-md ${location === "/about" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                        >
                          About
                        </a>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <a 
                          href="/admin"
                          className={`block p-2 hover:bg-accent rounded-md ${location === "/admin" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                        >
                          Admin
                        </a>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAudio}
                disabled={!audioReady}
                className="relative"
                title={audioReady ? (isPlaying ? "Mute" : "Unmute") : "Audio loading..."}
              >
                {isPlaying ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
              <div className="w-24 hidden md:block">
                <Slider
                  defaultValue={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  disabled={!audioReady}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}