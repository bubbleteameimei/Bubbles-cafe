import React from 'react';
import SearchBar from './SearchBar';
import { NotificationIcon } from './ui/notification-icon';
import { useNotifications } from './NotificationProvider';
import { ThemeToggleButton } from './ui/theme-toggle-button';

interface SidebarHeaderProps {
  categories?: string[];
}

export function SidebarHeader({ categories = ["PSYCHOLOGICAL", "LOVECRAFTIAN", "GOTHIC", "DEATH", "PARASITE"] }: SidebarHeaderProps) {
  const { notifications } = useNotifications();
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between pb-2">
        <SearchBar compact={true} categories={categories} />
        <div className="flex items-center space-x-2">
          <ThemeToggleButton />
          <NotificationIcon notifications={notifications} />
        </div>
      </div>
    </div>
  );
}

export default SidebarHeader;