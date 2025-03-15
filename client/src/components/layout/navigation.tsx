import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { SidebarNavigationIOS } from "@/components/ui/sidebar-menu-ios";
import { Menu } from "lucide-react";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { useNotifications } from "@/components/NotificationProvider";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  // Navigation links configuration
  const navLinks: Array<{ href: string; label: string; requireAuth?: boolean }> = [
    { href: '/', label: 'HOME' },
    { href: '/stories', label: 'STORIES' },
    { href: '/reader', label: 'READER' },
    { href: '/community', label: 'COMMUNITY' },
    { href: '/bookmarks', label: 'BOOKMARKS' },
    { href: '/about', label: 'ABOUT' },
    { href: '/contact', label: 'CONTACT' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-14 items-center justify-between">
        {/* Mobile Menu Trigger */}
        <div className="flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 lg:hidden relative overflow-hidden touch-manipulation"
                title="Toggle navigation menu"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'all 0.15s ease-out'
                }}
              >
                <Menu 
                  className="h-5 w-5 transform transition-transform duration-150 ease-out"
                  style={{ 
                    willChange: 'transform',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                  }}
                />
                <span className="sr-only">Toggle menu</span>
                <span className="absolute inset-0 bg-current opacity-0 hover:opacity-10 active:opacity-20 transition-opacity duration-150" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <SidebarNavigationIOS onNavigate={() => setIsOpen(false)} user={user} logoutMutation={null} />
            </SheetContent>
          </Sheet>
          
          {/* Desktop Logo */}
          <button 
            onClick={() => setLocation('/')} 
            className="mr-6 flex items-center space-x-2 rounded-md px-2 py-1 touch-manipulation transition-all duration-150 ease-out active:scale-[0.98] active:opacity-90"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="hidden font-bold uppercase tracking-wider sm:inline-block">Horror Stories</span>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
            {navLinks
              .filter(link => !link.requireAuth || user)
              .map(link => (
                <button 
                  key={link.href}
                  onClick={() => setLocation(link.href)} 
                  className={`px-3 py-2 rounded-md touch-manipulation transition-all duration-150 ease-out active:scale-[0.98] active:opacity-90 relative tracking-wider ${
                    location === link.href 
                      ? 'text-primary font-semibold before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary before:rounded-full' 
                      : 'hover:bg-foreground/5 active:bg-foreground/10'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {link.label}
                </button>
              ))
            }
          </nav>
        </div>

        {/* Right-side Actions */}
        <div className="flex items-center space-x-4">
          <NotificationIcon notifications={notifications} onClick={() => setLocation('/notifications')} />
          <ThemeToggleButton />
          {!user ? (
            <Button
              variant="default"
              onClick={() => {
                setIsOpen(false);
                setLocation("/auth");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider touch-manipulation transition-all duration-150 ease-out active:scale-95 active:opacity-90"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className="relative">
                Sign In
                <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 active:opacity-10 transition-opacity duration-150 rounded-md" />
              </span>
            </Button>
          ) : (
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/settings/profile')}
              className="uppercase tracking-wider touch-manipulation transition-all duration-150 ease-out active:scale-95 active:opacity-90 relative"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className="relative">
                Profile
                <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 active:opacity-10 transition-opacity duration-150 rounded-md" />
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}