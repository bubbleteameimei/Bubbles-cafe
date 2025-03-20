import { useSidebar } from "./ui/sidebar";
import { SidebarNavigation } from "./ui/sidebar-menu";
import { Sidebar, SidebarContent } from "./ui/sidebar";
import { X } from "lucide-react";
import { Button } from "./ui/button";
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
      className="flex flex-col h-screen bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]"
    >
      <SidebarContent>
        {/* Fixed header */}
        <div className="sticky top-0 z-50 flex-none h-16 px-4 border-b border-[hsl(var(--sidebar-border))] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[hsl(var(--sidebar-foreground))]">Stories</h2>
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
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <SidebarNavigation onNavigate={handleToggle} />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}