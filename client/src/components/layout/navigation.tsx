import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu, Search, Moon, Sun, User } from "lucide-react";
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

  // Effect to detect scroll position for conditional styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation links for the nav bar
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/stories', label: 'Stories' },
    { href: '/reader', label: 'Reader' },
    { href: '/community', label: 'Community' },
    { href: '/about', label: 'About' }
  ];

  // Handle search button click for all devices
  const handleSearchButtonClick = () => {
    // Show a search dialog or expand the header to show search
    const searchPrompt = prompt("Search for keywords:");
    if (searchPrompt && searchPrompt.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchPrompt.trim())}`);
    }
  };

  return (
    <header 
      className={`fixed top-0 z-40 w-screen border-b 
                bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                transition-all duration-300 ease-in-out 
                ${scrolled ? 'shadow-md' : ''}`}
      style={{
        width: "100vw",
        left: 0,
        right: 0,
        margin: 0,
        padding: 0
      }}
    >
      <div className="w-full flex h-16 items-center justify-between px-4">
        {/* Left section with menu toggle for all screen sizes */}
        <div className="flex items-center -mt-1">
          {/* Menu toggle for all devices */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/60 touch-manipulation
                          transition-all duration-200 ease-in-out active:scale-95 mt-2"
                aria-label="Open menu"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="p-0 w-[280px] max-w-[85vw]"
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
        <nav className="hidden lg:flex items-center space-x-4 -mt-1 absolute inset-0 justify-center">
          {navLinks.map(link => (
            <button 
              key={link.href}
              onClick={() => setLocation(link.href)} 
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-accent/30 mt-2
                        ${location === link.href 
                          ? 'text-primary font-semibold bg-accent/40 border border-border/40 shadow-sm' 
                          : 'text-foreground/80 hover:text-foreground'}`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        
        {/* Flex spacer - pushes content to the ends */}
        <div className="flex-1 lg:flex"></div>
        
        {/* Right section - Action buttons */}
        <div className="flex items-center space-x-2 -mt-1 ml-auto">
          {/* Search button - shown on all devices */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchButtonClick}
            className="h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                      transition-all duration-150 active:scale-95 mt-2"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Notifications */}
          <NotificationIcon 
            notifications={notifications} 
            className="h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50 
                      transition-all duration-150 active:scale-95 mt-2" 
          />
          
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                      transition-all duration-150 active:scale-95 mt-2"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 transition-all" />
            ) : (
              <Moon className="h-4 w-4 transition-all" />
            )}
          </Button>
          
          {/* User/Auth button with dropdown menu */}
          {!user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/auth")}
              className="h-9 w-9 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
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
                <DropdownMenuItem onClick={() => { (window as any).fetch && fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).finally(() => setLocation('/auth')); }}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}