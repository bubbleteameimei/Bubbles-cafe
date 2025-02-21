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
  User 
} from "lucide-react";
import { AdminNav } from "./AdminNav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MainNav() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleAuthClick = () => {
    console.log('Navigating to auth page'); // Debug log
    setLocation("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="font-bold text-xl">Horror Blog</span>
            </a>
          </Link>
          <nav className="flex items-center space-x-6 text-sm md:text-base">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 font-medium">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  <span>Support & Legal</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
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

      {/* Report Bug Link - Fixed position at bottom */}
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