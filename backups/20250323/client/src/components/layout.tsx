import React from "react";
import { ReactNode } from "react";
import MainNav from "./MainNav";
import { SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { EnvironmentIndicator } from "./ui/environment-indicator";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const defaultOpen = typeof window !== 'undefined' ? 
    localStorage.getItem('sidebar_state') === 'true' : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-[100dvh]">
        {/* Desktop Sidebar - Fixed position with scrolling */}
        <aside className="fixed top-0 left-0 z-50 hidden h-screen w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:block overflow-y-auto">
          <AppSidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background lg:pl-64">
          <MainNav />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
          <EnvironmentIndicator />
        </div>
      </div>
    </SidebarProvider>
  );
}