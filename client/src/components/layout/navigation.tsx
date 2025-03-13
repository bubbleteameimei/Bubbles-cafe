import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu } from "lucide-react";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { useNotifications } from "@/components/NotificationProvider";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { notifications } = useNotifications();

  // Navigation links configuration
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/stories', label: 'Stories' },
    { href: '/reader', label: 'Reader' },
    { href: '/community', label: 'Community' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            <span className="hidden font-bold sm:inline-block">Horror Stories</span>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
              <button 
                key={link.href}
                onClick={() => setLocation(link.href)} 
                className={`transition-colors hover:text-foreground/80 ${
                  location === link.href ? 'text-primary font-semibold' : ''
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right-side Actions */}
        <div className="flex items-center space-x-4">
          <NotificationIcon notifications={notifications} />
          <ThemeToggle />
          {!user ? (
            <Button
              variant="default"
              onClick={() => {
                setIsOpen(false);
                setLocation("/auth");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Button>
          ) : (
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/settings/profile')}
            >
              Profile
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}