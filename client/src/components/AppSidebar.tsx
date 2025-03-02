import { useSidebar } from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Sidebar } from "@/components/ui/sidebar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { toggleSidebar, isMobile } = useSidebar();

  const handleToggle = () => {
    const currentState = localStorage.getItem('sidebar_state') === 'true';
    localStorage.setItem('sidebar_state', String(!currentState));
    toggleSidebar();
  };

  return (
    <Sidebar variant="floating" className="w-64">
      {/* Header */}
      <div className="sticky top-0 z-10 h-16 px-4 border-b border-border/10 flex items-center justify-between bg-background">
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

      {/* Scrollable content */}
      <div className="overflow-y-auto h-[calc(100vh-4rem)]">
        <SidebarNavigation onNavigate={handleToggle} />
      </div>
    </Sidebar>
  );
}