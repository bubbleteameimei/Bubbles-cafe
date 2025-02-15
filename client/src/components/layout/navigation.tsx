import { useLocation } from "wouter";
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useState, useCallback, memo } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const NavigationItems = memo(({ location, onNavigate, isMobile = false }: {
  location: string,
  onNavigate?: () => void,
  isMobile?: boolean
}) => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <nav 
      role="menu" 
      className={isMobile ? 'flex flex-col space-y-4' : 'flex items-center space-x-6'} 
      aria-label="Main navigation"
    >
      <NavLink href="/" isActive={location === "/"} onNavigate={onNavigate}>Home</NavLink>
      <NavLink href="/stories" isActive={location === "/stories"} onNavigate={onNavigate}>Stories</NavLink>
      <NavLink href="/reader" isActive={location === "/reader"} onNavigate={onNavigate}>Reader</NavLink>
      <NavLink href="/secret-stories" isActive={location === "/secret-stories"} onNavigate={onNavigate}>Secret Stories</NavLink>
      <NavLink href="/index" isActive={location === "/index"} onNavigate={onNavigate}>Index</NavLink>
      {user?.isAdmin && (
        <NavLink href="/admin" isActive={location === "/admin"} onNavigate={onNavigate}>Admin</NavLink>
      )}
      <NavLink href="/about" isActive={location === "/about"} onNavigate={onNavigate}>About</NavLink>
      <NavLink href="/contact" isActive={location === "/contact"} onNavigate={onNavigate}>Contact</NavLink>
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
    setLocation(href);
  }, [href, onNavigate, setLocation]);

  return (
    <button
      onClick={handleClick}
      className={`
        text-sm font-medium transition-colors
        ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary"}
        ${className}
      `}
      aria-current={isActive ? "page" : undefined}
      role="menuitem"
    >
      {children}
    </button>
  );
});

NavLink.displayName = "NavLink";

export default function Navigation() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <div className="mt-6">
                  <NavigationItems location={location} onNavigate={() => setIsOpen(false)} isMobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <button
            onClick={() => setLocation('/')}
            className="text-lg font-bold text-primary"
          >
            BUBBLE'S CAFE
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:flex-1 md:justify-center">
            <NavigationItems location={location} />
          </div>

          {/* Auth & Theme Toggle */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <Button
                variant="default"
                onClick={() => setLocation('/auth')}
                className="hidden md:inline-flex"
              >
                Sign In
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="h-9 w-9"
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
      </div>
    </header>
  );
}