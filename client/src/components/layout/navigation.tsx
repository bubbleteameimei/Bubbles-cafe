import { useLocation } from "wouter";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useState, useCallback, memo } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const NavigationItems = memo(({ location, onNavigate, isMobile = false }: {
  location: string,
  onNavigate?: () => void,
  isMobile?: boolean
}) => {
  const [, setLocation] = useLocation();

  return (
    <nav 
      role="menu" 
      className={isMobile ? 'space-y-4 pt-4' : 'flex items-center'} 
      aria-label="Main navigation"
    >
      <div className={`${isMobile ? 'space-y-2' : 'flex items-center space-x-1'}`}>
        <NavLink href="/" isActive={location === "/"} onNavigate={onNavigate}>Home</NavLink>
        <NavLink href="/index" isActive={location === "/index"} onNavigate={onNavigate}>Index</NavLink>
        <NavLink href="/reader" isActive={location === "/reader"} onNavigate={onNavigate}>Reader</NavLink>
      </div>

      {isMobile && <div className="my-4 border-t border-border/20" aria-hidden="true" />}

      <div className={`${isMobile ? 'space-y-2' : 'flex items-center space-x-1 ml-4'}`}>
        <NavLink href="/stories" isActive={location === "/stories"} onNavigate={onNavigate}>Stories</NavLink>
        <NavLink href="/community" isActive={location === "/community"} onNavigate={onNavigate}>Community</NavLink>
      </div>

      {isMobile && <div className="my-4 border-t border-border/20" aria-hidden="true" />}

      <div className={`${isMobile ? 'space-y-2' : 'flex items-center space-x-1 ml-4'}`}>
        <NavLink href="/about" isActive={location === "/about"} onNavigate={onNavigate}>About</NavLink>
        <NavLink href="/contact" isActive={location === "/contact"} onNavigate={onNavigate}>Contact</NavLink>
        <NavLink href="/admin" isActive={location === "/admin"} onNavigate={onNavigate}>Admin</NavLink>
      </div>
    </nav>
  );
});

NavigationItems.displayName = "NavigationItems";

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
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLocation(href);
  }, [href, onNavigate, setLocation]);

  return (
    <button
      onClick={handleClick}
      className={`
        relative px-3 py-2 text-sm transition-colors duration-300 w-full text-left tracking-wide font-medium
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

export default function Navigation() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-14 flex items-center justify-between px-4">
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-primary/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80vw] pt-12">
              <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
              <NavigationItems location={location} onNavigate={handleNavigation} isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex-1 flex justify-center md:justify-start">
          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
              setLocation('/');
            }}
            className="text-lg font-semibold text-primary hover:text-primary/90 transition-colors duration-300 tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md px-2"
          >
            Bubble's Cafe
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center flex-1 justify-center">
          <NavigationItems location={location} />
        </div>

        {/* Theme Toggle */}
        <div className="flex-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="hover:bg-primary/10"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}