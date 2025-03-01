import * as React from "react"
import {
  Home,
  Book,
  HelpCircle,
  FileText,
  ChevronDown,
  Bug,
  Ghost,
  Scroll,
  BookOpen,
  Building,
  Mail,
  Lock,
  Shield,
  ScrollText,
  Settings,
  User,
  Palette,
  Type,
  Bell,
  Eye,
  Volume2,
  SunMoon,
  Database,
  UserCircle,
  Accessibility
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
  const [personalizationOpen, setPersonalizationOpen] = React.useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = React.useState(false);
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
    <SidebarContent className="flex h-full flex-col">
      <div className="flex items-center px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Ghost className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Horror Blog</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <div className="space-y-4">
          {/* Stories Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Stories</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location === '/'} 
                    onClick={() => handleNavigation('/')}
                    tooltip="Featured Stories"
                  >
                    <Home className="h-[18px] w-[18px]" />
                    <span>Featured Stories</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location === '/stories'} 
                    onClick={() => handleNavigation('/stories')}
                    tooltip="Story Archive"
                  >
                    <Scroll className="h-[18px] w-[18px]" />
                    <span>Story Archive</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location === '/reader'} 
                    onClick={() => handleNavigation('/reader')}
                    tooltip="Reader Mode"
                  >
                    <BookOpen className="h-[18px] w-[18px]" />
                    <span>Reader Mode</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Settings Section */}
          {user && (
            <>
              {/* Personalization Settings */}
              <SidebarGroup>
                <SidebarGroupLabel>Personalization</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Collapsible open={personalizationOpen} onOpenChange={setPersonalizationOpen}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <Palette className="h-[18px] w-[18px]" />
                            <span>Appearance</span>
                            <ChevronDown className={cn(
                              "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                              personalizationOpen && "rotate-180"
                            )} />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="animate-accordion-down">
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={location === '/settings/theme'}
                                onClick={() => handleNavigation('/settings/theme')}
                              >
                                <SunMoon className="h-4 w-4 mr-2 opacity-70" />
                                <span>Theme Settings</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={location === '/settings/fonts'}
                                onClick={() => handleNavigation('/settings/fonts')}
                              >
                                <Type className="h-4 w-4 mr-2 opacity-70" />
                                <span>Font Settings</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Accessibility Settings */}
              <SidebarGroup>
                <SidebarGroupLabel>Accessibility</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Collapsible open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <Accessibility className="h-[18px] w-[18px]" />
                            <span>Accessibility</span>
                            <ChevronDown className={cn(
                              "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                              accessibilityOpen && "rotate-180"
                            )} />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="animate-accordion-down">
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={location === '/settings/accessibility'}
                                onClick={() => handleNavigation('/settings/accessibility')}
                              >
                                <Eye className="h-4 w-4 mr-2 opacity-70" />
                                <span>Accessibility Options</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={location === '/settings/text-to-speech'}
                                onClick={() => handleNavigation('/settings/text-to-speech')}
                              >
                                <Volume2 className="h-4 w-4 mr-2 opacity-70" />
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
                <SidebarGroupLabel>Account</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <UserCircle className="h-[18px] w-[18px]" />
                            <span>Account Settings</span>
                            <ChevronDown className={cn(
                              "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                              accountOpen && "rotate-180"
                            )} />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="animate-accordion-down">
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={location === '/settings/profile'}
                                onClick={() => handleNavigation('/settings/profile')}
                              >
                                <User className="h-4 w-4 mr-2 opacity-70" />
                                <span>Profile Settings</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={location === '/settings/notifications'}
                                onClick={() => handleNavigation('/settings/notifications')}
                              >
                                <Bell className="h-4 w-4 mr-2 opacity-70" />
                                <span>Notifications</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={location === '/settings/privacy'}
                                onClick={() => handleNavigation('/settings/privacy')}
                              >
                                <Lock className="h-4 w-4 mr-2 opacity-70" />
                                <span>Privacy & Security</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={location === '/settings/offline'}
                                onClick={() => handleNavigation('/settings/offline')}
                              >
                                <Database className="h-4 w-4 mr-2 opacity-70" />
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
            </>
          )}

          {/* Help & Resources Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Help & Resources</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <HelpCircle className="h-[18px] w-[18px]" />
                        <span>Support & Legal</span>
                        <ChevronDown className={cn(
                          "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                          supportOpen && "rotate-180"
                        )} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="animate-accordion-down">
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/about'}
                            onClick={() => handleNavigation('/about')}
                          >
                            <Building className="h-4 w-4 mr-2 opacity-70" />
                            <span>About Us</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/contact'}
                            onClick={() => handleNavigation('/contact')}
                          >
                            <Mail className="h-4 w-4 mr-2 opacity-70" />
                            <span>Contact Support</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/privacy'}
                            onClick={() => handleNavigation('/privacy')}
                          >
                            <Shield className="h-4 w-4 mr-2 opacity-70" />
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

      <div className="mt-auto border-t border-border/50 p-4 space-y-4">
        {!user ? (
          <Button
            variant="default"
            size="sm"
            className="w-full text-base bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => handleNavigation("/auth")}
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

        <button
          onClick={() => handleNavigation('/report-bug')}
          className={cn(
            "text-base flex items-center justify-center gap-2 w-full px-2 py-1.5 rounded-sm transition-colors",
            location === '/report-bug' 
              ? "text-primary font-semibold bg-primary/10"
              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
          )}
        >
          <Bug className="h-[18px] w-[18px]" />
          Report a Bug
        </button>
      </div>
    </SidebarContent>
  );
}