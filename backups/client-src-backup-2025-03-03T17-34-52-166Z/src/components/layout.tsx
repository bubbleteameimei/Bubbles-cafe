import { ReactNode } from "react";
import { MainNav } from "./MainNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

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
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}