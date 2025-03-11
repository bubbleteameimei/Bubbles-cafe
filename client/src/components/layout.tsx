import React from "react";
import { ReactNode } from "react";
import MainNav from "./MainNav";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { EnvironmentIndicator } from "../components/ui/environment-indicator";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const defaultOpen = typeof window !== 'undefined' ? 
    localStorage.getItem('sidebar_state') === 'true' : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-[100dvh]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <MainNav />
          <main className="flex-1 overflow-y-auto">
            {/* Optimized content width container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
              {/* Content wrapper with max-width for optimal readability */}
              <div className="prose prose-lg dark:prose-invert mx-auto">
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