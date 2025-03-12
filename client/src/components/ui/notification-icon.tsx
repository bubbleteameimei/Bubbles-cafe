import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from './badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Button } from './button';
import { useLocation } from 'wouter';
import { Separator } from './separator';
import { ScrollArea } from './scroll-area';

interface Notification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  date: string;
  type: 'story' | 'comment' | 'system';
  link?: string;
}

interface NotificationIconProps {
  notifications?: Notification[];
  className?: string;
}

export function NotificationIcon({ 
  notifications = [], 
  className = '' 
}: NotificationIconProps) {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const [notificationItems, setNotificationItems] = useState<Notification[]>(notifications);

  // Get unread count
  const unreadCount = notificationItems.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotificationItems(notificationItems.map(n => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotificationItems(
      notificationItems.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`relative ${className}`}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : '(no unread)'}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto text-xs" 
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-80 overflow-y-auto">
          {notificationItems.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No notifications yet
            </div>
          ) : (
            <div className="flex flex-col">
              {notificationItems.map((notification) => (
                <button
                  key={notification.id}
                  className={`
                    flex flex-col items-start gap-1 p-4 text-left hover:bg-muted/50 transition-colors
                    border-b border-border/50 last:border-b-0
                    ${notification.read ? 'opacity-70' : 'bg-muted/20'}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm">{notification.title}</span>
                    <span className="text-[10px] text-muted-foreground">{notification.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.description}</p>
                  {!notification.read && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary ml-auto mt-1"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs justify-center"
            onClick={() => {
              navigate('/settings/notifications');
              setOpen(false);
            }}
          >
            Manage notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}