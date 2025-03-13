import React from 'react';
import SearchBar from './SearchBar';
import { NotificationIcon } from './ui/notification-icon';
import { useNotifications } from './NotificationProvider';
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

interface SidebarHeaderProps {
  categories?: string[];
}

export function SidebarHeader({ categories = ["PSYCHOLOGICAL", "LOVECRAFTIAN", "GOTHIC", "DEATH", "PARASITE"] }: SidebarHeaderProps) {
  const { notifications } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between pb-2">
        <SearchBar compact={true} categories={categories} />
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent/50 hover:text-accent-foreground focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">
              {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </span>
          </button>
          <NotificationIcon className="ml-2" notifications={notifications} />
        </div>
      </div>
    </div>
  );
}

export default SidebarHeader;