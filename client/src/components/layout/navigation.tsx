import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu, Search, Moon, Sun, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { useNotifications } from "@/contexts/notification-context";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const { theme, setTheme } = useTheme();

  // Close the sidebar drawer proactively on route changes to avoid layout reflow
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
    // Also clear any temporary body styles a drawer might have applied
    try {
      document.body.style.paddingRight = '';
    } catch {}
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header
      className="w-full bg-background/40 backdrop-blur-sm shadow-sm"
      style={{ position: 'relative', left: 0, right: 0, margin: 0, padding: 0, width: '100%' }}
    >
      <div className="main-header flex items-center justify-between h-14 px-4">
        
        {/* Left: menu */}
        <div className="flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-md border border-border/30 text-white hover:text-white hover:bg-accent/10"
                aria-label="Open menu"
                onClick={() => setIsOpen((v) => !v)}
                noOutline
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] max-w-[85vw] h-full">
              <div className="border-b border-border/30" />
              <SidebarNavigation onNavigate={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Center nav */}
        <nav aria-label="Main" className="hidden lg:flex items-center justify-center flex-1 space-x-4">
          {[
            { href: "/", label: "Home" },
            { href: "/stories", label: "Stories" },
            { href: "/reader", label: "Reader" },
            { href: "/community", label: "Community" },
            { href: "/about", label: "About" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors
                ${location === href
                  ? "text-primary font-semibold after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary"
                  : "text-white hover:text-white/80"
                }`}
              aria-current={location === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-md border border-border/30 text-white hover:text-white hover:bg-accent/10"
                aria-label="Search"
                noOutline
              >
                <Search className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-3">
              <div className="flex items-center gap-2">
                <Input placeholder="Search stories…" className="h-9 text-sm bg-background/70 border-border/40 flex-1" />
                <Button variant="default" size="sm" className="h-9">Go</Button>
              </div>
            </PopoverContent>
          </Popover>

          <NotificationIcon
            className="h-12 w-12 rounded-md border border-border/30 text-white hover:text-white hover:bg-accent/10"
            noOutline
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-12 w-12 rounded-md border border-border/30 text-white hover:text-white hover:bg-accent/10"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            noOutline
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {!user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Ensure the sidebar is closed before navigating to prevent reflow
                if (isOpen) setIsOpen(false);
                try { document.body.style.paddingRight = ''; } catch {}
                setLocation("/auth");
              }}
              className="h-12 w-12 rounded-md border border-border/30 text-white hover:text-white hover:bg-accent/10"
              aria-label="Sign in"
              noOutline
            >
              <User className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-md border border-border/30 text-white hover:text-white hover:bg-accent/10"
              noOutline
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Full-width separator - match footer HR style */}
      <div
        aria-hidden="true"
        className="border-b border-border/40"
        style={{ width: "100vw", position: "relative", left: "50%", transform: "translateX(-50%)" }}
      />
    </header>
  );
}