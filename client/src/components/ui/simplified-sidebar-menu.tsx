import * as React from "react"
import {
  Home, Book, Users, Settings, HelpCircle, 
  User, Bookmark as BookmarkIcon, Bell, Search
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocation } from "wouter"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"

// Simplified navigation structure - Max 7 items as per UX best practices
const mainNavItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    description: "Browse latest stories"
  },
  {
    title: "Stories",
    url: "/posts",
    icon: Book,
    description: "All horror stories"
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
    description: "Find specific content"
  },
  {
    title: "My Bookmarks",
    url: "/bookmarks",
    icon: BookmarkIcon,
    description: "Saved stories",
    requiresAuth: true
  },
  {
    title: "Community",
    url: "/community",
    icon: Users,
    description: "Connect with readers"
  }
];

const userNavItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
    requiresAuth: true
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    requiresAuth: true
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    requiresAuth: true
  },
  {
    title: "Help",
    url: "/support",
    icon: HelpCircle
  }
];

export function SimplifiedSidebarNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const sidebar = useSidebar();

  const handleNavigation = React.useCallback((url: string) => {
    setLocation(url);
    onNavigate?.();
    // Close mobile sidebar after navigation
    if (sidebar?.isMobile) {
      sidebar.setOpenMobile(false);
    }
  }, [setLocation, onNavigate, sidebar]);

  const isActive = React.useCallback((url: string) => {
    if (url === "/") {
      return location === "/";
    }
    return location.startsWith(url);
  }, [location]);

  return (
    <SidebarContent className="gap-0">
      {/* Main Navigation */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-sm font-semibold text-foreground/80">
          Navigation
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNavItems.map((item) => {
              // Hide auth-required items if user not logged in
              if (item.requiresAuth && !user) return null;
              
              const active = isActive(item.url);
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.url)}
                    isActive={active}
                    className={cn(
                      "w-full justify-start gap-3 p-3 text-sm",
                      "hover:bg-accent/50 transition-colors duration-200",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      active && "bg-accent text-accent-foreground font-medium"
                    )}
                    aria-label={`${item.title}: ${item.description}`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.title}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* User Section */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-sm font-semibold text-foreground/80">
          {user ? "Account" : "Support"}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {userNavItems.map((item) => {
              // Hide auth-required items if user not logged in
              if (item.requiresAuth && !user) return null;
              
              const active = isActive(item.url);
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.url)}
                    isActive={active}
                    className={cn(
                      "w-full justify-start gap-3 p-3 text-sm",
                      "hover:bg-accent/50 transition-colors duration-200",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      active && "bg-accent text-accent-foreground font-medium"
                    )}
                    aria-label={item.title}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Admin Section - Only show for admin users */}
      {user?.isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-foreground/80">
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/admin')}
                  isActive={location.startsWith('/admin')}
                  className={cn(
                    "w-full justify-start gap-3 p-3 text-sm",
                    "hover:bg-accent/50 transition-colors duration-200",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    location.startsWith('/admin') && "bg-accent text-accent-foreground font-medium"
                  )}
                  aria-label="Admin Dashboard"
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Admin Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Auth Actions */}
      <SidebarGroup className="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            {user ? (
              <SidebarMenuItem>
                <div className="px-3 py-2 text-sm border-t">
                  <p className="font-medium text-foreground">
                    {user.username || user.email}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Handle logout
                      handleNavigation('/auth');
                    }}
                    className="w-full justify-start px-0 h-auto mt-2 text-muted-foreground hover:text-foreground"
                  >
                    Sign out
                  </Button>
                </div>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/auth')}
                  className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}