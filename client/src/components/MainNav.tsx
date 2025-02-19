import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AdminNav } from "./AdminNav";

export default function MainNav() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleAuthClick = () => {
    console.log('Navigating to auth page');
    setLocation("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="font-bold text-lg">Horror Blog</span>
            </a>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/community">
              <a className="text-sm font-medium transition-colors hover:text-foreground/80">
                Community
              </a>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : user ? (
            <>
              <Link href="/profile">
                <a className="text-sm font-medium transition-colors hover:text-foreground/80">
                  Profile
                </a>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
              <AdminNav />
            </>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={handleAuthClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}