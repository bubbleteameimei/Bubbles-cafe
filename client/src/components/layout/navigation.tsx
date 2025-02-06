import { useLocation } from "wouter";
import { Moon, Sun, Volume2, VolumeX, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; 
import { useTheme } from "@/hooks/use-theme";
import { useAudio } from "@/components/effects/audio";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback, useState, memo, useMemo } from "react";

const NavLink = memo(({ href, isActive, children, onClick }: { 
  href: string; 
  isActive: boolean; 
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const [, setLocation] = useLocation();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      setLocation(href);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [href, onClick, setLocation]);

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`
        nav-link relative px-3 py-2 text-base transition-colors duration-300
        ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}
      `}
    >
      {children}
    </a>
  );
});

NavLink.displayName = "NavLink";

const Navigation = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isPlaying, toggleAudio, volume, setVolume, audioReady } = useAudio();
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0] / 100);
  }, [setVolume]);

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const handleAudioToggle = useCallback(() => {
    toggleAudio();
  }, [toggleAudio]);

  const handleNavClick = useCallback((href: string) => {
    setLocation(href);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setLocation]);

  // Memoize NavigationContent for better performance
  const NavigationContent = useMemo(() => (
    <>
      <NavLink href="/" isActive={location === "/"} onClick={() => handleNavClick("/")}>
        Home
      </NavLink>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={`nav-link px-3 py-2 text-base transition-colors duration-300 ${
              location.startsWith("/posts") ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            Posts <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleNavClick("/posts/latest")}>
            Latest Posts
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavClick("/posts/horror")}>
            Horror Stories
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavClick("/posts/psychological")}>
            Psychological Tales
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavClick("/posts/excerpts")}>
            Story Excerpts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NavLink href="/about" isActive={location === "/about"} onClick={() => handleNavClick("/about")}>
        About
      </NavLink>
      <NavLink href="/secret" isActive={location === "/secret"} onClick={() => handleNavClick("/secret")}>
        Secret Stories
      </NavLink>
      <NavLink 
        href="/admin/login" 
        isActive={location.startsWith("/admin")}
        onClick={() => handleNavClick("/admin/login")}
      >
        Admin
      </NavLink>
    </>
  ), [location, handleNavClick]);

  return (
    <header className="bg-background">
      <div className="relative h-48 flex items-center justify-center bg-gradient-to-b from-background/50 to-background">
        <div className="text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">Bubble's Cafe</h1>
          <p className="text-lg md:text-xl text-muted-foreground">Thoughts and emotions made into art</p>
        </div>
      </div>

      <nav className="gothic-menu sticky top-0 z-50">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          {/* Mobile Menu - Optimized with smooth transitions */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-primary/10 transition-colors duration-200"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] pt-16">
                <nav className="flex flex-col space-y-4">
                  {NavigationContent}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {NavigationContent}
          </div>

          {/* Controls - Optimized with better transitions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAudioToggle}
                disabled={!audioReady}
                className="relative group hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95"
                title={audioReady ? (isPlaying ? "Mute" : "Unmute") : "Audio loading..."}
              >
                {isPlaying ? (
                  <Volume2 className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                ) : (
                  <VolumeX className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
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
              className="transition-all duration-200 hover:bg-primary/10 hover:scale-105 active:scale-95"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 transition-transform duration-200" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-200" />
              )}
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default memo(Navigation);