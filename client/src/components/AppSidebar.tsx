import { useSidebar } from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "../styles/sidebar.css";

// Define sidebar widths
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";

export function AppSidebar() {
  const { toggleSidebar, isMobile } = useSidebar();

  const handleToggle = () => {
    const currentState = localStorage.getItem('sidebar_state') === 'true';
    localStorage.setItem('sidebar_state', String(!currentState));
    toggleSidebar();
  };

  return (
    <Sidebar
      collapsible={isMobile ? "offcanvas" : "icon"}
      style={{
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE
      } as React.CSSProperties}
    >
      <SidebarContent className="flex flex-col h-screen bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
        {/* Fixed header */}
        <div className="sticky top-0 z-50 flex-none h-16 px-4 border-b border-[hsl(var(--sidebar-border))] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[hsl(var(--sidebar-foreground))]">Horror Stories</h2>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className="ml-auto h-8 w-8 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Scrollable content area */}
        <ScrollArea className="flex-1 h-[calc(100vh-4rem)]">
          <div className="px-2 py-2">
            <SidebarNavigation onNavigate={handleToggle} />
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}