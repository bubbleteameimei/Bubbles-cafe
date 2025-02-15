import { AdminNav } from "./AdminNav";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function MainNav() {
  const { user } = useAuth();

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
            {user ? (
              <>
                <Link href="/profile">
                  <a className="transition-colors hover:text-foreground/80">
                    Profile
                  </a>
                </Link>
                <AdminNav />
              </>
            ) : (
              <Link href="/auth">
                <a className="transition-colors hover:text-foreground/80">
                  Login
                </a>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
