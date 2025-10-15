import { Link, useLocation } from "wouter";
import { Menu, Search, Bell, User, Moon, Sun, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "./ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";

export default function MainNav() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'laptop' | 'desktop'>('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  
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

  // Close sidebar on route changes to prevent layout reflow and clear any transient body styles
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
    try {
      document.body.style.paddingRight = '';
    } catch {}
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full border-b
                  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                  transition-all duration-300 ease-in-out 
                  dark:border-gray-800
                  ${scrolled ? 'shadow-sm' : ''}`}
        data-device-type={deviceType}
      >
        <div className="container flex h-14 items-center justify-between px-2 sm:px-4 lg:px-6">
          {/* Left section with sidebar toggle */}
          <div className="flex items-center space-x-2">
            {/* Sidebar button - opens unified sidebar on all devices */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-200 ease-in-out transform active:scale-95
                        focus:outline-none focus:ring-0 focus-visible:ring-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo/Home link - Always visible */}
            <Link href="/">
              <a className="flex items-center space-x-2 text-lg font-semibold tracking-tight text-foreground/90 hover:text-foreground transition-colors duration-200">
                {deviceType !== 'mobile' && (
                  <span className="hidden sm:inline-block">Stories</span>
                )}
              </a>
            </Link>
          </div>
          
          {/* Center section - Empty on all screens */}
          <div className="flex-1 mx-4"></div>
          
          {/* Right section - Action buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Search icon on all devices */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-0 focus-visible:ring-0"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Theme toggle - visible on all screen sizes */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 text-foreground/80 hover:text-foreground hover:bg-accent/50
                        transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-0 focus-visible:ring-0"
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
                          transition-all duration-200 ease-in-out
                          focus:outline-none focus:ring-0 focus-visible:ring-0"
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
                        transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-0 focus-visible:ring-0"
              aria-label="Account"
              onClick={() => {
                // If no user, navigate to auth; ensure sidebar closes first to avoid reflow
                if (!user) {
                  if (sidebarOpen) setSidebarOpen(false);
                  try { document.body.style.paddingRight = ''; } catch {}
                  setLocation('/auth');
                }
              }}
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
                          transition-all duration-200 ease-in-out
                          focus:outline-none focus:ring-0 focus-visible:ring-0"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[300px] max-w-[85vw] h-full overflow-y-auto">
          <SidebarNavigation onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}