import { useLocation } from "wouter";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; 
import { useTheme } from "@/hooks/use-theme";
import { useAudio } from "@/components/effects/audio";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { useState, useCallback, memo } from "react";

const NavLink = memo(({ href, isActive, children }: { 
  href: string; 
  isActive: boolean; 
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className={`nav-link ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
  >
    {children}
  </a>
));

NavLink.displayName = "NavLink";

const Navigation = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isPlaying, toggleAudio, volume, setVolume, audioReady } = useAudio();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0] / 100);
  }, [setVolume]);

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  return (
    <header className="border-b border-border">
      <div className="relative h-48 flex items-center justify-center bg-gradient-to-b from-background/50 to-background">
        <div className="text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">Bubble's Cafe</h1>
          <p className="text-lg md:text-xl text-muted-foreground">Thoughts and emotions made into art</p>
        </div>
      </div>

      <nav className="gothic-menu">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavLink href="/" isActive={location === "/"}>
                  Home
                </NavLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavLink href="/posts" isActive={location === "/posts"}>
                  Posts
                </NavLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger onClick={handleMenuToggle}>
                  More
                </NavigationMenuTrigger>
                {isMenuOpen && (
                  <NavigationMenuContent>
                    <div className="min-w-[200px] p-4 space-y-3">
                      <NavLink href="/about" isActive={location === "/about"}>
                        About
                      </NavLink>
                      <NavLink href="/admin/login" isActive={location === "/admin"}>
                        Admin
                      </NavLink>
                    </div>
                  </NavigationMenuContent>
                )}
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

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
              onClick={handleThemeToggle}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default memo(Navigation);