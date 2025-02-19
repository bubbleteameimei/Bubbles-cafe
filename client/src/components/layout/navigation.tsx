import { Link, useLocation } from "wouter";
import { Menu, ChevronDown, Moon, Sun, Book, Compass, Settings, Search, Radio, User } from "lucide-react";
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

const DropdownSection = memo(({ title, items, isOpen, onToggle, location, onNavigate }: {
  title: string;
  items: { href: string; label: string; icon?: React.ReactNode }[];
  isOpen: boolean;
  onToggle: () => void;
  location: string;
  onNavigate?: () => void;
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-lg font-medium transition-colors hover:text-primary group">
        <span className="flex items-center gap-3">
          {title === 'Library' && <Book className="h-5 w-5" />}
          {title === 'Explore' && <Compass className="h-5 w-5" />}
          {title === 'Settings' && <Settings className="h-5 w-5" />}
          {title}
        </span>
        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-8 space-y-3">
        {items.map(item => (
          <NavLink
            key={item.href}
            href={item.href}
            isActive={location === item.href}
            onNavigate={onNavigate}
            className="flex items-center gap-3 py-2.5"
          >
            {item.icon && <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>}
            {item.label}
          </NavLink>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

DropdownSection.displayName = "DropdownSection";

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
        text-lg font-eb-garamond transition-all duration-300
        ${isActive
          ? "text-primary font-semibold"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        }
        w-full text-left px-4 py-2.5 rounded-sm
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

const SidebarContent = memo(({ location, onNavigate, isMobile = false }: {
  location: string;
  onNavigate?: () => void;
  isMobile?: boolean;
}) => {
  const { user } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const sections = {
    library: [
      { href: '/stories', label: 'Stories' },
      { href: '/index', label: 'Index' },
      { href: '/reader', label: 'Reader' },
    ],
    explore: [
      { href: '/search', label: 'Search', icon: <Search className="h-4 w-4" /> },
      { href: '/secret', label: 'Secret Pages' },
      { href: '/live', label: 'Live Readings', icon: <Radio className="h-4 w-4" /> },
    ],
    settings: [
      { href: '/theme', label: 'Dark Mode' },
      { href: '/accessibility', label: 'Font & Accessibility' },
    ],
  };

  return (
    <nav
      role="menu"
      className={`
        flex flex-col space-y-4 p-8
        font-eb-garamond text-lg
        bg-background/95 backdrop-blur-sm
        border-r border-border/50
        ${isMobile ? 'w-full' : 'w-72 h-full'}
      `}
      aria-label="Main navigation"
    >
      <NavLink
        href="/"
        isActive={location === '/'}
        onNavigate={onNavigate}
        className="text-xl font-medium py-4"
      >
        Home
      </NavLink>

      <div className="space-y-3">
        <DropdownSection
          title="Library"
          items={sections.library}
          isOpen={openSection === 'library'}
          onToggle={() => setOpenSection(openSection === 'library' ? null : 'library')}
          location={location}
          onNavigate={onNavigate}
        />

        <DropdownSection
          title="Explore"
          items={sections.explore}
          isOpen={openSection === 'explore'}
          onToggle={() => setOpenSection(openSection === 'explore' ? null : 'explore')}
          location={location}
          onNavigate={onNavigate}
        />

        <NavLink
          href="/about"
          isActive={location === '/about'}
          onNavigate={onNavigate}
          className="py-4"
        >
          About
        </NavLink>

        <NavLink
          href="/contact"
          isActive={location === '/contact'}
          onNavigate={onNavigate}
          className="py-4"
        >
          Contact
        </NavLink>

        <NavLink
          href="/privacy"
          isActive={location === '/privacy'}
          onNavigate={onNavigate}
          className="py-4"
        >
          Privacy Policy
        </NavLink>

        <DropdownSection
          title="Settings"
          items={sections.settings}
          isOpen={openSection === 'settings'}
          onToggle={() => setOpenSection(openSection === 'settings' ? null : 'settings')}
          location={location}
          onNavigate={onNavigate}
        />
      </div>

      <div className="mt-auto pt-6 border-t border-border/50">
        {!user ? (
          <Button
            variant="default"
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg"
            onClick={() => {
              onNavigate?.();
              setLocation("/auth");
            }}
          >
            <User className="h-5 w-5 mr-2" />
            Sign In
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="lg"
            className="w-full text-lg"
            onClick={() => {
              // Handle logout
            }}
          >
            Sign Out
          </Button>
        )}
      </div>
    </nav>
  );
});

SidebarContent.displayName = "SidebarContent";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SidebarContent location={location} onNavigate={() => setIsOpen(false)} isMobile />
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex h-full">
          <SidebarContent location={location} />
        </div>
      </div>
    </header>
  );
}