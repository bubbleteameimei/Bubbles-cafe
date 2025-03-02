import { useSidebar } from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <SidebarContent className="flex flex-col h-screen bg-background">
        {/* Fixed header */}
        <div className="sticky top-0 z-50 flex-none h-16 px-4 border-b border-border/10 flex items-center justify-between bg-background">
          <h2 className="text-lg font-semibold">Horror Stories</h2>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className="ml-auto h-8 w-8"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Main navigation with nested scrolling */}
        <div className="flex-1 h-[calc(100vh-4rem)] overflow-hidden">
          {/* Main scroll container */}
          <div className="h-full overflow-y-auto overflow-x-hidden">
            {/* Inner content container */}
            <div className="h-full py-2">
              <SidebarNavigation onNavigate={handleToggle} />
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}