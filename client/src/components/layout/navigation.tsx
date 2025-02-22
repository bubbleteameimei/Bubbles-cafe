import { Link, useLocation } from "wouter";
import { ChevronDown, Moon, Sun, Book, Compass, Settings, Search, Radio, User, Bug } from "lucide-react";
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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Slider } from "@/components/ui/slider";

const DropdownSection = memo(({ title, items, isOpen, onToggle, location, onNavigate }: {
  title: string;
  items: { href: string; label: string; icon?: React.ReactNode; dataTutorial?: string; component?: React.ReactNode }[];
  isOpen: boolean;
  onToggle: () => void;
  location: string;
  onNavigate?: () => void;
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium transition-colors hover:text-primary group">
        <span className="flex items-center gap-1">
          {title === 'Library' && <Book className="h-4 w-4" />}
          {title === 'Explore' && <Compass className="h-4 w-4" />}
          {title === 'Settings' && <Settings className="h-4 w-4" />}
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 space-y-2">
        {items.map(item => (
          <div key={item.href} className="flex items-center justify-between">
            <NavLink
              href={item.href}
              isActive={location === item.href}
              onNavigate={onNavigate}
              className="flex items-center gap-2"
              dataTutorial={item.dataTutorial}
            >
              {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
              {item.label}
            </NavLink>
            {item.component}
          </div>
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
    console.log(`NavLink clicked: ${href}`); // Debug log
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
  const { user, logoutMutation } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [fontSize, setFontSize] = useState(14); // Default font size

  const handleAuthClick = useCallback(() => {
    console.log("Auth button clicked"); // Debug log
    onNavigate?.();
    setLocation("/auth");
  }, [onNavigate, setLocation]);

  const sections = {
    library: [
      { href: '/index', label: 'Index', dataTutorial: 'library' },
      { href: '/reader', label: 'Reader', dataTutorial: 'reader' },
      { href: '/community', label: 'Community', dataTutorial: 'community' },
      { href: '/secret', label: 'Secret Pages', dataTutorial: 'secret' },
    ],
    explore: [
      { href: '/search', label: 'Search', icon: <Search className="h-4 w-4" />, dataTutorial: 'explore' },
      { href: '/live', label: 'Live Readings', icon: <Radio className="h-4 w-4" />, dataTutorial: 'explore' },
    ],
    settings: [
      { href: '/theme', label: 'Theme Mode', dataTutorial: 'theme', component: <ThemeToggle /> },
      {
        href: '/accessibility',
        label: 'Font Size',
        dataTutorial: 'accessibility',
        component: (
          <div className="w-24 flex items-center">
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => {
                setFontSize(value);
                document.documentElement.style.fontSize = `${value}px`;
              }}
              min={12}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        )
      },
    ],
  };

  return (
    <nav
      role="menu"
      className={`
        flex flex-col space-y-2 p-4
        font-eb-garamond text-base
        bg-background/95 backdrop-blur-sm
        border-r border-border/50
        ${isMobile ? 'w-full' : 'w-56 h-full'}
      `}
      aria-label="Main navigation"
      style={{ fontSize: `${fontSize}px` }}
    >
      <NavLink
        href="/"
        isActive={location === '/'}
        onNavigate={onNavigate}
        className="text-lg font-medium py-2 mb-2"
        dataTutorial="home"
      >
        Home
      </NavLink>

      <div className="space-y-4 flex-grow">
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
          className="py-2 text-base"
          dataTutorial="about"
        >
          About
        </NavLink>

        <NavLink
          href="/contact"
          isActive={location === '/contact'}
          onNavigate={onNavigate}
          className="py-2 text-base"
          dataTutorial="contact"
        >
          Contact
        </NavLink>

        <NavLink
          href="/privacy"
          isActive={location === '/privacy'}
          onNavigate={onNavigate}
          className="py-2 text-base"
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

      <div className="mt-auto pt-4 space-y-2 border-t border-border/50">
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base"
            onClick={handleAuthClick}
            data-tutorial="auth"
          >
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-base"
            onClick={() => {
              if (logoutMutation) {
                logoutMutation.mutate();
              }
            }}
          >
            Sign Out
          </Button>
        )}

        <NavLink
          href="/report-bug"
          isActive={location === '/report-bug'}
          onNavigate={onNavigate}
          className="py-2 text-base flex items-center gap-2"
          dataTutorial="reportBug"
        >
          <Bug className="h-4 w-4" />
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
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleAuthClick = useCallback(() => {
    console.log("Auth button clicked"); // Debug log
    setIsOpen(false); // Close the mobile menu if open
    setLocation("/auth");
  }, [setLocation]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="flex flex-1 items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <div>
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

        <div className="flex items-center justify-end space-x-4">
          <ThemeToggle />
          {!user && (
            <Button 
              variant="default" 
              onClick={handleAuthClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}