import * as React from "react"
import {
  Home,
  Book,
  Users,
  Settings,
  HelpCircle,
  FileText,
  ChevronDown,
  Bug,
  Ghost,
  Scroll,
  X,
  Building,
  Mail,
  Lock,
  Shield,
  ScrollText,
  User,
  Palette,
  Type,
  Bell,
  Link,
  Eye,
  Volume2,
  SunMoon,
  Database,
  UserCircle
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
  const [accessibilityOpen, setAccessibilityOpen] = React.useState(false);
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
    <SidebarContent>
      {/* Close Button */}
      <button
        onClick={() => sidebar?.setOpenMobile(false)}
        className="absolute right-4 top-8 h-10 w-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary lg:hidden"
      >
        <X className="h-8 w-8" />
        <span className="sr-only">Close</span>
      </button>

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
                    tooltip="Home"
                  >
                    <Home className="h-[18px] w-[18px]" />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location === '/stories'} 
                    onClick={() => handleNavigation('/stories')}
                    tooltip="Index"
                  >
                    <Scroll className="h-[18px] w-[18px]" />
                    <span>Index</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={location === '/reader'} 
                    onClick={() => handleNavigation('/reader')}
                    tooltip="Reader"
                  >
                    <Book className="h-[18px] w-[18px]" />
                    <span>Reader</span>
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
                            <Eye className="h-[18px] w-[18px]" />
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
                                isActive={location === '/settings/text-to-speech'}
                                onClick={() => handleNavigation('/settings/text-to-speech')}
                              >
                                <Volume2 className="h-4 w-4 mr-2 opacity-70" />
                                <span>Text-to-Speech</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={location === '/settings/display'}
                                onClick={() => handleNavigation('/settings/display')}
                              >
                                <Eye className="h-4 w-4 mr-2 opacity-70" />
                                <span>Display Settings</span>
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
                                isActive={location === '/settings/connected-accounts'}
                                onClick={() => handleNavigation('/settings/connected-accounts')}
                              >
                                <Link className="h-4 w-4 mr-2 opacity-70" />
                                <span>Connected Accounts</span>
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
                            isActive={location === '/support/feedback'}
                            onClick={() => handleNavigation('/support/feedback')}
                          >
                            <ScrollText className="h-4 w-4 mr-2 opacity-70" />
                            <span>Feedback & Suggestions</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/support/guidelines'}
                            onClick={() => handleNavigation('/support/guidelines')}
                          >
                            <Book className="h-4 w-4 mr-2 opacity-70" />
                            <span>User Guidelines</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem className="mt-2 pt-2 border-t border-border/50">
                          <SidebarMenuSubButton
                            isActive={location === '/legal/terms'}
                            onClick={() => handleNavigation('/legal/terms')}
                          >
                            <FileText className="h-4 w-4 mr-2 opacity-70" />
                            <span>Terms of Service</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/legal/copyright'}
                            onClick={() => handleNavigation('/legal/copyright')}
                          >
                            <Shield className="h-4 w-4 mr-2 opacity-70" />
                            <span>Copyright Policy</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={location === '/privacy'}
                            onClick={() => handleNavigation('/privacy')}
                          >
                            <Lock className="h-4 w-4 mr-2 opacity-70" />
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