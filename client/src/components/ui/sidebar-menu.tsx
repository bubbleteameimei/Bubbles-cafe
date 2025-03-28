
import * as React from "react"
import {
  Home, Book, Users, Settings, HelpCircle, FileText, ChevronDown,
  Bug, Scroll, Shield, ShieldAlert, Monitor, ScrollText, Bell, Lock, Building,
  Mail, MessageSquare, Database, Palette, Moon, Sun, Type,
  User, Link2 as Link, CircleUserRound as UserCircle, LogIn, Bookmark as BookmarkIcon,
  LineChart, BarChart, AlertTriangle, Ban, ServerCrash, MoveLeft, Clock, WifiOff,
  Search, Sparkles, GanttChart, GamepadIcon, Rss
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

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar"

export function SidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [displayOpen, setDisplayOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const sidebar = useSidebar();

  const handleNavigation = React.useCallback((path: string) => {
    if (onNavigate) {
      onNavigate();
    }
    if (sidebar?.isMobile) {
      sidebar.setOpenMobile(false);
    }
    setLocation(path);
  }, [onNavigate, sidebar, setLocation]);
  
  // Function to render the active indicator for menu items
  const renderActiveIndicator = (path: string) => {
    if (location === path) {
      return (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
          <div className="h-3 w-0.5 rounded-r-md bg-primary/80 animate-pulse-subtle" />
        </div>
      );
    }
    return null;
  };

  // Enhanced menu item class with hover effects and prevent text wrapping
  const menuItemClass = "text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent)/90] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:translate-x-1 transition-all duration-200 relative pl-6 whitespace-nowrap py-0.5 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0";
  
  // Enhanced submenu item class with hover effects and prevent text wrapping
  const submenuItemClass = "text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent)/90] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:translate-x-1 transition-all duration-200 relative pl-6 whitespace-nowrap focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0";





  return (
    <div className="flex flex-col space-y-0 p-1 pt-0 pb-0 h-full overflow-y-auto scrollbar-hide">

      {/* Main Navigation */}
      <SidebarGroup className="mt-0">
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1">
          Navigation
        </SidebarGroupLabel>
        <SidebarGroupContent className="-mt-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/'}
                onClick={() => handleNavigation('/')}
                tooltip="Home"
                className={menuItemClass}
              >
                {renderActiveIndicator('/')}
                <Home className="h-4 w-4" />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/stories'}
                onClick={() => handleNavigation('/stories')}
                tooltip="Index"
                className={menuItemClass}
              >
                {renderActiveIndicator('/stories')}
                <Scroll className="h-4 w-4" />
                <span>Index</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/reader'}
                onClick={() => handleNavigation('/reader')}
                tooltip="Reader"
                className={menuItemClass}
              >
                {renderActiveIndicator('/reader')}
                <Book className="h-4 w-4" />
                <span>Reader</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/community'}
                onClick={() => handleNavigation('/community')}
                tooltip="Community"
                className={menuItemClass}
              >
                {renderActiveIndicator('/community')}
                <Users className="h-4 w-4" />
                <span>Community</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Bookmarks - Always display the item */}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/bookmarks'}
                onClick={() => handleNavigation('/bookmarks')}
                tooltip="Bookmarks"
                className={menuItemClass}
              >
                {renderActiveIndicator('/bookmarks')}
                <BookmarkIcon className="h-4 w-4" />
                <span>Bookmarks</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Games & Interactive Experiences */}
      <SidebarGroup className="mt-1">
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1">
          Games & Interactive
        </SidebarGroupLabel>
        <SidebarGroupContent className="-mt-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/eden-game'}
                onClick={() => handleNavigation('/eden-game')}
                tooltip="Eden - Experimental Game"
                className={menuItemClass}
              >
                {renderActiveIndicator('/eden-game')}
                <GamepadIcon className="h-4 w-4" />
                <span>Eden - Experimental Game</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Admin Navigation - Only show if user is admin */}
      {user?.isAdmin && (
        <SidebarGroup className="mt-1">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent className="-mt-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-[hsl(var(--sidebar-accent))] data-[state=open]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Admin Controls</span>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 shrink-0 text-[hsl(var(--sidebar-foreground))] opacity-50 transition-transform duration-200",
                        adminOpen && "rotate-180"
                      )} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 px-2 py-1">
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/dashboard'}
                          onClick={() => handleNavigation('/admin/dashboard')}
                          className={submenuItemClass}
                        >
                          <Monitor className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Dashboard</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/users'}
                          onClick={() => handleNavigation('/admin/users')}
                          className={submenuItemClass}
                        >
                          <Users className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Manage Users</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/stories'}
                          onClick={() => handleNavigation('/admin/stories')}
                          className={submenuItemClass}
                        >
                          <ScrollText className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Manage Stories</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/content'}
                          onClick={() => handleNavigation('/admin/content')}
                          className={submenuItemClass}
                        >
                          <FileText className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Content</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/content-moderation'}
                          onClick={() => handleNavigation('/admin/content-moderation')}
                          className={submenuItemClass}
                        >
                          <ShieldAlert className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Moderation</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/analytics'}
                          onClick={() => handleNavigation('/admin/analytics')}
                          className={submenuItemClass}
                        >
                          <LineChart className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Analytics</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/site-statistics'}
                          onClick={() => handleNavigation('/admin/site-statistics')}
                          className={submenuItemClass}
                        >
                          <BarChart className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Site Statistics</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/feedback'}
                          onClick={() => handleNavigation('/admin/feedback')}
                          className={submenuItemClass}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>User Feedback</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/bug-reports'}
                          onClick={() => handleNavigation('/admin/bug-reports')}
                          className={submenuItemClass}
                        >
                          <Bug className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Bug Reports</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/wordpress-sync'}
                          onClick={() => handleNavigation('/admin/wordpress-sync')}
                          className={submenuItemClass}
                        >
                          <Rss className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>WordPress Sync</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Accessibility */}
      <SidebarGroup className="mt-1">
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1">
          Reading & Accessibility
        </SidebarGroupLabel>
        <SidebarGroupContent className="-mt-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={displayOpen} onOpenChange={setDisplayOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="w-full justify-between text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-[hsl(var(--sidebar-accent))] data-[state=open]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] whitespace-nowrap"
                  >
                    <div className="flex items-center">
                      <Palette className="h-4 w-4 mr-2" />
                      <span>Accessibility Settings</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 shrink-0 text-[hsl(var(--sidebar-foreground))] opacity-50 transition-transform duration-200",
                      displayOpen && "rotate-180"
                    )} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 px-2 py-1">
                  <SidebarMenuSub>

                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/fonts'}
                        onClick={() => handleNavigation('/settings/fonts')}
                        className={submenuItemClass}
                      >
                        <Type className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Font Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/accessibility'}
                        onClick={() => handleNavigation('/settings/accessibility')}
                        className={submenuItemClass}
                      >
                        <HelpCircle className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Reading Preferences</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    {/* Removed text-to-speech menu item */}
                    
                    {/* Removed accessibility test menu item */}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Account Settings */}
      <SidebarGroup className="mt-1">
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1">
          Account Settings
        </SidebarGroupLabel>
        <SidebarGroupContent className="-mt-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-[hsl(var(--sidebar-accent))] data-[state=open]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] whitespace-nowrap">
                    <div className="flex items-center">
                      <UserCircle className="h-4 w-4 mr-2" />
                      <span>Account Settings</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 shrink-0 text-[hsl(var(--sidebar-foreground))] opacity-50 transition-transform duration-200",
                      accountOpen && "rotate-180"
                    )} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 px-2 py-1">
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/profile'}
                        onClick={() => handleNavigation('/profile')}
                        className={submenuItemClass}
                      >
                        <UserCircle className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>My Profile</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/profile'}
                        onClick={() => handleNavigation('/settings/profile')}
                        className={submenuItemClass}
                      >
                        <User className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Profile Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/notifications'}
                        onClick={() => handleNavigation('/settings/notifications')}
                        className={submenuItemClass}
                      >
                        <Bell className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Notifications</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/privacy'}
                        onClick={() => handleNavigation('/settings/privacy')}
                        className={submenuItemClass}
                      >
                        <Lock className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Privacy & Security</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/data-export'}
                        onClick={() => handleNavigation('/settings/data-export')}
                        className={submenuItemClass}
                      >
                        <Database className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Export My Data</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/connected'}
                        onClick={() => handleNavigation('/settings/connected')}
                        className={submenuItemClass}
                      >
                        <Link className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Connected Accounts</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>



      {/* Support & Legal */}
      <SidebarGroup className="mt-1">
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1">
          Support & Legal
        </SidebarGroupLabel>
        <SidebarGroupContent className="-mt-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-[hsl(var(--sidebar-accent))] data-[state=open]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] whitespace-nowrap">
                    <div className="flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      <span>Support & Legal</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 shrink-0 text-[hsl(var(--sidebar-foreground))] opacity-50 transition-transform duration-200",
                      supportOpen && "rotate-180"
                    )} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 px-2 py-1">
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/about'}
                        onClick={() => handleNavigation('/about')}
                        className={submenuItemClass}
                      >
                        <Building className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>About Me</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/feedback'}
                        onClick={() => handleNavigation('/feedback')}
                        className={submenuItemClass}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Feedback & Suggestions</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/contact'}
                        onClick={() => handleNavigation('/contact')}
                        className={submenuItemClass}
                      >
                        <Mail className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Contact Me</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/report-bug'}
                        onClick={() => handleNavigation('/report-bug')}
                        className={submenuItemClass}
                      >
                        <Bug className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Report a Bug</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/terms'}
                        onClick={() => handleNavigation('/legal/terms')}
                        className={submenuItemClass}
                      >
                        <FileText className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Terms of Service</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/privacy'}
                        onClick={() => handleNavigation('/privacy')}
                        className={submenuItemClass}
                      >
                        <Lock className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Privacy Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/copyright'}
                        onClick={() => handleNavigation('/legal/copyright')}
                        className={submenuItemClass}
                      >
                        <Shield className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Copyright Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Footer Buttons */}
      <div className="mt-auto mb-0 border-t border-[hsl(var(--sidebar-border))] pt-3">
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
              if (logout) {
                logout();
              }
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
