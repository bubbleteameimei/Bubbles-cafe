
import * as React from "react"
import {
  Home, Book, Users, Settings, HelpCircle, FileText, ChevronDown,
  Bug, Scroll, Shield, Monitor, Bell, Lock, Building,
  Mail, MessageSquare, Palette, Type,
  User, Link2 as Link, CircleUserRound as UserCircle, Bookmark as BookmarkIcon,
  LineChart, Eye
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocation } from "wouter"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"

export function SidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const [displayOpen, setDisplayOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);

  // Close on item tap and swipe-to-close (basic)
  React.useEffect(() => {
    const el = document.querySelector('[data-sidebar="sidebar"]');
    if (!el) return;

    let startX = 0;
    let startY = 0;

    const onStart = (evt: Event) => {
      const e = evt as TouchEvent;
      if (!('touches' in e) || e.touches.length === 0) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onMove = (evt: Event) => {
      const e = evt as TouchEvent;
      if (!('touches' in e) || e.touches.length === 0) return;
      const dx = startX - e.touches[0].clientX;
      const dy = Math.abs(startY - e.touches[0].clientY);
      if (dx > 50 && dy < 40) {
        const closeBtn = el.querySelector('button');
        (closeBtn as HTMLButtonElement | null)?.click();
      }
    };

    el.addEventListener('touchstart', onStart as EventListener, { passive: true });
    el.addEventListener('touchmove', onMove as EventListener, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart as EventListener);
      el.removeEventListener('touchmove', onMove as EventListener);
    };
  }, []);

  const handleNavigation = React.useCallback((path: string) => {
    try {
      onNavigate?.();
      setLocation(path);
    } catch {
      window.location.href = path;
    }
  }, [onNavigate, setLocation]);

  const menuItemClass = "flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] transition-colors";
  const submenuItemClass = "flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]";

  return (
    <div className="flex flex-col h-full overflow-y-auto px-2 py-2" role="navigation" aria-label="Main navigation">
      {/* Navigation */}
      <div className="mb-2">
        <div className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] opacity-70">Navigation</div>
        <ul className="mt-1 space-y-1">
          <li>
            <button
              className={cn(menuItemClass, location === '/' && 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]')}
              onClick={() => handleNavigation('/')}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
          </li>
          <li>
            <button
              className={cn(menuItemClass, location === '/stories' && 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]')}
              onClick={() => handleNavigation('/stories')}
            >
              <Scroll className="h-4 w-4" />
              <span>Index</span>
            </button>
          </li>
          <li>
            <button
              className={cn(menuItemClass, location === '/reader' && 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]')}
              onClick={() => handleNavigation('/reader')}
            >
              <Book className="h-4 w-4" />
              <span>Reader</span>
            </button>
          </li>
          <li>
            <button
              className={cn(menuItemClass, location === '/community' && 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]')}
              onClick={() => handleNavigation('/community')}
            >
              <Users className="h-4 w-4" />
              <span>Community</span>
            </button>
          </li>
          <li>
            <button
              className={cn(menuItemClass, location === '/bookmarks' && 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]')}
              onClick={() => handleNavigation('/bookmarks')}
            >
              <BookmarkIcon className="h-4 w-4" />
              <span>Bookmarks</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Admin */}
      {user?.isAdmin && (
        <div className="mb-2">
          <div className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] opacity-70">Administration</div>
          <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
            <CollapsibleTrigger asChild>
              <button className={cn(menuItemClass, 'w-full justify-between')}>
                <span className="inline-flex items-center gap-2"><Shield className="h-4 w-4" /> Admin Controls</span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', adminOpen && 'rotate-180')} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 py-1">
              <ul className="space-y-1">
                <li>
                  <button className={submenuItemClass} onClick={() => handleNavigation('/admin/dashboard')}>
                    <Monitor className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button className={submenuItemClass} onClick={() => handleNavigation('/admin/content-management')}>
                    <FileText className="h-4 w-4" />
                    <span>Content Management</span>
                  </button>
                </li>
                <li>
                  <button className={submenuItemClass} onClick={() => handleNavigation('/admin/themes')}>
                    <Palette className="h-4 w-4" />
                    <span>Theme Management</span>
                  </button>
                </li>
                <li>
                  <button className={submenuItemClass} onClick={() => handleNavigation('/admin/users')}>
                    <Users className="h-4 w-4" />
                    <span>User Management</span>
                  </button>
                </li>
                <li>
                  <button className={submenuItemClass} onClick={() => handleNavigation('/admin/analytics')}>
                    <LineChart className="h-4 w-4" />
                    <span>Insights & Reports</span>
                  </button>
                </li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Reading & Accessibility */}
      <div className="mb-2">
        <div className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] opacity-70">Reading & Accessibility</div>
        <Collapsible open={displayOpen} onOpenChange={setDisplayOpen}>
          <CollapsibleTrigger asChild>
            <button className={cn(menuItemClass, 'w-full justify-between')}>
              <span className="inline-flex items-center gap-2"><Palette className="h-4 w-4" /> Accessibility Settings</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', displayOpen && 'rotate-180')} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 py-1">
            <ul className="space-y-1">
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/settings/fonts')}>
                  <Type className="h-4 w-4" />
                  <span>Font Settings</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/settings/accessibility')}>
                  <HelpCircle className="h-4 w-4" />
                  <span>Reading Preferences</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/settings/quick-settings')}>
                  <Settings className="h-4 w-4" />
                  <span>Quick Settings</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/settings/preview')}>
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </button>
              </li>
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Account Settings */}
      <div className="mb-2">
        <div className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] opacity-70">Account Settings</div>
        <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
          <CollapsibleTrigger asChild>
            <button className={cn(menuItemClass, 'w-full justify-between')}>
              <span className="inline-flex items-center gap-2"><UserCircle className="h-4 w-4" /> Account Settings</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', accountOpen && 'rotate-180')} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 py-1">
            <ul className="space-y-1">
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/profile')}>
                  <UserCircle className="h-4 w-4" />
                  <span>My Profile</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/settings/profile')}>
                  <User className="h-4 w-4" />
                  <span>Profile Settings</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/settings/notifications')}>
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/settings/privacy')}>
                  <Lock className="h-4 w-4" />
                  <span>Privacy & Security</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/settings/connected-accounts')}>
                  <Link className="h-4 w-4" />
                  <span>Connected Accounts</span>
                </button>
              </li>
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Support & Legal */}
      <div className="mb-2">
        <div className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] opacity-70">Support & Legal</div>
        <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
          <CollapsibleTrigger asChild>
            <button className={cn(menuItemClass, 'w-full justify-between')}>
              <span className="inline-flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Support & Legal</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', supportOpen && 'rotate-180')} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 py-1">
            <ul className="space-y-1">
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/about')}>
                  <Building className="h-4 w-4" />
                  <span>About Me</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/feedback')}>
                  <MessageSquare className="h-4 w-4" />
                  <span>Feedback & Suggestions</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/contact')}>
                  <Mail className="h-4 w-4" />
                  <span>Contact Me</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/report-bug')}>
                  <Bug className="h-4 w-4" />
                  <span>Report a Bug</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/legal/terms')}>
                  <FileText className="h-4 w-4" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/privacy')}>
                  <Lock className="h-4 w-4" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button className={submenuItemClass} onClick={() => handleNavigation('/legal/copyright')}>
                  <Shield className="h-4 w-4" />
                  <span>Copyright Policy</span>
                </button>
              </li>
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer Buttons */}
      <div className="mt-auto border-t border-[hsl(var(--sidebar-border))] pt-3">
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="w-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm uppercase tracking-wider px-4 py-2"
            onClick={() => handleNavigation("/auth")}
            aria-label="Sign in to your account"
          >
            Sign In
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm uppercase tracking-wider px-4 py-2"
            onClick={() => {
              logout?.();
            }}
            aria-label="Sign out of your account"
          >
            Sign Out
          </Button>
        )}

        <button
          onClick={() => handleNavigation('/report-bug')}
          className={cn(
            "mt-2 mb-0 text-sm flex items-center justify-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
            location === '/report-bug'
              ? "text-[hsl(var(--sidebar-primary))] font-medium bg-[hsl(var(--sidebar-accent))]"
              : "text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-accent))]"
          )}
          aria-label="Report a bug or issue"
          role="link"
        >
          <Bug className="h-4 w-4" aria-hidden="true" />
          Report Bug
        </button>
      </div>
    </div>
  );
}
