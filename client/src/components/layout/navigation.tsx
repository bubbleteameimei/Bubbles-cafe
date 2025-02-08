import { useLocation } from "wouter";
import { Moon, Sun, Volume2, VolumeX, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/hooks/use-theme";
import { useAudio } from "@/components/effects/audio";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const NavLink = ({ href, isActive, children, onNavigate }: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
}) => {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.();
    setLocation(href);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <button
      onClick={handleClick}
      className={`
        nav-link relative px-3 py-2 text-base transition-colors duration-200 w-full text-left
        ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}
      `}
    >
      {children}
    </button>
  );
};

const Navigation = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isPlaying, toggleAudio, volume, setVolume, audioReady } = useAudio();
  const [isOpen, setIsOpen] = useState(false);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const handleNavigation = () => {
    setIsOpen(false);
  };

  const navigationItems = (onNavigate?: () => void) => (
    <>
      <NavLink href="/" isActive={location === "/"} onNavigate={onNavigate}>Home</NavLink>
      <NavLink href="/stories" isActive={location === "/stories"} onNavigate={onNavigate}>Stories</NavLink>
      <NavLink href="/schoop" isActive={location === "/schoop"} onNavigate={onNavigate}>Schoop</NavLink>
      <NavLink href="/secret" isActive={location === "/secret"} onNavigate={onNavigate}>Secret Stories</NavLink>
      <NavLink href="/about" isActive={location === "/about"} onNavigate={onNavigate}>About</NavLink>
      <NavLink href="/admin" isActive={location.startsWith("/admin")} onNavigate={onNavigate}>Admin</NavLink>
    </>
  );

  return (
    <header className="bg-background">
      <div className="relative h-48 flex items-center justify-center bg-gradient-to-b from-background/50 to-background">
        <div className="text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">Bubble's Cafe</h1>
          <p className="text-lg md:text-xl text-muted-foreground">Thoughts and emotions made into art</p>
        </div>
      </div>

      <nav className="gothic-menu sticky top-0 z-50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] pt-16">
                <nav className="flex flex-col space-y-4">
                  {navigationItems(handleNavigation)}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems()}
          </div>

          {/* Audio and Theme Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAudio}
              disabled={!audioReady}
              className="hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95"
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
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                disabled={!audioReady}
                className="cursor-pointer"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;