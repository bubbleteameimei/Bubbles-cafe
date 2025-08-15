import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu, Search, Moon, Sun, User } from "lucide-react";
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
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'laptop' | 'desktop'>('desktop');
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  // Effect to detect scroll position for conditional styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced device detection with orientation support
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Check if mobile is in landscape mode
      if (width < 640 && width > height) {
        setIsMobileLandscape(true);
      } else {
        setIsMobileLandscape(false);
      }
      
      // Enhanced device type detection
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width >= 640 && width < 768) {
        setDeviceType('tablet');
      } else if (width >= 768 && width < 1024) {
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

  // Handle search button click for all devices
  const handleSearchButtonClick = () => {
    // Show a search dialog or expand the header to show search
    const searchPrompt = prompt("Search for keywords:");
    if (searchPrompt && searchPrompt.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchPrompt.trim())}`);
    }
  };

  // Get responsive classes based on device type
  const getResponsiveClasses = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          navHeight: 'h-16',
          buttonSize: 'h-10 w-10',
          iconSize: 'h-5 w-5',
          sheetWidth: 'w-[280px]',
          padding: 'px-2'
        };
      case 'tablet':
        return {
          navHeight: 'h-18',
          buttonSize: 'h-11 w-11',
          iconSize: 'h-5 w-5',
          sheetWidth: 'w-[350px]',
          padding: 'px-4'
        };
      case 'laptop':
        return {
          navHeight: 'h-18',
          buttonSize: 'h-11 w-11',
          iconSize: 'h-5 w-5',
          sheetWidth: 'w-[380px]',
          padding: 'px-6'
        };
      case 'desktop':
        return {
          navHeight: 'h-20',
          buttonSize: 'h-12 w-12',
          iconSize: 'h-6 w-6',
          sheetWidth: 'w-[400px]',
          padding: 'px-8'
        };
      default:
        return {
          navHeight: 'h-16',
          buttonSize: 'h-10 w-10',
          iconSize: 'h-5 w-5',
          sheetWidth: 'w-[280px]',
          padding: 'px-2'
        };
    }
  };

  const responsiveClasses = getResponsiveClasses();

  return (
    <header 
      className={`fixed top-0 z-40 w-screen border-b 
                bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                transition-all duration-300 ease-in-out 
                ${scrolled ? 'shadow-md' : ''}`}
      data-device-type={deviceType}
      data-mobile-landscape={isMobileLandscape}
      style={{
        width: "100vw",
        left: 0,
        right: 0,
        margin: 0,
        padding: 0
      }}
    >
      <div className={`w-full flex ${responsiveClasses.navHeight} items-center justify-between ${responsiveClasses.padding}`}>
        {/* Left section with menu toggle for all screen sizes */}
        <div className="flex items-center -mt-1">
          {/* Menu toggle for all devices */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${responsiveClasses.buttonSize} rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/60
                          transition-all duration-200 ease-in-out active:scale-95 mt-2 touch-friendly`}
                aria-label="Open menu"
              >
                <Menu className={responsiveClasses.iconSize} />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className={`p-0 ${responsiveClasses.sheetWidth} max-w-[85vw] ${deviceType === 'mobile' ? 'animate-mobile' : deviceType === 'tablet' ? 'animate-tablet' : 'animate-desktop'}`}
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
                          : 'text-foreground/80 hover:text-foreground'} hover-enhanced`}
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
            className={`h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                      transition-all duration-150 active:scale-95 mt-2 touch-friendly`}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Notifications */}
          <NotificationIcon 
            notifications={notifications} 
            className={`h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50 
                      transition-all duration-150 active:scale-95 mt-2 touch-friendly`} 
          />
          
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                      transition-all duration-150 active:scale-95 mt-2 touch-friendly`}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 transition-all" />
            ) : (
              <Moon className="h-4 w-4 transition-all" />
            )}
          </Button>
          
          {/* User/Auth button - icon styling to match other buttons */}
          {!user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/auth")}
              className={`h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-150 active:scale-95 mt-2 touch-friendly`}
              aria-label="Sign in"
            >
              <User className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/profile')}
              className={`h-8 w-8 rounded-md border border-border/30 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-150 active:scale-95 p-0 overflow-hidden mt-2 touch-friendly`}
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
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground text-xs font-medium">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile landscape optimization */}
      {isMobileLandscape && (
        <div className="lg:hidden px-2 py-1 bg-muted/50 border-t border-border/30">
          <div className="text-xs text-muted-foreground text-center">
            Landscape mode - Consider rotating device for better experience
          </div>
        </div>
      )}
    </header>
  );
}