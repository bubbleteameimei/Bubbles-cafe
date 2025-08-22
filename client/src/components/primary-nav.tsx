import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GlobalThemeToggle } from "@/components/global-theme-toggle";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";

export function PrimaryNav() {
  const sidebar = useSidebar();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [location, navigate] = useLocation();

  // Helper function to create nav links without nesting <a> tags
  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <button
      onClick={() => navigate(to)}
      className={`text-sm font-medium transition-colors hover:text-foreground/80 ${location === to ? 'text-primary font-bold' : ''}`}
      style={{ touchAction: 'manipulation' }}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mb-1.5">
      <div className="container flex h-12 items-center">
        <div className="mr-4 hidden md:flex">
          <button
            onClick={() => navigate('/')}
            className="mr-6 flex items-center space-x-2"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="hidden font-bold sm:inline-block">Stories</span>
          </button>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavLink to="/" label="Home" />
            <NavLink to="/stories" label="Stories" />
            <NavLink to="/reader" label="Reader" />
            <NavLink to="/community" label="Community" />
          </nav>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden w-9 h-9 rounded-md border border-border/30 hover:bg-accent/10 active:bg-accent/20 touch-manipulation relative overflow-hidden"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            sidebar?.setOpenMobile(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            sidebar?.setOpenMobile(true);
          }}
          style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
          noOutline={true}
        >
          <Menu className="h-4 w-4" strokeWidth={1.75} />
          <span className="sr-only">Toggle menu</span>
          <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 active:opacity-10 transition-opacity duration-150" />
        </Button>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search component could go here */}
          </div>
          <nav className="flex items-center -mt-4 transform -translate-y-0"> {/* Adjusted margin for better positioning */}
            <GlobalThemeToggle className="mr-2 mt-2" />
            <div className="ml-3 text-xs text-muted-foreground mt-2">
              {theme === 'dark' ? 'Dark' : 'Light'} Mode
            </div>

            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="ml-4 mt-2" /* Adjusted margin to move button lower */
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/settings/profile');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/settings/profile');
                }}
                style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
              >
                Profile
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="ml-4 mt-2" /* Adjusted margin to move button lower */
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/auth');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/auth');
                }}
                style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
              >
                Login
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}