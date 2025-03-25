import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, ChevronDown, Settings, Filter, AlertTriangle } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { addTestNotification } from '@/utils/add-test-notification';

export interface NotificationIconProps {
  className?: string;
  notifications?: Notification[]; // This is for compatibility with the existing usage
  onClick?: () => void;
  noOutline?: boolean;
}

export function NotificationIcon({ className, onClick, noOutline }: NotificationIconProps) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    addNotification
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      setLocation(notification.link);
    }
    setOpen(false);
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : activeTab === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.read);

  const goToSettings = () => {
    setLocation('/settings/notifications');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative h-9 w-9 rounded-md border border-border/30 hover:bg-accent/10 active:bg-accent/20 transition-all duration-150 ease-out", className)}
          aria-label={`Notifications - ${unreadCount} unread`}
          onClick={onClick ? onClick : undefined}
          noOutline={noOutline}
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
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
        <div className="px-4 py-3 flex items-center border-b">
          <h3 className="font-medium mr-auto">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 text-xs rounded-md"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Mark all read</span>
                <span className="sm:hidden">Read all</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 text-xs text-destructive hover:text-destructive rounded-md"
                onClick={clearNotifications}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Clear all</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Notification tabs */}
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 p-1 px-1 m-1 h-9">
            <TabsTrigger value="all" className="text-xs px-2 py-1.5 min-h-[28px] flex items-center justify-center">
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs px-2 py-1.5 min-h-[28px] flex items-center justify-center">
              Unread
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="text-xs px-2 py-1.5 min-h-[28px] flex items-center justify-center">
              Read
              {(notifications.length - unreadCount) > 0 && (
                <Badge variant="outline" className="ml-1.5 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center">
                  {notifications.length - unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        
          <ScrollArea className="h-[300px]">
            <TabsContent value="all" className="m-0 p-0">
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
                           notification.type === 'error' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                           notification.type === 'warning' ? <AlertTriangle className="h-3.5 w-3.5" /> :
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
                          {notification.link && (
                            <div className="mt-1">
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-6 p-0 text-xs text-primary"
                              >
                                {notification.link.includes('/reader') 
                                  ? 'Read story' 
                                  : 'View details'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="m-0 p-0">
              {filteredNotifications.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <Check className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No unread notifications</p>
                  <p className="text-xs mt-1">All caught up!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 bg-primary/5"
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
                           notification.type === 'error' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                           notification.type === 'warning' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                           notification.type === 'new-story' ? <Bell className="h-3.5 w-3.5" /> :
                           <Bell className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium leading-tight">
                              {notification.title}
                            </p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {format(notification.date, 'MMM d')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          {notification.link && (
                            <div className="mt-1">
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-6 p-0 text-xs text-primary"
                              >
                                {notification.link.includes('/reader') 
                                  ? 'Read story' 
                                  : 'View details'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="read" className="m-0 p-0">
              {filteredNotifications.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No read notifications</p>
                  <p className="text-xs mt-1">Check back later</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50"
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
                           notification.type === 'error' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                           notification.type === 'warning' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                           notification.type === 'new-story' ? <Bell className="h-3.5 w-3.5" /> :
                           <Bell className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium leading-tight text-muted-foreground">
                              {notification.title}
                            </p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {format(notification.date, 'MMM d')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                          {notification.link && (
                            <div className="mt-1">
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-6 p-0 text-xs text-primary"
                              >
                                {notification.link.includes('/reader') 
                                  ? 'Read story' 
                                  : 'View details'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <div className="p-2 border-t flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={goToSettings}
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Settings
          </Button>
          
          {/* Test notification button - visible in development mode only */}
          {import.meta.env.DEV && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addTestNotification(addNotification, 'new-story')}
              className="h-7 text-[11px]"
            >
              <Bell className="h-3 w-3 mr-1" />
              Test
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}