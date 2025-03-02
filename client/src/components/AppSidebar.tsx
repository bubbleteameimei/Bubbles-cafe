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
      collapsible="icon"
      className="border-r border-border/10"
      style={{ 
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE 
      } as React.CSSProperties}
    >
      <SidebarContent>
        {/* Header with title and mobile close button */}
        <div className="sticky top-0 z-10 flex-none h-16 px-4 border-b border-border/10 flex items-center justify-between bg-background">
          <h2 className="text-lg font-semibold">Horror Stories</h2>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className="h-8 w-8 shrink-0"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation content */}
        <div className="flex-1 overflow-hidden">
          <nav className="h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent">
            <SidebarNavigation onNavigate={handleToggle} />
          </nav>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}