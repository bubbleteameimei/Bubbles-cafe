import { AdminNav } from "./AdminNav";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function MainNav() {
  const { user, isLoading, logoutMutation } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/">
            <a className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                Horror Blog
              </span>
            </a>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/posts">
              <a className="transition-colors hover:text-foreground/80">
                Posts
              </a>
            </Link>

            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : user ? (
              <>
                <Link href="/profile">
                  <a className="transition-colors hover:text-foreground/80">
                    Profile
                  </a>
                </Link>
                <Button 
                  variant="ghost" 
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
                asChild
              >
                <Link href="/auth">
                  <a>Sign In</a>
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}