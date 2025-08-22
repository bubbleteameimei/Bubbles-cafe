import { useSidebar } from "./ui/sidebar";
import { SidebarNavigation } from "./ui/sidebar-menu";
import { Sidebar, SidebarContent } from "./ui/sidebar";
import { X, Menu } from "lucide-react";
import { Button } from "./ui/button";
import "../styles/sidebar.css";
import { useEffect, useState } from "react";

// Removed unused responsive widths constant

export function AppSidebar() {
  const { toggleSidebar, isMobile, openMobile, setOpenMobile, open } = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  // Effect to detect scroll position for conditional styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggle = () => {
    const currentState = localStorage.getItem('sidebar_state') === 'true';
    localStorage.setItem('sidebar_state', String(!currentState));
    toggleSidebar();
  };

  // Determine sidebar width based on device type (unused)
  // const getSidebarWidth = () => {
  //   if (isMobile) {
  //     return SIDEBAR_WIDTHS.mobile;
  //   } else if (deviceType === 'desktop' && window.innerWidth >= 1536) {
  //     return SIDEBAR_WIDTHS.xxl;
  //   } else if (deviceType === 'desktop') {
  //     return SIDEBAR_WIDTHS.xl;
  //   } else if (deviceType === 'laptop') {
  //     return SIDEBAR_WIDTHS.laptop;
  //   } else {
  //     return SIDEBAR_WIDTHS.tablet;
  //   }
  // };

  return (
    <Sidebar
      collapsible="offcanvas"
      className={`flex flex-col h-screen bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]
                dark:bg-[hsl(var(--background))] dark:border-r dark:border-gray-800
                transition-all duration-300 ease-in-out`}
    >
      <SidebarContent>
        {/* Enhanced fixed header with conditional shadow on scroll */}
        <div className={`sticky top-0 z-50 flex-none h-16 px-4 lg:px-6 xl:px-8 
                        border-b border-[hsl(var(--sidebar-border))] 
                        flex items-center justify-between
                        transition-all duration-300 ease-in-out
                        dark:border-gray-800
                        ${scrolled ? 'bg-background/95 backdrop-blur shadow-sm' : ''}`}>
          <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold text-[hsl(var(--sidebar-foreground))]">
            Stories
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="ml-auto h-8 w-8 text-[hsl(var(--sidebar-foreground))] 
                      hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]
                      transition-all duration-200 ease-in-out transform active:scale-95"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable content area with improved padding for different device sizes */}
        <div className="flex-1 overflow-y-auto custom-sidebar-scroll">
          <div className="p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6">
            <SidebarNavigation onNavigate={handleToggle} />
          </div>
        </div>
        
        {/* Menu trigger button - visible when sidebar is closed */}
        {!openMobile && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setOpenMobile(true)}
            className="fixed bottom-6 left-6 h-12 w-12 rounded-full shadow-lg
                      bg-primary text-primary-foreground 
                      z-50 transition-all duration-300 ease-in-out transform hover:scale-105"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
      </SidebarContent>
    </Sidebar>
  );
}