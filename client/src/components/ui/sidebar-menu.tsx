"use client"

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
  LayoutList,
  Lock,
  Mail,
  Building,
  ScrollText,
  Shield
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

  if (!sidebar) {
    console.warn('[Sidebar] Missing SidebarProvider context');
    return null;
  }

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {/* Home */}
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

            {/* Story Index */}
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={location === '/stories'} 
                onClick={() => handleNavigation('/stories')}
                tooltip="Stories"
              >
                <LayoutList className="h-[18px] w-[18px]" />
                <span>Story Index</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Reader */}
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

      <SidebarGroup>
        <SidebarGroupLabel>Support & Legal</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Support & Legal">
                    <HelpCircle className="h-[18px] w-[18px]" />
                    <span>Support & Legal</span>
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {/* Support Section */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/about'}
                        onClick={() => handleNavigation('/about')}
                      >
                        <Building className="h-4 w-4 mr-2" />
                        <span>About Us</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/contact'}
                        onClick={() => handleNavigation('/contact')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Contact Support</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/support/feedback'}
                        onClick={() => handleNavigation('/support/feedback')}
                      >
                        <ScrollText className="h-4 w-4 mr-2" />
                        <span>Feedback & Suggestions</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/support/guidelines'}
                        onClick={() => handleNavigation('/support/guidelines')}
                      >
                        <Book className="h-4 w-4 mr-2" />
                        <span>User Guidelines</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    {/* Legal Section */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/terms'}
                        onClick={() => handleNavigation('/legal/terms')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Terms of Service</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/copyright'}
                        onClick={() => handleNavigation('/legal/copyright')}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Copyright Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/privacy'}
                        onClick={() => handleNavigation('/privacy')}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        <span>Privacy Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/legal/cookie-policy'}
                        onClick={() => handleNavigation('/legal/cookie-policy')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Cookie Policy</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-auto">
        <div className="pt-4 space-y-4 border-t border-border/50 p-2">
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
              "text-base flex items-center justify-center gap-2 w-full px-2 py-1.5 rounded-sm",
              location === '/report-bug' 
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            <Bug className="h-[18px] w-[18px]" />
            Report a Bug
          </button>
        </div>
      </div>
    </SidebarContent>
  );
}