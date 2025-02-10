import { useLocation } from "wouter";
import { Moon, Sun, Volume2, VolumeX, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/hooks/use-theme";
import { useAudio } from "@/components/effects/audio";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NavLink = ({ href, isActive, children, onNavigate, className = "" }: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
  className?: string;
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
        nav-link relative px-3 py-2.5 text-base transition-colors duration-300 w-full text-left font-serif
        ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary"}
        hover:bg-primary/5 rounded-md ${className}
      `}
    >
      {children}
    </button>
  );
};

const NavigationItems = ({ location, onNavigate, isMobile = false }: {
  location: string,
  onNavigate?: () => void,
  isMobile?: boolean
}) => {
  return (
    <>
      <div className={`${isMobile ? '' : 'flex items-center space-x-1'}`}>
        <NavLink href="/" isActive={location === "/"} onNavigate={onNavigate}>Home</NavLink>
        <NavLink href="/stories" isActive={location === "/stories"} onNavigate={onNavigate}>Stories</NavLink>
        <NavLink href="/reader" isActive={location === "/reader"} onNavigate={onNavigate}>Reader</NavLink>
      </div>

      {isMobile && <div className="my-4 border-t border-border/20" />}

      <div className={`${isMobile ? '' : 'flex items-center space-x-1 ml-4'}`}>
        <NavLink href="/secret" isActive={location === "/secret"} onNavigate={onNavigate}>Secret Stories</NavLink>
        <NavLink href="/index" isActive={location === "/index"} onNavigate={onNavigate}>Index</NavLink>
      </div>

      {isMobile && <div className="my-4 border-t border-border/20" />}

      <div className={`${isMobile ? '' : 'flex items-center space-x-1 ml-4'}`}>
        <NavLink href="/about" isActive={location === "/about"} onNavigate={onNavigate}>About</NavLink>
        <NavLink href="/contact" isActive={location === "/contact"} onNavigate={onNavigate}>Contact</NavLink>
        <NavLink href="/admin" isActive={location === "/admin"} onNavigate={onNavigate}>Admin</NavLink>
      </div>
    </>
  );
};

export default function Navigation() {
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

  return (
    <header className="bg-background/95 backdrop-blur-sm theme-transition">
      <div className="relative h-32 sm:h-40 md:h-48 flex items-center justify-center bg-gradient-to-b from-background/50 to-background">
        <div className="text-center relative z-10 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 font-serif text-primary/90 hover:text-primary transition-colors duration-300">Bubble's Cafe</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground italic">What once was will never be again</p>
        </div>
      </div>

      <nav className="gothic-menu sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border/50">
        <div className="container mx-auto h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4">
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] pt-16 bg-background/95 backdrop-blur-lg">
                <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </SheetClose>
                <nav className="flex flex-col space-y-2">
                  <NavigationItems location={location} onNavigate={handleNavigation} isMobile={true} />
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex items-center flex-1">
            <NavigationItems location={location} />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Select value={selectedTrack} onValueChange={(value) => {
                console.log('Changing track to:', value);
                setSelectedTrack(value);
              }}>
                <SelectTrigger className="w-[120px] hover:bg-primary/10">
                  <SelectValue placeholder="Atmosphere" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ethereal">Ethereal</SelectItem>
                  <SelectItem value="Nocturnal">Nocturnal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                console.log('Toggle audio clicked');
                toggleAudio();
              }}
              disabled={!audioReady}
              className="hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95 rounded-full relative"
              title={audioReady ? (isPlaying ? "Pause Atmosphere" : "Play Atmosphere") : "Loading..."}
            >
              {!audioReady && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              )}
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
              className="hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95 rounded-full"
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
}