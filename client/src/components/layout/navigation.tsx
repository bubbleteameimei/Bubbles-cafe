import { useLocation } from "wouter";
import { Moon, Sun, Volume2, VolumeX, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/hooks/use-theme";
import { useAudio } from "@/components/effects/audio";
import { useState, useCallback, memo } from "react";
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

const NavLink = memo(({ href, isActive, children, onNavigate, className = "" }: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
  className?: string;
}) => {
  const [, setLocation] = useLocation();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.();
    setLocation(href);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [href, onNavigate, setLocation]);

  return (
    <button
      onClick={handleClick}
      className={`
        nav-link relative px-3 py-2 text-base transition-colors duration-300 w-full text-left font-serif tracking-wide
        ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary"}
        hover:bg-primary/5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${className}
      `}
      aria-current={isActive ? "page" : undefined}
      role="menuitem"
      tabIndex={0}
    >
      {children}
    </button>
  );
});

NavLink.displayName = "NavLink";

const NavigationItems = memo(({ location, onNavigate, isMobile = false }: {
  location: string,
  onNavigate?: () => void,
  isMobile?: boolean
}) => {
  return (
    <div role="menu" className={isMobile ? 'space-y-2' : 'flex items-center'} aria-label="Main navigation">
      <div className={`${isMobile ? 'space-y-1' : 'flex items-center space-x-1'}`}>
        <NavLink href="/" isActive={location === "/"} onNavigate={onNavigate}>Home</NavLink>
        <NavLink href="/stories" isActive={location === "/stories"} onNavigate={onNavigate}>Stories</NavLink>
        <NavLink href="/reader" isActive={location === "/reader"} onNavigate={onNavigate}>Reader</NavLink>
      </div>

      {isMobile && <div className="my-2 border-t border-border/20" aria-hidden="true" />}

      <div className={`${isMobile ? 'space-y-1' : 'flex items-center space-x-1 ml-4'}`}>
        <NavLink href="/secret" isActive={location === "/secret"} onNavigate={onNavigate}>Secret Stories</NavLink>
        <NavLink href="/index" isActive={location === "/index"} onNavigate={onNavigate}>Index</NavLink>
      </div>

      {isMobile && <div className="my-2 border-t border-border/20" aria-hidden="true" />}

      <div className={`${isMobile ? 'space-y-1' : 'flex items-center space-x-1 ml-4'}`}>
        <NavLink href="/about" isActive={location === "/about"} onNavigate={onNavigate}>About</NavLink>
        <NavLink href="/contact" isActive={location === "/contact"} onNavigate={onNavigate}>Contact</NavLink>
        <NavLink href="/admin" isActive={location === "/admin"} onNavigate={onNavigate}>Admin</NavLink>
      </div>
    </div>
  );
});

NavigationItems.displayName = "NavigationItems";

export default function Navigation() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isPlaying, toggleAudio, volume, setVolume, audioReady, selectedTrack, setSelectedTrack } = useAudio();
  const [isOpen, setIsOpen] = useState(false);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (value[0] >= 0 && value[0] <= 100) {
      setVolume(value[0] / 100);
    }
  }, [setVolume]);

  const handleNavigation = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const handleAudioToggle = useCallback(() => {
    if (audioReady) {
      toggleAudio();
    }
  }, [audioReady, toggleAudio]);

  return (
    <>
      {/* Sticky Header Content */}
      <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-background/95 backdrop-blur-md" role="banner">
        <div className="relative z-10">
          {/* Title Section */}
          <div className="container mx-auto py-6 px-4 text-center relative">
            <h1 className="font-serif text-4xl font-bold text-primary hover:text-primary/90 transition-colors duration-300 tracking-widest">
              Bubble's Cafe
            </h1>
            <p className="text-sm text-primary/90 italic font-serif tracking-wider mt-1">
              What once was will never be again
            </p>
          </div>

          {/* Navigation Section */}
          <nav 
            className="bg-background/95 backdrop-blur-md border-t border-border/10 shadow-sm"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="container mx-auto h-12 flex items-center justify-between px-4">
              <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95"
                      aria-label={isOpen ? "Close menu" : "Open menu"}
                      aria-expanded={isOpen}
                      aria-controls="mobile-menu"
                    >
                      <Menu className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent 
                    side="left" 
                    className="w-[80vw] pt-16 bg-background/95 backdrop-blur-lg"
                    id="mobile-menu"
                  >
                    <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none data-[state=open]:bg-secondary">
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
                  <Select 
                    value={selectedTrack} 
                    onValueChange={setSelectedTrack}
                    aria-label="Select atmosphere track"
                  >
                    <SelectTrigger className="w-[120px] hover:bg-primary/10 font-serif">
                      <SelectValue placeholder="Atmosphere" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ethereal" className="font-serif">Ethereal</SelectItem>
                      <SelectItem value="Nocturnal" className="font-serif">Nocturnal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAudioToggle}
                  disabled={!audioReady}
                  className="hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95 rounded-full relative"
                  aria-label={audioReady ? (isPlaying ? "Pause Atmosphere" : "Play Atmosphere") : "Loading audio..."}
                  aria-pressed={isPlaying}
                >
                  {!audioReady && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3" aria-hidden="true">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  )}
                  {isPlaying ? (
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <VolumeX className="h-4 w-4" aria-hidden="true" />
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
                    aria-label="Volume control"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={volume * 100}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleThemeToggle}
                  className="hover:bg-primary/10 transition-transform duration-200 hover:scale-105 active:scale-95 rounded-full"
                  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  aria-pressed={theme === "dark"}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      
    </>
  );
}