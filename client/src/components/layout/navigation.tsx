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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { isPlaying, toggleAudio, volume, setVolume, audioReady, selectedTrack, setSelectedTrack } = useAudio();
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
      <NavLink href="/secret" isActive={location === "/secret"} onNavigate={onNavigate}>Secret Stories</NavLink>
      <NavLink href="/about" isActive={location === "/about"} onNavigate={onNavigate}>About</NavLink>
      <NavLink href="/contact" isActive={location === "/contact"} onNavigate={onNavigate}>Contact</NavLink>
      <NavLink href="/admin" isActive={location.startsWith("/admin")} onNavigate={onNavigate}>Admin</NavLink>
    </>
  );

  return (
    <header className="bg-background theme-transition">
      <div className="relative h-32 sm:h-40 md:h-48 flex items-center justify-center bg-gradient-to-b from-background/50 to-background">
        <div className="text-center relative z-10 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2">Bubble's Cafe</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">Thoughts and emotions made into art</p>
        </div>
      </div>

      <nav className="gothic-menu sticky top-0 z-50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4">
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] pt-16">
                <nav className="flex flex-col space-y-2">
                  {navigationItems(handleNavigation)}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navigationItems()}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2"> {/* Removed hidden md:flex */}
              <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="13 Angels">13 Angels</SelectItem>
                  <SelectItem value="Whispering Wind">Whispering Wind</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAudio}
              disabled={!audioReady}
              className="hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95"
              title={audioReady ? (isPlaying ? "Mute" : "Unmute") : "Audio loading..."}
            >
              {isPlaying ? (
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>

            <div className="w-16 sm:w-24 hidden md:block">
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
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;