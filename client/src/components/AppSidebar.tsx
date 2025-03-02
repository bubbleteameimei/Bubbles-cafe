import { useSidebar } from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar variant="floating">
      <SidebarContent className="relative max-h-screen overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute top-2 right-2 z-50"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
        <SidebarNavigation onNavigate={toggleSidebar} />
      </SidebarContent>
    </Sidebar>
  );
}