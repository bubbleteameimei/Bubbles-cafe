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

  return (
    <nav 
      role="menu" 
      className={`
        ${isMobile 
          ? 'flex flex-col space-y-6 px-8 py-8' 
          : 'flex items-center space-x-8'
        }
      `}
      aria-label="Main navigation"
    >
      <NavLink href="/" isActive={location === "/"} onNavigate={onNavigate}>Home</NavLink>
      <NavLink href="/stories" isActive={location === "/stories"} onNavigate={onNavigate}>Stories</NavLink>
      <NavLink href="/reader" isActive={location === "/reader"} onNavigate={onNavigate}>Reader</NavLink>
      <NavLink href="/index" isActive={location === "/index"} onNavigate={onNavigate}>Index</NavLink>
      {user?.isAdmin && (
        <NavLink 
          href="/admin" 
          isActive={location.startsWith("/admin")} 
          onNavigate={onNavigate} 
          className="text-amber-500 hover:text-amber-400 transition-colors font-medium"
        >
          Admin Dashboard
        </NavLink>
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
  const [, navigate] = useLocation();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.();
    navigate(href);
  }, [href, onNavigate, navigate]);

  return (
    <button
      onClick={handleClick}
      className={`
        group relative text-sm font-medium transition-all duration-200 ease-in-out
        ${isActive ? "text-foreground font-semibold" : "text-muted-foreground"}
        hover:text-foreground/90
        ${className}
      `}
      aria-current={isActive ? "page" : undefined}
      role="menuitem"
    >
      {children}
      <span 
        className={`
          absolute -bottom-1 left-0 h-[2px] w-full transform 
          origin-left transition-all duration-300 ease-out
          ${isActive ? 'bg-primary scale-x-100' : 'bg-primary/70 scale-x-0 group-hover:scale-x-100'}
        `}
      />
    </button>
  );
});

NavLink.displayName = "NavLink";

export default function Navigation() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] py-8">
                <div className="mt-6">
                  <NavigationItems location={location} onNavigate={() => setIsOpen(false)} isMobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="text-lg font-bold text-primary hover:text-primary/90 transition-colors tracking-wide"
          >
            BUBBLE'S CAFE
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:flex-1 md:justify-center">
            <NavigationItems location={location} />
          </div>

          {/* Auth & Theme Toggle */}
          <div className="flex items-center gap-4">
            {!user ? (
              <Button
                variant="default"
                onClick={() => navigate('/auth')}
                size="sm"
                className="font-medium px-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                Sign In
              </Button>
            ) : (
              <Button 
                variant="ghost"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                size="sm"
                className="font-medium hover:bg-accent px-4 transition-all duration-200"
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="relative w-16 h-8 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 cursor-pointer transition-all duration-300 ease-in-out"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div 
                className={`
                  absolute left-1 top-1 w-6 h-6 rounded-full 
                  transform transition-all duration-500 ease-in-out
                  ${theme === "dark" 
                    ? "translate-x-8 rotate-[360deg] bg-[#F1C64B]" 
                    : "translate-x-0 bg-white"
                  }
                `}
              >
                {/* Sun rays or moon craters */}
                <div className="relative w-full h-full">
                  {theme === "dark" ? (
                    // Moon craters
                    <>
                      <span className="absolute top-1 left-1 w-1 h-1 rounded-full bg-purple-300/60" />
                      <span className="absolute bottom-2 right-1 w-1.5 h-1.5 rounded-full bg-purple-300/60" />
                      <span className="absolute top-2 right-2 w-1 h-1 rounded-full bg-purple-300/60" />
                    </>
                  ) : (
                    // Sun rays
                    <>
                      {[...Array(8)].map((_, i) => (
                        <span
                          key={i}
                          className="absolute w-1 h-1 bg-amber-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: `rotate(${i * 45}deg) translateY(-8px)`
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}