import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, Moon, Sun } from "lucide-react";
import { AdminNav } from "./AdminNav";
import { useTheme } from "@/lib/theme-provider";

export default function MainNav() {
  const { user, isLoading, logoutMutation } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="font-bold text-lg">Horror Blog</span>
            </a>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/community">
              <a className="transition-colors hover:text-foreground/80">
                Community
              </a>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 transition-all" />
            ) : (
              <Moon className="h-4 w-4 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

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
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-sm"
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
              <AdminNav />
            </>
          ) : (
            <Button 
              variant="default"
              asChild
              className="text-sm"
            >
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}