import React from 'react';
import SearchBar from './SearchBar';
import { NotificationIcon } from './ui/notification-icon';
import { useNotifications } from './NotificationProvider';
import { useTheme } from "@/components/theme-provider";
import { DayNightToggle } from '@/components/ui/day-night-toggle';

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
          {/* Using the day-night toggle component */}
          <div className="scale-75 origin-right">
            <DayNightToggle />
          </div>
          <NotificationIcon className="ml-2" notifications={notifications} />
        </div>
      </div>
    </div>
  );
}

export default SidebarHeader;