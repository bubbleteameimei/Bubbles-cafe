import React, { ReactNode, useEffect, useState } from "react";
import MainNav from "./MainNav";
import { SidebarProvider } from "./ui/sidebar";
import { EnvironmentIndicator } from "./ui/environment-indicator";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const defaultOpen = typeof window !== 'undefined' ? 
    localStorage.getItem('sidebar_state') === 'true' : true;
  
  // State to track device type for enhanced responsive design
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'laptop' | 'desktop'>('desktop');
  
  // Effect to detect and update device type based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width >= 640 && width < 1024) {
        setDeviceType('tablet');
      } else if (width >= 1024 && width < 1280) {
        setDeviceType('laptop');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // Initial call
    handleResize();
    
    // Setup resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-[100dvh]" data-device-type={deviceType}>
        {/* Desktop Sidebar - Now hidden by default, only accessible via menu button */}
        {/* Removing fixed sidebar to ensure menu button works on all screen sizes */}

        {/* Main Content Area - Full width since we removed fixed sidebar */}
        <div className="flex-1 flex flex-col min-w-0 bg-background 
                        transition-all duration-300 ease-in-out">
          <MainNav />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto 
                          p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12
                          max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%] xl:max-w-[1800px] 2xl:max-w-[2000px]
                          transition-all duration-300 ease-in-out">
              {/* Content wrapper with device-type data attribute for targeted styling */}
              <div className="content-wrapper" data-device-type={deviceType}>
                {children}
              </div>
            </div>
          </main>
          <EnvironmentIndicator />
        </div>
      </div>
    </SidebarProvider>
  );
}