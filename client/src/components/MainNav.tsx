import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
import { useSidebar } from "@/components/ui/sidebar";
import { useState } from "react";

export default function MainNav() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const sidebar = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  const handleAuthClick = () => {
    setLocation("/auth");
  };

  const toggleSidebar = () => {
    if (sidebar) {
      sidebar.setOpenMobile(!sidebar.openMobile);
      setIsOpen(!isOpen);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Enhanced Hamburger Menu */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={`lg:hidden relative w-10 h-10 text-foreground focus:outline-none bg-transparent group ${
              isOpen ? 'is-active' : ''
            }`}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <div className="absolute top-1/2 left-1/2 w-5 h-4 -mt-2 -ml-2.5">
              <span
                className={`absolute block h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${
                  isOpen ? 'rotate-45' : '-translate-y-1.5'
                }`}
              ></span>
              <span
                className={`absolute block h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${
                  isOpen ? 'opacity-0' : ''
                }`}
              ></span>
              <span
                className={`absolute block h-0.5 w-5 bg-current transform transition duration-500 ease-in-out ${
                  isOpen ? '-rotate-45' : 'translate-y-1.5'
                }`}
              ></span>
            </div>
          </button>

          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="font-bold text-xl">Horror Blog</span>
            </a>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm md:text-base">
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
                <DropdownMenuItem asChild>
                  <Link href="/legal/cookie-policy">
                    <a className="w-full flex items-center space-x-2 text-base py-2">
                      <FileText className="h-4 w-4" />
                      <span>Cookie Policy</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
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