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
      variant="sidebar"
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="border-r bg-background"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Fixed header */}
        <div className="sticky top-0 z-50 flex-none h-16 px-4 border-b bg-background flex items-center justify-between">
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

        {/* Scrollable content area with flex-1 to take remaining height */}
        <ScrollArea className="flex-1 w-full">
          <div className="p-4">
            <SidebarNavigation onNavigate={handleToggle} />
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}