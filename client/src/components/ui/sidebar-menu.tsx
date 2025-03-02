import * as React from "react"
import {
  Home, Book, Users, Settings, HelpCircle, FileText, ChevronDown,
  Bug, Scroll, Building, Mail, Lock, Shield, ScrollText,
  User, Palette, Type, Bell, Link, Eye, Volume2, SunMoon, Database,
  UserCircle, Monitor, PlayCircle, MessageSquare
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

  // Handle escape key to close mobile sidebar
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebar?.isMobile && sidebar.openMobile) {
        sidebar.setOpenMobile(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [sidebar]);

  return (
    <SidebarContent className="w-64 flex flex-col bg-sidebar bg-opacity-95 backdrop-blur-sm border-r border-sidebar-border">
      <div className="flex items-center px-4 py-3 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Bubble's Cafe</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent">
        <div className="space-y-2">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location === '/'} 
                    onClick={() => handleNavigation('/')}
                    tooltip="Home"
                    className="px-2 py-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    <span className="text-sm">Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location === '/stories'} 
                    onClick={() => handleNavigation('/stories')}
                    tooltip="Index"
                    className="px-2 py-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
                  >
                    <Scroll className="h-4 w-4" />
                    <span className="text-sm">Index</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location === '/reader'} 
                    onClick={() => handleNavigation('/reader')}
                    tooltip="Reader"
                    className="px-2 py-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
                  >
                    <Book className="h-4 w-4" />
                    <span className="text-sm">Reader</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location === '/community'} 
                    onClick={() => handleNavigation('/community')}
                    tooltip="Community"
                    className="px-2 py-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Community</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Display Settings */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70">Display Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Collapsible open={displayOpen} onOpenChange={setDisplayOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="px-2 py-1.5 hover:bg-sidebar-accent rounded-md transition-colors">
                        <Palette className="h-4 w-4" />
                        <span className="text-sm">Display Settings</span>
                        <ChevronDown className={cn(
                          "ml-auto h-3 w-3 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
                          displayOpen && "rotate-180"
                        )} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 px-2 py-1">
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/theme'}
                            onClick={() => handleNavigation('/settings/theme')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <SunMoon className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Dark/Light Mode</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/fonts'}
                            onClick={() => handleNavigation('/settings/fonts')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <Type className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Font Size & Style</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/tts'}
                            onClick={() => handleNavigation('/settings/tts')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
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
            <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70">Account Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="px-2 py-1.5 hover:bg-sidebar-accent rounded-md transition-colors">
                        <UserCircle className="h-4 w-4" />
                        <span className="text-sm">Account Settings</span>
                        <ChevronDown className={cn(
                          "ml-auto h-3 w-3 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
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
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <User className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Profile Settings</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/notifications'}
                            onClick={() => handleNavigation('/settings/notifications')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <Bell className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Notifications</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/privacy'}
                            onClick={() => handleNavigation('/settings/privacy')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <Lock className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Privacy & Security</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/connected'}
                            onClick={() => handleNavigation('/settings/connected')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <Link className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Connected Accounts</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/offline'}
                            onClick={() => handleNavigation('/settings/offline')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
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
            <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70">Support & Legal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="px-2 py-1.5 hover:bg-sidebar-accent rounded-md transition-colors">
                        <HelpCircle className="h-4 w-4" />
                        <span className="text-sm">Support & Legal</span>
                        <ChevronDown className={cn(
                          "ml-auto h-3 w-3 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
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
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <Building className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>About Us</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/contact'}
                            onClick={() => handleNavigation('/contact')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <Mail className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Contact Support</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/feedback'}
                            onClick={() => handleNavigation('/feedback')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Feedback & Suggestions</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/guidelines'}
                            onClick={() => handleNavigation('/guidelines')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <ScrollText className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>User Guidelines</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/terms'}
                            onClick={() => handleNavigation('/terms')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <FileText className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Terms of Service</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/copyright'}
                            onClick={() => handleNavigation('/copyright')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <Shield className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Copyright Policy</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/privacy'}
                            onClick={() => handleNavigation('/privacy')}
                            className="px-2 py-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors text-sm"
                          >
                            <Lock className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Privacy Policy</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="mt-auto border-t border-sidebar-border p-2 space-y-2">
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="w-full text-sm bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-sm"
            onClick={() => handleNavigation("/auth")}
          >
            Sign In
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sm hover:bg-sidebar-accent"
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
            "text-sm flex items-center justify-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors",
            location === '/report-bug' 
              ? "text-sidebar-primary font-medium bg-sidebar-accent"
              : "text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-accent/50"
          )}
        >
          <Bug className="h-4 w-4" />
          Report Bug
        </button>
      </div>
    </SidebarContent>
  );
}