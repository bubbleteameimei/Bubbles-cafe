
import React from 'react';
import { useDeviceDetection } from '@/hooks/use-mobile';
import { Sidebar } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  withBottomNav?: boolean;
  withPadding?: boolean;
}

export function MobileLayout({
  children,
  className,
  fullWidth = false,
  withBottomNav = true,
  withPadding = true,
}: MobileLayoutProps) {
  const { isMobile, isTablet, orientation } = useDeviceDetection();
  
  // Only apply mobile layout adjustments for mobile devices
  if (!isMobile && !isTablet) {
    return <>{children}</>;
  }
  
  return (
    <div 
      className={cn(
        "mobile-container flex flex-col h-full min-h-screen",
        orientation === 'portrait' ? 'portrait-mode' : 'landscape-mode',
        withBottomNav && "pb-16", // Add padding for bottom nav
        className
      )}
    >
      <ScrollArea className="flex-1 w-full">
        <main 
          className={cn(
            "mobile-content",
            fullWidth ? "w-full" : "container mx-auto",
            withPadding && "px-4 py-2"
          )}
        >
          {children}
        </main>
      </ScrollArea>
      
      {withBottomNav && (
        <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around px-2 z-50">
          <button className="flex flex-col items-center justify-center w-16 h-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          
          <button className="flex flex-col items-center justify-center w-16 h-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span className="text-xs">Search</span>
          </button>
          
          <button className="flex flex-col items-center justify-center w-16 h-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <span className="text-xs">Stories</span>
          </button>
          
          <button className="flex flex-col items-center justify-center w-16 h-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span className="text-xs">Profile</span>
          </button>
        </nav>
      )}
    </div>
  );
}
