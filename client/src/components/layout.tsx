import { ReactNode } from "react";
import { MainNav } from "./MainNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Get initial sidebar state from localStorage instead of cookies since we're not using Next.js
  const defaultOpen = typeof window !== 'undefined' ? 
    localStorage.getItem('sidebar_state') === 'true' : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex flex-col min-h-screen">
        <MainNav />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 w-full">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}