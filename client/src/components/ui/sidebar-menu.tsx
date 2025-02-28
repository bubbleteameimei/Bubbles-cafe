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
  Shield,
  Menu,
  Ghost,
  Scroll,
  BookOpen
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
  const [isOpen, setIsOpen] = React.useState(false);

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
    <SidebarContent className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Ghost className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Horror Blog</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className={cn("flex-1 overflow-auto", isOpen ? "block" : "hidden lg:block")}>
        <div className="space-y-4 py-4">
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

          <SidebarGroup>
            <SidebarGroupLabel>Help & Resources</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Support & Legal">
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