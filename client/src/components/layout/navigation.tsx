import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const items = [
    { href: '/', label: 'Home' },
    { href: '/reader', label: 'Reader' },
    { href: '/stories', label: 'Stories' },
    { href: '/index', label: 'Index' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
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
          href="/admin/dashboard" 
          isActive={location.startsWith("/admin")} 
          onNavigate={onNavigate}
          className="text-primary hover:text-primary/80 transition-colors"
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
  const [, setLocation] = useLocation();

  const handleAuthClick = () => {
    setLocation("/auth");
    setIsOpen(false);
  };

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

          <div className="hidden md:flex">
            <NavigationItems location={location} />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!user ? (
            <Button 
              variant="default" 
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              onClick={handleAuthClick}
            >
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