import * as React from "react"
import {
  Home, Book, Users, Settings, HelpCircle, FileText, ChevronDown,
  Bug, Scroll, Shield, ShieldAlert, Monitor, ScrollText, Bell, Lock, Building,
  Mail, MessageSquare, Database, Palette, Moon, Sun, Type, Volume2,
  User, Link2 as Link, CircleUserRound as UserCircle, LogIn, Bookmark as BookmarkIcon,
  LineChart
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

  return (
    <div className="flex flex-col space-y-2 p-2 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
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
                className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/stories'}
                onClick={() => handleNavigation('/stories')}
                tooltip="Index"
                className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              >
                <Scroll className="h-4 w-4" />
                <span>Index</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/reader'}
                onClick={() => handleNavigation('/reader')}
                tooltip="Reader"
                className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              >
                <Book className="h-4 w-4" />
                <span>Reader</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location === '/community'}
                onClick={() => handleNavigation('/community')}
                tooltip="Community"
                className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              >
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
                className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              >
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
                          className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                        >
                          <Monitor className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Dashboard</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/users'}
                          onClick={() => handleNavigation('/admin/users')}
                          className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                        >
                          <Users className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Manage Users</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/stories'}
                          onClick={() => handleNavigation('/admin/stories')}
                          className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                        >
                          <ScrollText className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Manage Stories</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/content'}
                          onClick={() => handleNavigation('/admin/content')}
                          className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                        >
                          <FileText className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Content</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/content-moderation'}
                          onClick={() => handleNavigation('/admin/content-moderation')}
                          className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Moderation</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/analytics'}
                          onClick={() => handleNavigation('/admin/analytics')}
                          className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                        >
                          <LineChart className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>Analytics</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/feedback'}
                          onClick={() => handleNavigation('/admin/feedback')}
                          className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-2 opacity-70" />
                          <span>User Feedback</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={location === '/admin/bug-reports'}
                          onClick={() => handleNavigation('/admin/bug-reports')}
                          className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
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
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <Palette className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Visual Horror Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/fonts'}
                        onClick={() => handleNavigation('/settings/fonts')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <Type className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Font Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/accessibility'}
                        onClick={() => handleNavigation('/settings/accessibility')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <HelpCircle className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Reading Preferences</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/text-to-speech'}
                        onClick={() => handleNavigation('/settings/text-to-speech')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
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
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <User className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Profile Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/notifications'}
                        onClick={() => handleNavigation('/settings/notifications')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <Bell className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Notifications</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/privacy'}
                        onClick={() => handleNavigation('/settings/privacy')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <Lock className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Privacy & Security</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/connected'}
                        onClick={() => handleNavigation('/settings/connected')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <Link className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Connected Accounts</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/offline'}
                        onClick={() => handleNavigation('/settings/offline')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
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
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <Building className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>About Us</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/contact'}
                        onClick={() => handleNavigation('/contact')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <Mail className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Contact Support</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/report-bug'}
                        onClick={() => handleNavigation('/report-bug')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <Bug className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Report a Bug</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/terms'}
                        onClick={() => handleNavigation('/legal/terms')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <FileText className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Terms of Service</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/privacy'}
                        onClick={() => handleNavigation('/privacy')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <Lock className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Privacy Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/copyright'}
                        onClick={() => handleNavigation('/legal/copyright')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <Shield className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Copyright Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/feedback'}
                        onClick={() => handleNavigation('/feedback')}
                        className="text-[hsl(var(--sidebar-foreground))] data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Provide Feedback</span>
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