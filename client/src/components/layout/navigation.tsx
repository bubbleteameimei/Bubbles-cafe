import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu } from "lucide-react";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { useNotifications } from "@/components/NotificationProvider";

export default function Navigation() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { notifications } = useNotifications();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="container flex h-14 items-center justify-between">
        {/* Mobile Menu Trigger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              title="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SidebarNavigation onNavigate={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Right-side Actions */}
        <div className="flex items-center space-x-4">
          <NotificationIcon notifications={notifications} />
          <ThemeToggle />
          {!user && (
            <Button
              variant="default"
              onClick={() => {
                setIsOpen(false);
                setLocation("/auth");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}