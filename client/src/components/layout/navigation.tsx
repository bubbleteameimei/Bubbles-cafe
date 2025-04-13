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
      data-device-type={deviceType}
      style={{
        width: "100vw",
        left: 0,
        right: 0,
        margin: 0,
        padding: 0
      }}
    >
      <div className="w-full flex h-16 md:h-18 items-center justify-between px-4 sm:px-5 lg:px-6">
        {/* Left section with menu toggle only */}
        <div className="flex items-center -mt-1">
          {/* Mobile menu toggle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/60
                          transition-all duration-200 ease-in-out active:scale-95 mt-2"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] md:w-[350px] max-w-[85vw]">
              {/* Removed menu header as requested */}
              <div className="border-b border-border/30"></div>
              <SidebarNavigation onNavigate={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
          
        {/* Removed mobile navigation buttons as requested */}
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
        
        {/* Removed Enhanced Search bar from tablet and desktop */}
        
        {/* No need for additional spacer since we removed the mobile nav links */}
        
        {/* Right section - Action buttons */}
        <div className="flex items-center space-x-3 -mt-1 ml-auto pr-4">
          {/* Search button - shown on all devices */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchButtonClick}
            className="h-10 w-10 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                      transition-all duration-150 active:scale-95 mt-2"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Notifications */}
          <NotificationIcon 
            notifications={notifications} 
            className="h-10 w-10 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50 
                      transition-all duration-150 active:scale-95 mt-2" 
          />
          
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                      transition-all duration-150 active:scale-95 mt-2"
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
              className="h-10 px-5 bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider 
                        transition-all duration-150 ease-out active:scale-95 active:opacity-90 shadow-sm mt-2"
              aria-label="Sign in"
            >
              Sign In
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/profile')}
              className="h-10 w-10 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-150 active:scale-95 p-0 overflow-hidden mt-2"
              aria-label="Profile"
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
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground text-xs font-medium">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}