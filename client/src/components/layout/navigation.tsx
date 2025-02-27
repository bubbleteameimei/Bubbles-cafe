import { Link, useLocation } from "wouter";
import { 
  ChevronDown, 
  Settings, 
  Monitor, 
  Type, 
  ScrollText, 
  Cloud,
  Book, 
  Mail, 
  Scale,
  Bug,
  PanelLeftClose,
  LayoutDashboard,
  LineChart,
  Users,
  Settings2,
  FileEdit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, memo } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";

const NavLink = memo(({ href, isActive, children, onNavigate, className = "" }: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
  className?: string;
}) => {
  const [, setLocation] = useLocation();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.();
    setLocation(href);
  }, [href, onNavigate, setLocation]);

  return (
    <button
      onClick={handleClick}
      className={`
        text-base transition-all duration-300
        ${isActive
          ? "text-primary font-semibold"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        }
        w-full text-left px-2 py-1.5 rounded-sm
        ${className}
      `}
      aria-current={isActive ? "page" : undefined}
      role="menuitem"
    >
      {children}
    </button>
  );
});

NavLink.displayName = "NavLink";

const MenuIcon = () => (
  <div className="relative w-6 h-6">
    <PanelLeftClose className="w-6 h-6 transition-all hover:scale-110 text-primary" />
  </div>
);

export default function Navigation() {
  const [location, setLocation] = useLocation(); 
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent"
              title="Toggle navigation menu"
            >
              <MenuIcon />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SidebarNavigation onNavigate={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex-1" />

        <div className="flex items-center justify-end space-x-4">
          <ThemeToggle />
          {!user && (
            <Button
              variant="default"
              onClick={() => {
                setIsOpen(false);
                setLocation("/auth");
              }}
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