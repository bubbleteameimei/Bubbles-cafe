import { useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, memo } from "react";
import { useAuth } from "@/hooks/use-auth";
import ThemeToggle from "@/components/ui/theme-toggle";
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

  const items = [
    { href: '/', label: 'Home' },
    { href: '/stories', label: 'Stories' },
    { href: '/reader', label: 'Reader' },
    { href: '/index', label: 'Index' },
    { href: '/community', label: 'Community' }
  ];

  return (
    <nav 
      role="menu" 
      className={`
        ${isMobile 
          ? 'flex flex-col space-y-4 px-6 py-6' 
          : 'flex items-center space-x-6'
        }
      `}
      aria-label="Main navigation"
    >
      {items.map(item => (
        <NavLink 
          key={item.href}
          href={item.href} 
          isActive={location === item.href} 
          onNavigate={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
      {user?.isAdmin && (
        <NavLink 
          href="/admin" 
          isActive={location.startsWith("/admin")} 
          onNavigate={onNavigate}
          className="text-amber-500 hover:text-amber-400 transition-colors"
        >
          Admin
        </NavLink>
      )}
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
        text-sm font-medium transition-colors
        ${isActive 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground/80"
        }
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
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[280px]">
              <NavigationItems location={location} onNavigate={() => setIsOpen(false)} isMobile />
            </SheetContent>
          </Sheet>

          <button
            onClick={() => navigate('/')}
            className="font-bold text-lg cursor-pointer hover:text-primary/90 transition-colors"
          >
            HORROR STORIES
          </button>

          <div className="hidden md:flex">
            <NavigationItems location={location} />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {!user ? (
            <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}