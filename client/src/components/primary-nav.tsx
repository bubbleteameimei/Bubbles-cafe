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
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <button 
            onClick={() => navigate('/')} 
            className="mr-6 flex items-center space-x-2"
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
          className="mr-2 md:hidden" 
          onClick={() => sidebar?.setOpenMobile(true)}
          noOutline={true}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search component could go here */}
          </div>
          <nav className="flex items-center">
            <GlobalThemeToggle className="mr-2" />
            <div className="ml-3 text-xs text-muted-foreground">
              {theme === 'dark' ? 'Dark' : 'Light'} Mode
            </div>
            
            {user ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-4"
                onClick={() => navigate('/settings/profile')}
              >
                Profile
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-4"
                onClick={() => navigate('/auth')}
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