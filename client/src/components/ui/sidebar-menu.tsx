import * as React from "react"
import {
  Home, Book, Users, Settings, HelpCircle, FileText, ChevronDown,
  Bug, Scroll, Shield, ShieldAlert, Monitor, ScrollText, Bell, Lock, Building,
  Mail, MessageSquare, Database, Palette, Moon, Sun, Type, Volume2,
  User, Link2 as Link, CircleUserRound as UserCircle, LogIn, Bookmark as BookmarkIcon,
  LineChart, BarChart, Search, X
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
  const { user, logoutMutation } = useAuth();
  const [displayOpen, setDisplayOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const sidebar = useSidebar();
  
  // Handle clicks outside of search component
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <div className="h-4 w-1 rounded-r-md bg-primary shadow-[0_0_8px_rgba(var(--primary)/0.5)] animate-pulse-subtle" />
          <div className="h-3 w-0.5 rounded-r-md bg-primary/40 ml-0.5 animate-pulse-slow" />
        </div>
      );
    }
    return null;
  };

  // Enhanced menu item class with hover effects
  const menuItemClass = "text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent)/90] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:translate-x-1 transition-all duration-200 relative pl-6";
  
  // Enhanced submenu item class with hover effects
  const submenuItemClass = "text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent)/90] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:translate-x-1 transition-all duration-200 relative pl-6";

  // Define menu structure for searchable items
  const menuItems = React.useMemo(() => [
    { path: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { path: '/stories', label: 'Index', icon: <Scroll className="h-4 w-4" /> },
    { path: '/reader', label: 'Reader', icon: <Book className="h-4 w-4" /> },
    { path: '/community', label: 'Community', icon: <Users className="h-4 w-4" /> },
    { path: '/bookmarks', label: 'Bookmarks', icon: <BookmarkIcon className="h-4 w-4" /> },
    ...(user?.isAdmin ? [
      { path: '/admin/dashboard', label: 'Admin Dashboard', icon: <Monitor className="h-4 w-4" /> },
      { path: '/admin/users', label: 'Manage Users', icon: <Users className="h-4 w-4" /> },
      { path: '/admin/stories', label: 'Manage Stories', icon: <ScrollText className="h-4 w-4" /> },
      { path: '/admin/content', label: 'Content', icon: <FileText className="h-4 w-4" /> },
      { path: '/admin/content-moderation', label: 'Moderation', icon: <ShieldAlert className="h-4 w-4" /> },
      { path: '/admin/analytics', label: 'Analytics', icon: <LineChart className="h-4 w-4" /> },
      { path: '/admin/site-statistics', label: 'Site Statistics', icon: <BarChart className="h-4 w-4" /> },
      { path: '/admin/feedback', label: 'User Feedback', icon: <MessageSquare className="h-4 w-4" /> },
      { path: '/admin/bug-reports', label: 'Bug Reports', icon: <Bug className="h-4 w-4" /> },
    ] : []),
    { path: '/settings/display', label: 'Visual Horror Settings', icon: <Palette className="h-4 w-4" /> },
    { path: '/settings/fonts', label: 'Font Settings', icon: <Type className="h-4 w-4" /> },
    { path: '/settings/accessibility', label: 'Reading Preferences', icon: <HelpCircle className="h-4 w-4" /> },
    { path: '/settings/text-to-speech', label: 'Text-to-Speech', icon: <Volume2 className="h-4 w-4" /> },
  ], [user?.isAdmin]);

  // Filter menu items based on search query
  const filteredMenuItems = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return menuItems.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.path.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, menuItems]);

  // Clear search and reset focus
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchFocused(false);
  };

  return (
    <div className="flex flex-col space-y-2 p-2 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
      {/* Search Input */}
      <div className="px-2 pt-1 pb-3" ref={searchRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-[hsl(var(--sidebar-muted-foreground))]" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2 text-sm rounded-md bg-[hsl(var(--sidebar-secondary))] text-[hsl(var(--sidebar-foreground))] placeholder:text-[hsl(var(--sidebar-muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--sidebar-accent))] transition-all duration-200"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
          />
          {searchQuery && (
            <button 
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[hsl(var(--sidebar-muted-foreground))] hover:text-[hsl(var(--sidebar-foreground))]"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchFocused && searchQuery.trim() !== "" && (
          <div className="mt-1 p-1 rounded-md bg-[hsl(var(--sidebar-secondary))] border border-[hsl(var(--sidebar-border))] shadow-lg max-h-60 overflow-y-auto dropdown-menu-animation">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item) => (
                <button
                  key={item.path}
                  className="flex items-center w-full px-3 py-2 text-sm text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] rounded-md transition-colors duration-200"
                  onClick={() => {
                    handleNavigation(item.path);
                    handleClearSearch();
                  }}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-[hsl(var(--sidebar-muted-foreground))]">
                No menu items found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))]">
          Navigation
        </SidebarGroupLabel>
        <SidebarGroupContent>
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

      {/* Admin Navigation - Only show if user is admin */}
      {user?.isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))]">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-[hsl(var(--sidebar-accent))] data-[state=open]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]">
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
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Accessibility */}
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))]">
          Reading & Accessibility
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={displayOpen} onOpenChange={setDisplayOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="w-full justify-between text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-[hsl(var(--sidebar-accent))] data-[state=open]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
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
                        isActive={location === '/settings/display'}
                        onClick={() => handleNavigation('/settings/display')}
                        className={submenuItemClass}
                      >
                        <Palette className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Visual Horror Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

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
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/text-to-speech'}
                        onClick={() => handleNavigation('/settings/text-to-speech')}
                        className={submenuItemClass}
                      >
                        <Volume2 className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Text-to-Speech</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Account Settings */}
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))]">
          Account Settings
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-[hsl(var(--sidebar-accent))] data-[state=open]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]">
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
                        isActive={location === '/settings/connected-accounts'}
                        onClick={() => handleNavigation('/settings/connected-accounts')}
                        className={submenuItemClass}
                      >
                        <Link className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Connected Accounts</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/offline'}
                        onClick={() => handleNavigation('/settings/offline')}
                        className={submenuItemClass}
                      >
                        <Database className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Offline Access</span>
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
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))]">
          Support & Legal
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between text-[hsl(var(--sidebar-foreground))] data-[state=open]:bg-[hsl(var(--sidebar-accent))] data-[state=open]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]">
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
                        className={`${submenuItemClass} data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] relative pl-6`}
                      >
                        {renderActiveIndicator('/about')}
                        <Building className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>About Me</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/feedback'}
                        onClick={() => handleNavigation('/feedback')}
                        className={`${submenuItemClass} data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] relative pl-6`}
                      >
                        {renderActiveIndicator('/feedback')}
                        <MessageSquare className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Feedback & Suggestions</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/contact'}
                        onClick={() => handleNavigation('/contact')}
                        className={`${submenuItemClass} data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] relative pl-6`}
                      >
                        {renderActiveIndicator('/contact')}
                        <Mail className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Contact Me</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/report-bug'}
                        onClick={() => handleNavigation('/report-bug')}
                        className={`${submenuItemClass} data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] relative pl-6`}
                      >
                        {renderActiveIndicator('/report-bug')}
                        <Bug className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Report a Bug</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/terms'}
                        onClick={() => handleNavigation('/legal/terms')}
                        className={`${submenuItemClass} data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] relative pl-6`}
                      >
                        {renderActiveIndicator('/legal/terms')}
                        <FileText className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Terms of Service</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/privacy'}
                        onClick={() => handleNavigation('/privacy')}
                        className={`${submenuItemClass} data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] relative pl-6`}
                      >
                        {renderActiveIndicator('/privacy')}
                        <Lock className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Privacy Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/copyright'}
                        onClick={() => handleNavigation('/legal/copyright')}
                        className={`${submenuItemClass} data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))] relative pl-6`}
                      >
                        {renderActiveIndicator('/legal/copyright')}
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

      {/* Demo section removed */}

      {/* Footer Buttons */}
      <div className="mt-auto pt-4 border-t border-[hsl(var(--sidebar-border))]">
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="w-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm uppercase tracking-wider px-4 py-2"
            onClick={() => handleNavigation("/auth")}
          >
            Sign In
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sm text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
            onClick={() => {
              if (logoutMutation) {
                logoutMutation.mutate();
              }
            }}
          >
            Sign Out
          </Button>
        )}



        <button
          onClick={() => handleNavigation('/report-bug')}
          className={cn(
            "mt-2 text-sm flex items-center justify-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors",
            location === '/report-bug'
              ? "text-[hsl(var(--sidebar-primary))] font-medium bg-[hsl(var(--sidebar-accent))]"
              : "text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-accent))]"
          )}
        >
          <Bug className="h-4 w-4" />
          Report Bug
        </button>
      </div>
    </div>
  );
}