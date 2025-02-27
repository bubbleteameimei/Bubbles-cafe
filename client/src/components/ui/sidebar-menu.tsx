"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import {
  Home,
  Book,
  Users,
  Settings,
  HelpCircle,
  FileText,
  ChevronDown,
  Bug
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
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigation = React.useCallback((path: string) => {
    if (onNavigate) {
      onNavigate();
    }
    if (isMobile) {
      setOpenMobile(false);
    }
    setLocation(path);
  }, [onNavigate, isMobile, setOpenMobile, setLocation]);

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
                <Home />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Reader */}
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={location === '/reader'} 
                onClick={() => handleNavigation('/reader')}
                tooltip="Reader"
              >
                <Book />
                <span>Reader</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Community */}
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={location === '/community'} 
                onClick={() => handleNavigation('/community')}
                tooltip="Community"
              >
                <Users />
                <span>Community</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Preferences</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {/* Settings & Accessibility Dropdown */}
            <SidebarMenuItem>
              <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Settings & Accessibility">
                    <Settings />
                    <span>Settings & Accessibility</span>
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/profile'}
                        onClick={() => handleNavigation('/settings/profile')}
                      >
                        <span>Profile Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/appearance'}
                        onClick={() => handleNavigation('/settings/appearance')}
                      >
                        <span>Appearance</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/settings/accessibility'}
                        onClick={() => handleNavigation('/settings/accessibility')}
                      >
                        <span>Accessibility</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>

            {/* Support & Legal Dropdown */}
            <SidebarMenuItem>
              <Collapsible open={supportOpen} onOpenChange={setSupportOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Support & Legal">
                    <HelpCircle />
                    <span>Support & Legal</span>
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/support'}
                        onClick={() => handleNavigation('/support')}
                      >
                        <span>Help Center</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/terms'}
                        onClick={() => handleNavigation('/terms')}
                      >
                        <span>Terms of Service</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={location === '/privacy'}
                        onClick={() => handleNavigation('/privacy')}
                      >
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
            <Bug className="h-4 w-4" />
            Report a Bug
          </button>
        </div>
      </div>
    </SidebarContent>
  );
}