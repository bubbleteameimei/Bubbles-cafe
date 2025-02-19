import { Link, useLocation } from "wouter";
import { ChevronDown, Moon, Sun, Book, Compass, Settings, Search, Radio, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, memo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LiquidMenuButton } from "@/components/ui/liquid-menu-button";
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
  items: { href: string; label: string; icon?: React.ReactNode; dataTutorial?: string }[];
  isOpen: boolean;
  onToggle: () => void;
  location: string;
  onNavigate?: () => void;
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-1 text-xs font-medium transition-colors hover:text-primary group">
        <span className="flex items-center gap-1">
          {title === 'Library' && <Book className="h-3 w-3" />}
          {title === 'Explore' && <Compass className="h-3 w-3" />}
          {title === 'Settings' && <Settings className="h-3 w-3" />}
          {title}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-3 space-y-1">
        {items.map(item => (
          <NavLink
            key={item.href}
            href={item.href}
            isActive={location === item.href}
            onNavigate={onNavigate}
            className="flex items-center gap-1 py-0.5"
            dataTutorial={item.dataTutorial}
          >
            {item.icon && <span className="w-3 h-3 flex items-center justify-center">{item.icon}</span>}
            {item.label}
          </NavLink>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

DropdownSection.displayName = "DropdownSection";

const NavLink = memo(({ href, isActive, children, onNavigate, className = "", dataTutorial }: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
  className?: string;
  dataTutorial?: string;
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
        text-[11px] font-eb-garamond transition-all duration-300
        ${isActive
          ? "text-primary font-semibold"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        }
        w-full text-left px-1.5 py-0.5 rounded-sm
        ${className}
      `}
      aria-current={isActive ? "page" : undefined}
      role="menuitem"
      data-tutorial={dataTutorial}
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
      { href: '/index', label: 'Index', dataTutorial: 'library' },
      { href: '/reader', label: 'Reader', dataTutorial: 'reader' },
    ],
    explore: [
      { href: '/search', label: 'Search', icon: <Search className="h-3 w-3" />, dataTutorial: 'explore' },
      { href: '/secret', label: 'Secret Pages', dataTutorial: 'explore' },
      { href: '/live', label: 'Live Readings', icon: <Radio className="h-3 w-3" />, dataTutorial: 'explore' },
    ],
    settings: [
      { href: '/theme', label: 'Dark Mode', dataTutorial: 'theme' },
      { href: '/accessibility', label: 'Font & Accessibility', dataTutorial: undefined },
    ],
  };

  return (
    <nav
      role="menu"
      className={`
        flex flex-col space-y-0.5 p-2
        font-eb-garamond text-[11px]
        bg-background/95 backdrop-blur-sm
        border-r border-border/50
        ${isMobile ? 'w-full' : 'w-48 h-full'}
      `}
      aria-label="Main navigation"
    >
      <NavLink
        href="/"
        isActive={location === '/'}
        onNavigate={onNavigate}
        className="text-xs font-medium py-0.5 mb-1"
        dataTutorial="home"
      >
        Home
      </NavLink>

      <div className="space-y-1">
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
          className="py-0.5"
          dataTutorial="about"
        >
          About
        </NavLink>

        <NavLink
          href="/contact"
          isActive={location === '/contact'}
          onNavigate={onNavigate}
          className="py-0.5"
          dataTutorial="contact"
        >
          Contact
        </NavLink>

        <NavLink
          href="/privacy"
          isActive={location === '/privacy'}
          onNavigate={onNavigate}
          className="py-0.5"
          dataTutorial="privacy"
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

      <div className="mt-auto pt-2 space-y-1 border-t border-border/50">
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            onClick={() => {
              onNavigate?.();
              setLocation("/auth");
            }}
          >
            <User className="h-3 w-3 mr-1" />
            Sign In
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              // Handle logout
            }}
          >
            Sign Out
          </Button>
        )}

        <NavLink
          href="/report-bug"
          isActive={location === '/report-bug'}
          onNavigate={onNavigate}
          className="text-xs py-0.5"
          dataTutorial="reportBug"
        >
          Report a Bug
        </NavLink>
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
      <div className="container flex h-12 items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <div className="mr-4 ml-4">
              <LiquidMenuButton onClick={() => setIsOpen(!isOpen)} />
              <span className="sr-only">Toggle menu</span>
            </div>
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