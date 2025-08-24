import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu, Search, Moon, Sun, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { useNotifications } from "@/contexts/notification-context";
import { useTheme } from "@/components/theme-provider";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const { theme, setTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  
  // Reader progress removed

  // Effect to detect scroll position for conditional styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep sidebar open on desktop unless explicitly toggled
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        // Ensure overlay doesn't close it; keep open
        setIsOpen(true);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOpen]);

  // Navigation links for the nav bar
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/stories', label: 'Stories' },
    { href: '/reader', label: 'Reader' },
    { href: '/community', label: 'Community' },
    { href: '/about', label: 'About' }
  ];

  // Prefetch route chunks on hover/focus for faster navigations
  const prefetchRoute = (href: string) => {
    try {
      switch (href) {
        case '/stories':
          void import('../../pages/index');
          break;
        case '/reader':
          void import('../../pages/reader');
          break;
        case '/community':
          void import('../../pages/community');
          break;
        case '/about':
          void import('../../pages/about');
          break;
        case '/contact':
          void import('../../pages/contact');
          break;
        case '/search':
          void import('../../pages/search-results');
          break;
        default:
          break;
      }
    } catch {}
  };

  const [showInlineSearch, setShowInlineSearch] = useState(false);
  const [inlineQuery, setInlineQuery] = useState("");

  return (
    <header 
      className={`w-screen relative top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-clip ${scrolled ? 'shadow-md' : ''}`}
      style={{ position: 'relative', left: 0, right: 0, margin: 0, padding: 0, width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
    >
      <div className="w-full flex h-16 items-center justify-between px-0 main-header border-b border-border/50">
        {/* Left section with menu toggle for all screen sizes */}
        <div className="flex items-center -mt-1 ml-2 sm:ml-3">
          {/* Menu toggle for all devices */}
          <Sheet open={isOpen} onOpenChange={(next) => {
            // On desktop, only the button should close the sheet
            if (window.innerWidth >= 1024) {
              // If next is false due to overlay/escape, ignore
              const activelyToggling = (document.activeElement && (document.activeElement as HTMLElement).closest('[aria-label="Open menu"]'));
              if (!next && !activelyToggling) return;
            }
            setIsOpen(next);
          }}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-md border border-transparent text-foreground/80 hover:text-foreground hover:bg-accent/60 touch-manipulation
                          transition-all duration-200 ease-in-out active:scale-95 mt-2 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-label="Open menu"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                onClick={() => setIsOpen((v) => !v)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="p-0 w-[280px] max-w-[85vw] h-full"
            >
              {/* Sidebar navigation for all screen sizes */}
              <div className="border-b border-border/30"></div>
              <SidebarNavigation onNavigate={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
          
        {/* Mobile navigation buttons - hidden on larger screens */}
        <div className="lg:hidden flex-1 flex items-center justify-center">
          {/* Empty container to maintain layout spacing */}
        </div>
        
        {/* Horizontal Nav - Desktop only - moved more to the right */}
        <nav aria-label="Main" className="hidden lg:flex items-center space-x-3 -mt-1 absolute inset-0 justify-center">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative h-12 px-4 inline-flex items-center rounded-md text-sm font-medium transition-colors hover:bg-accent/30 mt-2 border border-transparent
                        ${location === href
                          ? 'text-primary font-semibold bg-accent/40 border border-border/40 shadow-sm after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary' 
                          : 'text-foreground/80 hover:text-foreground'}`}
              aria-current={location === href ? 'page' : undefined}
              onMouseEnter={() => prefetchRoute(href)}
              onFocus={() => prefetchRoute(href)}
            >
              {label}
            </Link>
          ))}
        </nav>
        
        {/* Flex spacer - pushes content to the ends */}
        <div className="flex-1 lg:flex"></div>
        
        {/* Right section - Action buttons */}
        <div className="flex items-center space-x-2 -mt-1 ml-auto pr-2">
          {/* Search icon button - restored */}
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all duration-150 active:scale-95 mt-2"
            aria-label="Search"
            onMouseEnter={() => prefetchRoute('/search')}
            onFocus={() => prefetchRoute('/search')}
            onClick={() => setLocation('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>
          {/* Inline desktop search */}
          <div className="hidden lg:flex items-center transition-all duration-200 ease-out w-28 focus-within:w-56 mr-2">
            <Input
              value={inlineQuery}
              onChange={(e) => setInlineQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = encodeURIComponent(inlineQuery.trim());
                  setLocation(q ? `/search?q=${q}` : '/search');
                }
              }}
              placeholder="Search..."
              className="h-9 text-sm bg-background/70 border-border/40"
            />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            {Array.isArray(notifications) && notifications.some((n) => !n.read) && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
            <NotificationIcon 
              notifications={notifications} 
              className="h-12 w-12 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50 
                        transition-all duration-150 active:scale-95 mt-2" 
            />
          </div>
          
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-12 w-12 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                      transition-all duration-150 active:scale-95 mt-2"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 transition-all" />
            ) : (
              <Moon className="h-5 w-5 transition-all" />
            )}
          </Button>
          
          {/* User/Auth button with dropdown menu */}
          {!user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/auth")}
              className="h-12 w-12 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-150 active:scale-95 mt-2"
              aria-label="Sign in"
            >
              <User className="h-5 w-5" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                            transition-all duration-150 active:scale-95 p-0 overflow-hidden mt-2"
                  aria-label="Account menu"
                >
                  {user.avatar ? (
                    <div className="h-full w-full overflow-hidden rounded-full">
                      <img 
                        src={user.avatar} 
                        alt={`${user.username}'s avatar`}
                        className="h-full w-full object-cover" 
                        width={36}
                        height={36}
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground text-xs font-medium">
                      {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/settings/profile')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    // Ensure the call is treated as a statement
                    void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                      .finally(() => setLocation('/auth'));
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Reading progress removed per request */}
    </header>
  );
}