
import * as React from "react"
import {
  Home, Book, Users, Settings, HelpCircle, FileText, ChevronDown,
  Bug, Scroll, Shield, ShieldAlert, Monitor, ScrollText, Bell, Lock, Building,
  Mail, MessageSquare, Database, Palette, Moon, Sun, Type,
  User, Link2 as Link, CircleUserRound as UserCircle, LogIn, Bookmark as BookmarkIcon,
  LineChart, BarChart, AlertTriangle, Ban, ServerCrash, MoveLeft, Clock, WifiOff,
  Search, Sparkles, GanttChart, GamepadIcon, Rss, Grid, Eye
} from "lucide-react"


import { cn } from "@/lib/utils"
import { useLocation } from "wouter"
import { useAuth } from "@/hooks/use-auth"
import { useLoading } from "@/components/GlobalLoadingProvider"
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
  const { showLoading } = useLoading(); // Add loading hook
  const [displayOpen, setDisplayOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const sidebar = useSidebar();
  
  // Add swipe to close functionality with improved reliability
  React.useEffect(() => {
    // Only add touch events if mobile and sidebar is open
    if (!sidebar?.isMobile || !sidebar?.openMobile) return;
    
    // Keep track of the starting position and movement
    let startX = 0;
    let startY = 0;
    let moveX = 0;
    let moveY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      // Store both X and Y coordinates to detect diagonal swipes
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      setTouchStartX(startX);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX) return;
      
      // Get current position
      moveX = e.touches[0].clientX;
      moveY = e.touches[0].clientY;
      
      // Calculate horizontal and vertical difference
      const touchDiffX = startX - moveX;
      const touchDiffY = Math.abs(startY - moveY);
      
      // Only trigger close if swipe is primarily horizontal (not diagonal)
      // This prevents accidental closes when scrolling the menu
      if (touchDiffX > 40 && touchDiffY < 30) {
        // Close the sidebar both ways to ensure it properly closes
        sidebar.setOpenMobile(false);
        
        // Force the sheet to close by finding and clicking its close button
        const closeButton = document.querySelector('[data-sidebar="sidebar"] button') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
        }
        
        setTouchStartX(null); // Reset touch start
      }
    };
    
    const handleTouchEnd = () => {
      // Reset all touch values
      startX = 0;
      startY = 0;
      moveX = 0;
      moveY = 0;
      setTouchStartX(null);
    };
    
    // Add event listeners with passive: false to allow preventDefault if needed
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    
    // Cleanup function
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [sidebar, touchStartX]); // Dependencies include sidebar and touchStartX

  // Navigation logic extracted to a separate state-controlled function
  // This prevents race conditions and ensures clean navigation
  const [isNavigating, setIsNavigating] = React.useState(false);
  
  const handleNavigation = React.useCallback((path: string) => {
    // Prevent duplicate navigation or navigation while in progress
    if (location === path || isNavigating) {
      // Just close sidebar if already on this page
      if (sidebar && sidebar.isMobile && path === location) {
        sidebar.setOpenMobile(false);
      }
      return;
    }
    
    try {
      // Set navigating state to prevent multiple clicks
      setIsNavigating(true);
      
      // Execute in strict sequence to prevent UI freezing:
      
      // 1. Reset UI state first (all menus closed)
      setDisplayOpen(false);
      setAccountOpen(false);
      setSupportOpen(false);
      setAdminOpen(false);
      
      // 2. Close mobile sidebar if open
      if (sidebar && sidebar.isMobile) {
        sidebar.setOpenMobile(false);
      }
      
      // 3. If callback provided, call it
      if (onNavigate) {
        onNavigate();
      }
      
      // 4. Show loading screen for page transitions
      // This needs to be before navigation to ensure it's visible
      showLoading();
      
      // 5. Start a timeout to ensure clean navigation
      // This ensures the loading screen has time to appear before navigation
      setTimeout(() => {
        // Navigate to the new location
        setLocation(path);
        
        // Reset navigation state after a delay
        setTimeout(() => {
          setIsNavigating(false);
        }, 500);
      }, 50);
      
    } catch (error) {
      console.error("Navigation error:", error);
      // Reset navigation state
      setIsNavigating(false);
      // Fallback to direct location navigation as last resort
      window.location.href = path;
    }
  }, [location, isNavigating, onNavigate, sidebar, setLocation, showLoading]);
  
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
  const menuItemClass = "text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent)/90] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:translate-x-1 transition-all duration-200 relative pl-6 whitespace-nowrap py-0.5 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 text-sm font-medium";
  
  // Enhanced submenu item class with hover effects and prevent text wrapping
  const submenuItemClass = "text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent)/90] hover:text-[hsl(var(--sidebar-accent-foreground))] hover:translate-x-1 transition-all duration-200 relative pl-6 whitespace-nowrap focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 text-sm font-medium";





  return (
    <div className="flex flex-col space-y-0 p-1 pt-0 pb-0 h-full max-h-screen overflow-y-auto scrollbar-hide sidebar-menu-container">

      {/* Main Navigation */}
      <SidebarGroup className="mt-0">
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1 uppercase tracking-wider">
          NAVIGATION
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
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1 uppercase tracking-wider">
          GAMES & INTERACTIVE
        </SidebarGroupLabel>
        <SidebarGroupContent className="-mt-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/game-test'}
                onClick={() => handleNavigation('/game-test')}
                tooltip="Eden's Hollow - Experimental Horror Game"
                className={menuItemClass}
              >
                {renderActiveIndicator('/game-test')}
                <GamepadIcon className="h-4 w-4" />
                <span>Eden's Hollow - Experimental</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Admin Navigation - Only show if user is admin */}
      {user?.isAdmin && (
        <SidebarGroup className="mt-1">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1 uppercase tracking-wider">
            ADMINISTRATION
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
                      {/* Dashboard - Keep as main admin page */}
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

                      {/* Content Management - Merges Stories + Content + WordPress Sync */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={
                            location === '/admin/stories' || 
                            location === '/admin/content' || 
                            location === '/admin/wordpress-sync' ||
                            location === '/admin/content-management'
                          }
                          onClick={() => handleNavigation('/admin/content-management')}
                          className={submenuItemClass}
                        >
                          <FileText className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Content Management</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      
                      {/* Theme Management */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/themes'}
                          onClick={() => handleNavigation('/admin/themes')}
                          className={submenuItemClass}
                        >
                          <Palette className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Theme Management</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* User Management - Merges Users + Moderation */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={
                            location === '/admin/users' || 
                            location === '/admin/content-moderation'
                          }
                          onClick={() => handleNavigation('/admin/users')}
                          className={submenuItemClass}
                        >
                          <Users className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>User Management</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Insights & Reports - Merges Analytics + Statistics + Feedback + Bug Reports */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={
                            location === '/admin/analytics' || 
                            location === '/admin/site-statistics' || 
                            location === '/admin/feedback' || 
                            location === '/admin/bug-reports'
                          }
                          onClick={() => handleNavigation('/admin/analytics')}
                          className={submenuItemClass}
                        >
                          <LineChart className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Insights & Reports</span>
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
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1 uppercase tracking-wider">
          READING & ACCESSIBILITY
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
                    
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/pixel-art'}
                        onClick={() => handleNavigation('/pixel-art')}
                        className={submenuItemClass}
                      >
                        <Grid className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Pixel Art</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/quick-settings'}
                        onClick={() => handleNavigation('/settings/quick-settings')}
                        className={submenuItemClass}
                      >
                        <Settings className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Quick Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/preview'}
                        onClick={() => handleNavigation('/settings/preview')}
                        className={submenuItemClass}
                      >
                        <Eye className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Preview</span>
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
      <SidebarGroup className="mt-1">
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1 uppercase tracking-wider">
          ACCOUNT SETTINGS
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
                    
                    {/* Data export menu item removed */}
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
        <SidebarGroupLabel className="px-2 text-xs font-medium text-[hsl(var(--sidebar-foreground))] -mb-1 uppercase tracking-wider">
          SUPPORT & LEGAL
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
            SIGN IN
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
            SIGN OUT
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
          <span className="uppercase tracking-wider font-medium">Report Bug</span>
        </button>
      </div>
    </div>
  );
}
