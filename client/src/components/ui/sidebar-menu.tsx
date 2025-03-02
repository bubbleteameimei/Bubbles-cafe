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

  return (
    <div className="flex flex-col space-y-2 p-2">
      {/* Main Navigation */}
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70">
          Navigation
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={location === '/'} 
                onClick={() => handleNavigation('/')}
                tooltip="Home"
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
              >
                <Users className="h-4 w-4" />
                <span>Community</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Display Settings */}
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70">
          Display Settings
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={displayOpen} onOpenChange={setDisplayOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                    <div className="flex items-center">
                      <Palette className="h-4 w-4 mr-2" />
                      <span>Display Settings</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
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
                      >
                        <SunMoon className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Dark/Light Mode</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/fonts'}
                        onClick={() => handleNavigation('/settings/fonts')}
                      >
                        <Type className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Font Size & Style</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/tts'}
                        onClick={() => handleNavigation('/settings/tts')}
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
        <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70">
          Account Settings
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                    <div className="flex items-center">
                      <UserCircle className="h-4 w-4 mr-2" />
                      <span>Account Settings</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
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
                      >
                        <User className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Profile Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/notifications'}
                        onClick={() => handleNavigation('/settings/notifications')}
                      >
                        <Bell className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Notifications</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/privacy'}
                        onClick={() => handleNavigation('/settings/privacy')}
                      >
                        <Lock className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Privacy & Security</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/connected'}
                        onClick={() => handleNavigation('/settings/connected')}
                      >
                        <Link className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Connected Accounts</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/offline'}
                        onClick={() => handleNavigation('/settings/offline')}
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
        <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70">
          Support & Legal
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                    <div className="flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      <span>Support & Legal</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
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
                      >
                        <Building className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>About Us</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/contact'}
                        onClick={() => handleNavigation('/contact')}
                      >
                        <Mail className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Contact Support</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/feedback'}
                        onClick={() => handleNavigation('/feedback')}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Feedback & Suggestions</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/terms'}
                        onClick={() => handleNavigation('/terms')}
                      >
                        <FileText className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Terms of Service</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/privacy'}
                        onClick={() => handleNavigation('/privacy')}
                      >
                        <Lock className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span>Privacy Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/copyright'}
                        onClick={() => handleNavigation('/copyright')}
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
      <div className="mt-auto pt-4 border-t border-border/10">
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="w-full text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => handleNavigation("/auth")}
          >
            Sign In
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sm hover:bg-accent/50"
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
              ? "text-primary font-medium bg-accent/50"
              : "text-muted-foreground hover:text-primary hover:bg-accent/50"
          )}
        >
          <Bug className="h-4 w-4" />
          Report Bug
        </button>
      </div>
    </div>
  );
}