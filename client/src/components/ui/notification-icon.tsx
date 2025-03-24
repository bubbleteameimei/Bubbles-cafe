import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/contexts/notification-context';
import { cn } from '@/lib/utils';

export interface NotificationIconProps {
  className?: string;
  notifications?: Notification[]; // This is for compatibility with the existing usage
  onClick?: () => void;
  noOutline?: boolean;
}

export function NotificationIcon({ className, onClick, noOutline }: NotificationIconProps) {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      window.location.href = notification.link;
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", className)}
          aria-label={`Notifications - ${unreadCount} unread`}
          onClick={onClick}
          noOutline={noOutline}
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <Badge 
                  variant="destructive" 
                  className="h-4 min-w-4 px-1 text-[10px] font-semibold rounded-full"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                onClick={clearNotifications}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">You'll be notified when new stories are published</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 p-1 rounded-full",
                      notification.type === 'success' ? "bg-green-100 text-green-700" :
                      notification.type === 'error' ? "bg-red-100 text-red-700" :
                      notification.type === 'warning' ? "bg-yellow-100 text-yellow-700" :
                      notification.type === 'new-story' ? "bg-primary/10 text-primary" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {notification.type === 'success' ? <Check className="h-3.5 w-3.5" /> :
                       notification.type === 'new-story' ? <Bell className="h-3.5 w-3.5" /> :
                       <Bell className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className={cn(
                          "text-sm font-medium leading-tight",
                          !notification.read && "text-foreground",
                          notification.read && "text-muted-foreground"
                        )}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {format(notification.date, 'MMM d')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}