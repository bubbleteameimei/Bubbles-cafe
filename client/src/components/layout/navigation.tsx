import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu } from "lucide-react";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { useNotifications } from "@/components/NotificationProvider";
import { useTheme } from "@/components/theme-provider";
import { SunMoonToggle } from "@/components/ui/sun-moon-toggle";

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
                className="mr-2 lg:hidden"
                title="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <SidebarNavigation onNavigate={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
          
          {/* Desktop Logo */}
          <button 
            onClick={() => setLocation('/')} 
            className="mr-6 flex items-center space-x-2"
          >
            <span className="hidden font-bold uppercase tracking-wider sm:inline-block">Horror Stories</span>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks
              .filter(link => !link.requireAuth || user)
              .map(link => (
                <button 
                  key={link.href}
                  onClick={() => setLocation(link.href)} 
                  className={`transition-colors hover:text-foreground/80 tracking-wider ${
                    location === link.href ? 'text-primary font-semibold' : ''
                  }`}
                >
                  {link.label}
                </button>
              ))
            }
          </nav>
        </div>

        {/* Right-side Actions */}
        <div className="flex items-center space-x-4">
          <NotificationIcon notifications={notifications} />
          <SunMoonToggle />
          {!user ? (
            <Button
              variant="default"
              onClick={() => {
                setIsOpen(false);
                setLocation("/auth");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-wider"
            >
              Sign In
            </Button>
          ) : (
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/settings/profile')}
              className="uppercase tracking-wider"
            >
              Profile
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}