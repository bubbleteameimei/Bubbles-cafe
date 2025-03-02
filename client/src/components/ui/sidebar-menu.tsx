import * as React from "react"
import {
  Home, Book, Users, Settings, HelpCircle, FileText, ChevronDown,
  Bug, Ghost, Scroll, Building, Mail, Lock, Shield, ScrollText,
  User, Palette, Type, Bell, Link, Eye, Volume2, SunMoon, Database,
  UserCircle, Monitor, Sliders, PlayCircle
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
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [personalizationOpen, setPersonalizationOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
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
    <SidebarContent className="w-64 flex flex-col bg-card/95 backdrop-blur-sm border-r border-border/50">
      <div className="flex items-center px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Ghost className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Horror Blog</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-2 px-2">
        <div className="space-y-2">
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">Stories</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location === '/'} 
                    onClick={() => handleNavigation('/')}
                    tooltip="Home"
                    className="px-2 py-1.5 hover:bg-primary/10 rounded-md transition-colors"
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
                    className="px-2 py-1.5 hover:bg-primary/10 rounded-md transition-colors"
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
                    className="px-2 py-1.5 hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Book className="h-4 w-4" />
                    <span className="text-sm">Reader</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">Personalization</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Collapsible open={personalizationOpen} onOpenChange={setPersonalizationOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="px-2 py-1.5 hover:bg-primary/10 rounded-md transition-colors">
                        <Palette className="h-4 w-4" />
                        <span className="text-sm">Display</span>
                        <ChevronDown className={cn(
                          "ml-auto h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200",
                          personalizationOpen && "rotate-180"
                        )} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 px-2 py-1">
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/theme'}
                            onClick={() => handleNavigation('/settings/theme')}
                            className="px-2 py-1.5 hover:bg-primary/5 rounded-md transition-colors text-sm"
                          >
                            <SunMoon className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Theme</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/fonts'}
                            onClick={() => handleNavigation('/settings/fonts')}
                            className="px-2 py-1.5 hover:bg-primary/5 rounded-md transition-colors text-sm"
                          >
                            <Type className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Typography</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/accessibility'}
                            onClick={() => handleNavigation('/settings/accessibility')}
                            className="px-2 py-1.5 hover:bg-primary/5 rounded-md transition-colors text-sm"
                          >
                            <Eye className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Accessibility</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="px-2 py-1.5 hover:bg-primary/10 rounded-md transition-colors">
                        <UserCircle className="h-4 w-4" />
                        <span className="text-sm">Account</span>
                        <ChevronDown className={cn(
                          "ml-auto h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200",
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
                            className="px-2 py-1.5 hover:bg-primary/5 rounded-md transition-colors text-sm"
                          >
                            <User className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Profile</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/settings/notifications'}
                            onClick={() => handleNavigation('/settings/notifications')}
                            className="px-2 py-1.5 hover:bg-primary/5 rounded-md transition-colors text-sm"
                          >
                            <Bell className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Notifications</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">Help & Support</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="px-2 py-1.5 hover:bg-primary/10 rounded-md transition-colors">
                        <HelpCircle className="h-4 w-4" />
                        <span className="text-sm">Support</span>
                        <ChevronDown className={cn(
                          "ml-auto h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200",
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
                            className="px-2 py-1.5 hover:bg-primary/5 rounded-md transition-colors text-sm"
                          >
                            <Building className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>About</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/contact'}
                            onClick={() => handleNavigation('/contact')}
                            className="px-2 py-1.5 hover:bg-primary/5 rounded-md transition-colors text-sm"
                          >
                            <Mail className="h-3.5 w-3.5 mr-2 opacity-70" />
                            <span>Contact</span>
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

      <div className="mt-auto border-t border-border/50 p-2 space-y-2">
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="w-full text-sm bg-primary/90 hover:bg-primary text-primary-foreground"
            onClick={() => handleNavigation("/auth")}
          >
            Sign In
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sm"
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
              ? "text-primary font-medium bg-primary/10"
              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
          )}
        >
          <Bug className="h-4 w-4" />
          Report Bug
        </button>
      </div>
    </SidebarContent>
  );
}