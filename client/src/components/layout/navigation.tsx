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
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-base font-medium transition-colors hover:text-primary group">
        <span className="flex items-center gap-1">
          {title === 'Support & Legal' && <Book className="h-4 w-4" />}
          {title === 'Settings & Accessibility' && <Settings className="h-4 w-4" />}
          {title === 'Admin' && <Settings2 className="h-4 w-4"/>}
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
              className="flex items-center gap-2 text-base"
            >
              {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
              {item.label}
            </NavLink>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

DropdownSection.displayName = "DropdownSection";

const SidebarContent = memo(({ onNavigate, location, isMobile }: {
  onNavigate?: () => void;
  location: string;
  isMobile?: boolean;
}) => {
  const { user, logoutMutation } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Cog className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>

  const [adminOpen, setAdminOpen] = useState(false);
  const [, setLocation] = useLocation();

  const sections = {
    settings: [
      { href: '/settings', label: 'Display & Theme', icon: <Monitor className="h-4 w-4" /> },
      { href: '/settings#font', label: 'Text & Typography', icon: <Type className="h-4 w-4" /> },
      { href: '/settings#reading', label: 'Reading Experience', icon: <ScrollText className="h-4 w-4" /> },
      { href: '/settings#offline', label: 'Offline Access', icon: <Cloud className="h-4 w-4" /> },
    ],
    support: [
      { href: '/about', label: 'About', icon: <Book className="h-4 w-4" /> },
      { href: '/contact', label: 'Contact', icon: <Mail className="h-4 w-4" /> },
      { href: '/privacy', label: 'Privacy Policy', icon: <Scale className="h-4 w-4" /> },
    ],
    admin: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: '/admin/posts', label: 'Posts Management', icon: <FileEdit className="h-4 w-4" /> },
      { href: '/admin/analytics', label: 'Analytics', icon: <LineChart className="h-4 w-4" /> },
      { href: '/admin/users', label: 'User Management', icon: <Users className="h-4 w-4" /> },
      { href: '/admin/settings', label: 'Admin Settings', icon: <Settings2 className="h-4 w-4" /> },
    ],
  };

  return (
    <nav
      role="menu"
      className={`
        flex flex-col space-y-2 p-4
        text-base
        bg-background/95 backdrop-blur-sm
        border-r border-border/50
        ${isMobile ? 'w-full' : 'w-56 h-full'}
      `}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between mb-6">
        <NavLink
          href="/"
          isActive={location === '/'}
          onNavigate={onNavigate}
          className="text-xl font-medium"
        >
          Home
        </NavLink>
      </div>

      <div className="space-y-4 flex-grow">
        <NavLink
          href="/index"
          isActive={location === '/index'}
          onNavigate={onNavigate}
          className="text-base"
        >
          Index
        </NavLink>

        <NavLink
          href="/reader"
          isActive={location === '/reader'}
          onNavigate={onNavigate}
          className="text-base"
        >
          Reader
        </NavLink>

        <NavLink
          href="/community"
          isActive={location === '/community'}
          onNavigate={onNavigate}
          className="text-base"
        >
          Community
        </NavLink>

        <div className="mt-auto pt-4 space-y-4">
          <DropdownSection
            title="Settings & Accessibility"
            items={sections.settings}
            isOpen={settingsOpen}
            onToggle={() => setSettingsOpen(!settingsOpen)}
            location={location}
            onNavigate={onNavigate}
          />

          <DropdownSection
            title="Support & Legal"
            items={sections.support}
            isOpen={supportOpen}
            onToggle={() => setSupportOpen(!supportOpen)}
            location={location}
            onNavigate={onNavigate}
          />

          {user?.isAdmin && (
            <DropdownSection
              title="Admin"
              items={sections.admin}
              isOpen={adminOpen}
              onToggle={() => setAdminOpen(!adminOpen)}
              location={location}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </div>

      <div className="pt-4 space-y-4 border-t border-border/50">
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="w-full text-base bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              onNavigate?.();
              setLocation("/auth");
            }}
          >
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
          className="text-base flex items-center justify-center gap-2"
        >
          <Bug className="h-4 w-4" />
          Report a Bug
        </NavLink>
      </div>
    </nav>
  );
});

SidebarContent.displayName = "SidebarContent";

import { NotificationsDropdown } from "@/components/ui/notifications";

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
            <SidebarContent location={location} onNavigate={() => setIsOpen(false)} isMobile />
          </SheetContent>
        </Sheet>

        <div className="flex-1" />

        {/* Notifications Dropdown */}
        <div className="mr-2">
          <NotificationsDropdown />
        </div>

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