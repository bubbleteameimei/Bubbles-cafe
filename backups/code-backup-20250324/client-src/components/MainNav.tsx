import { Link } from "wouter";
import { Menu, Search, Bell, User, Moon, Sun, Settings } from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export default function MainNav() {
  const sidebar = useSidebar();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'laptop' | 'desktop'>('desktop');
  
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

  return (
    <header 
      className={`sticky top-0 z-40 w-full border-b
                bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                transition-all duration-300 ease-in-out 
                dark:border-gray-800
                ${scrolled ? 'shadow-sm' : ''}`}
      data-device-type={deviceType}
    >
      <div className="container flex h-14 items-center justify-between px-2 sm:px-4 lg:px-6">
        {/* Left section with menu toggle for mobile/tablet */}
        <div className="flex items-center space-x-2">
          {/* Only show hamburger on mobile/tablet when sidebar is not visible by default */}
          {(deviceType === 'mobile' || deviceType === 'tablet') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => sidebar.setOpenMobile(true)}
              className="lg:hidden h-9 w-9 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-200 ease-in-out transform active:scale-95"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Logo/Home link - Always visible */}
          <Link href="/">
            <a className="flex items-center space-x-2 text-lg font-semibold tracking-tight text-foreground/90 hover:text-foreground transition-colors duration-200">
              {deviceType !== 'mobile' && (
                <span className="hidden sm:inline-block">Stories</span>
              )}
            </a>
          </Link>
        </div>
        
        {/* Center section - Search bar (only on larger screens) */}
        {deviceType !== 'mobile' && (
          <div className="flex-1 mx-4 max-w-lg hidden sm:flex items-center relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <input
                type="search"
                placeholder="Search stories..."
                className="w-full rounded-full bg-accent/20 text-foreground placeholder:text-foreground/50 
                          focus:bg-accent/30 focus:outline-none focus:ring-1 focus:ring-primary/50
                          px-4 py-2 pl-10 pr-4 text-sm lg:text-base
                          transition-all duration-200 ease-in-out
                          dark:bg-gray-800/30 dark:focus:bg-gray-800/50"
              />
            </div>
          </div>
        )}
        
        {/* Right section - Action buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Search icon on mobile only */}
          {deviceType === 'mobile' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-200 ease-in-out"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          {/* Theme toggle - visible on all screen sizes */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 text-foreground/80 hover:text-foreground hover:bg-accent/50
                      transition-all duration-200 ease-in-out"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 ease-in-out" />
            ) : (
              <Moon className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 ease-in-out" />
            )}
          </Button>
          
          {/* Notification icon - hidden on mobile */}
          {deviceType !== 'mobile' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-200 ease-in-out"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
          )}
          
          {/* User account button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-foreground/80 hover:text-foreground hover:bg-accent/50
                      transition-all duration-200 ease-in-out"
            aria-label="Account"
          >
            {user ? (
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground text-xs font-medium">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
            ) : (
              <User className="h-5 w-5" />
            )}
          </Button>
          
          {/* Settings button - only visible on larger screens */}
          {deviceType === 'desktop' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-200 ease-in-out"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}