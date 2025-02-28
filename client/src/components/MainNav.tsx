import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ChevronDown, 
  HelpCircle, 
  AlertTriangle, 
  Building, 
  Mail, 
  Lock,
  User,
  FileText,
  Book,
  ScrollText,
  Shield
} from "lucide-react";
import { AdminNav } from "./AdminNav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MainNav() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAuthClick = () => {
    setLocation("/auth");
  };

  const toggleMenu = () => {
    console.log('[MainNav] Toggling menu state:', !isOpen);
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        console.log('[MainNav] Clicking outside menu, closing');
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    console.log('[MainNav] Route changed, closing menu');
    setIsOpen(false);
  }, [useLocation()[0]]);

  // Close menu when a link is clicked
  const handleLinkClick = () => {
    console.log('[MainNav] Menu link clicked, closing menu');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Hamburger Menu - Now first in the flex container */}
        <div className="md:hidden relative mr-4" ref={menuRef}>
          <button 
            id="menu-toggle" 
            className="menu-button-container p-2 rounded-md transition-colors hover:bg-primary/10 group"
            onClick={toggleMenu}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out origin-right ${
                isOpen ? 'rotate-45 translate-y-[8px] -translate-x-[1px] scale-x-90' : 'group-hover:scale-100'
              }`}></span>
              <span className={`w-full h-0.5 bg-current transition-all duration-300 ease-in-out transform ${
                isOpen ? 'opacity-0 translate-x-3' : 'group-hover:scale-95'
              }`}></span>
              <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out origin-right ${
                isOpen ? '-rotate-45 -translate-y-[8px] -translate-x-[1px] scale-x-90' : 'group-hover:scale-100'
              }`}></span>
            </div>
          </button>

          {/* Backdrop Overlay */}
          {isOpen && (
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          <nav 
            id="menu" 
            className={`fixed right-4 top-[4.5rem] w-64 bg-background/95 backdrop-blur-md shadow-lg rounded-lg overflow-hidden transition-all duration-300 transform z-50 ${
              isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible'
            }`}
          >
            <div className="py-2 space-y-1">
              {[
                { href: '/about', icon: Building, label: 'About Us' },
                { href: '/contact', icon: Mail, label: 'Contact Support' },
                { href: '/support/feedback', icon: ScrollText, label: 'Feedback & Suggestions' },
                { href: '/support/guidelines', icon: Book, label: 'User Guidelines' },
                null, // Separator
                { href: '/legal/terms', icon: FileText, label: 'Terms of Service' },
                { href: '/legal/copyright', icon: Shield, label: 'Copyright Policy' },
                { href: '/privacy', icon: Lock, label: 'Privacy Policy' }
              ].map((item, index) => 
                item === null ? (
                  <div key="separator" className="border-t border-border my-2" />
                ) : (
                  <Link key={item.href} href={item.href}>
                    <a 
                      className="flex items-center space-x-2 px-4 py-3 hover:bg-primary/10 transition-all duration-200 hover:translate-x-1"
                      onClick={handleLinkClick}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen ? 'translateX(0)' : 'translateX(-10px)'
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </a>
                  </Link>
                )
              )}
            </div>
          </nav>
        </div>

        <Link href="/">
          <a className="flex items-center space-x-2">
            <span className="font-bold text-xl">Horror Blog</span>
          </a>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm md:text-base ml-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 font-medium">
                <HelpCircle className="h-4 w-4 mr-1" />
                <span>Support & Legal</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              <DropdownMenuItem asChild>
                <Link href="/about">
                  <a className="w-full flex items-center space-x-2 text-base py-2">
                    <Building className="h-4 w-4" />
                    <span>About Us</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contact">
                  <a className="w-full flex items-center space-x-2 text-base py-2">
                    <Mail className="h-4 w-4" />
                    <span>Contact Support</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/support/feedback">
                  <a className="w-full flex items-center space-x-2 text-base py-2">
                    <ScrollText className="h-4 w-4" />
                    <span>Feedback & Suggestions</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/support/guidelines">
                  <a className="w-full flex items-center space-x-2 text-base py-2">
                    <Book className="h-4 w-4" />
                    <span>User Guidelines</span>
                  </a>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/legal/terms">
                  <a className="w-full flex items-center space-x-2 text-base py-2">
                    <FileText className="h-4 w-4" />
                    <span>Terms of Service</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/legal/copyright">
                  <a className="w-full flex items-center space-x-2 text-base py-2">
                    <Shield className="h-4 w-4" />
                    <span>Copyright Policy</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/privacy">
                  <a className="w-full flex items-center space-x-2 text-base py-2">
                    <Lock className="h-4 w-4" />
                    <span>Privacy Policy</span>
                  </a>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center space-x-4 ml-auto">
          <ThemeToggle />
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : user ? (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-base"
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
              {user.isAdmin && <AdminNav />}
            </>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={handleAuthClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base"
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-4 z-50">
        <Link href="/report-bug">
          <a className="flex items-center space-x-2 text-xl font-medium text-muted-foreground hover:text-foreground transition-colors">
            <AlertTriangle className="h-6 w-6" />
            <span>Report a Bug</span>
          </a>
        </Link>
      </div>
    </header>
  );
}