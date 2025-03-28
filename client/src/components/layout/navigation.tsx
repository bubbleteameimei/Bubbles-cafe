import { useEffect, useState, KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu, Search, Bell, Moon, Sun } from "lucide-react";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { useNotifications } from "@/contexts/notification-context";
import { useTheme } from "@/components/theme-provider";
import { useSidebar } from "@/components/ui/sidebar";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const { theme, setTheme } = useTheme();
  const sidebar = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'laptop' | 'desktop'>('desktop');
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Effect to detect scroll position for conditional styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to detect and update device type based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width >= 640 && width < 1024) {
        setDeviceType('tablet');
      } else if (width >= 1024 && width < 1280) {
        setDeviceType('laptop');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // Initial call
    handleResize();
    
    // Setup resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Navigation links for the nav bar
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/stories', label: 'Stories' },
    { href: '/reader', label: 'Reader' },
    { href: '/community', label: 'Community' },
    { href: '/about', label: 'About' }
  ];

  // Handle search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results page with search query
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      toast({
        title: "Searching...",
        description: `Finding content matching: "${searchQuery.trim()}"`,
        duration: 2000
      });
    }
  };

  // Handle search on enter key
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle mobile search button click
  const handleMobileSearchClick = () => {
    // Show a search dialog or expand the header to show search
    const searchPrompt = prompt("Search for keywords:");
    if (searchPrompt && searchPrompt.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchPrompt.trim())}`);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-40 w-full border-b 
                bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                transition-all duration-300 ease-in-out 
                ${scrolled ? 'shadow-sm' : ''}`}
      data-device-type={deviceType}
    >
      <div className="container flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section with menu toggle and logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                          transition-all duration-200 ease-in-out"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] md:w-[350px] max-w-[85vw] overflow-y-auto">
              <SidebarNavigation onNavigate={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
          
          {/* Site name/logo on mobile - no icon */}
          <button 
            onClick={() => setLocation('/')}
            className="lg:hidden flex items-center font-semibold tracking-tight hover:text-foreground transition-colors duration-200"
            aria-label="Home"
          >
            <span className="text-foreground/90 font-bold">Bubble's Cafe</span>
          </button>
          
          {/* Horizontal Nav - Desktop only */}
          <nav className="hidden lg:flex items-center space-x-3">
            {navLinks.map(link => (
              <button 
                key={link.href}
                onClick={() => setLocation(link.href)} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent/20
                          ${location === link.href 
                            ? 'text-primary font-semibold bg-accent/30 border border-border/30' 
                            : 'text-foreground/80 hover:text-foreground'}`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Center section - Search bar (tablet and up) */}
        {deviceType !== 'mobile' && (
          <div className="flex-1 mx-6 max-w-lg hidden sm:flex items-center">
            <div className="relative w-full flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <input
                type="search"
                placeholder="Search for keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-l-md bg-accent/20 text-foreground placeholder:text-foreground/50 
                         focus:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-primary/50
                         px-4 py-1.5 pl-10 text-sm"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSearch}
                className="rounded-l-none rounded-r-md h-9 text-foreground/80 hover:text-foreground hover:bg-accent/50 border-l border-border/30"
              >
                Search
              </Button>
            </div>
          </div>
        )}
        
        {/* Right section - Action buttons */}
        <div className="flex items-center space-x-3">
          {/* Mobile search button */}
          {deviceType === 'mobile' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMobileSearchClick}
              className="h-9 w-9 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          {/* Notifications */}
          <NotificationIcon 
            notifications={notifications} 
            className="h-9 w-9 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50" 
          />
          
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 transition-all" />
            ) : (
              <Moon className="h-5 w-5 transition-all" />
            )}
          </Button>
          
          {/* User/Auth button - restored blue styling */}
          {!user ? (
            <Button
              variant="default"
              onClick={() => setLocation("/auth")}
              className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider transition-all duration-150 ease-out active:scale-95 active:opacity-90"
              aria-label="Sign in"
            >
              Sign In
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/profile')}
              className="h-9 w-9 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50"
              aria-label="Profile"
            >
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground text-xs font-medium">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}