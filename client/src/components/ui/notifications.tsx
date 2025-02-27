
import { useState, useEffect } from "react";
import { BellRing, Check, Bell, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Notification {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  link?: string;
  category?: string;
}

export function NotificationsDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enablePush, setEnablePush] = useState(false);
  
  // Different notifications based on user type
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Different endpoints based on user type
        let endpoint = '/api/notifications';
        
        if (user?.isAdmin) {
          endpoint = '/api/admin/notifications';
        } else if (user) {
          endpoint = '/api/user/notifications';
        }
        
        // For demo/development, generate some notifications
        if (process.env.NODE_ENV === 'development') {
          const demoNotifications = getDefaultNotifications();
          setNotifications(demoNotifications);
          setIsLoading(false);
          return;
        }
        
        // In production this would fetch from the API
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to defaults if API fails
        setNotifications(getDefaultNotifications());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Refresh notifications periodically (every 5 minutes)
    const intervalId = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  // Get different default notifications based on user type
  const getDefaultNotifications = (): Notification[] => {
    if (user?.isAdmin) {
      return [
        {
          id: 1,
          title: "New community post awaiting approval",
          description: "A user submitted a new horror story for community review",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          type: "warning",
          isRead: false,
          link: "/admin/posts",
          category: "content"
        },
        {
          id: 2,
          title: "Comment flagged for moderation",
          description: "A comment contains potentially inappropriate content",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          type: "error",
          isRead: false,
          link: "/admin/comments",
          category: "moderation"
        },
        {
          id: 3,
          title: "Weekly analytics report available",
          description: "View insights about site traffic and user engagement",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
          type: "info",
          isRead: false,
          link: "/admin/analytics",
          category: "reports"
        },
        {
          id: 4,
          title: "Storage usage approaching limit",
          description: "Database storage is at 85% capacity",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          type: "warning",
          isRead: true,
          category: "system"
        },
        {
          id: 5,
          title: "Scheduled maintenance completed",
          description: "System updates were applied successfully",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          type: "success",
          isRead: true,
          category: "system"
        }
      ];
    } else if (user) {
      // Regular logged-in user
      return [
        {
          id: 1,
          title: "Your story received a like",
          description: "Someone enjoyed your latest horror story",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
          type: "success",
          isRead: false,
          link: "/profile/stories"
        },
        {
          id: 2,
          title: "New comment on your story",
          description: "Check out what readers are saying about your work",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          type: "info",
          isRead: false,
          link: "/profile/comments"
        },
        {
          id: 3, 
          title: "New featured horror story",
          description: "Don't miss this week's featured horror story",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
          type: "info",
          isRead: true,
          link: "/featured"
        }
      ];
    } else {
      // Anonymous user
      return [
        {
          id: 1,
          title: "Welcome to Horror Stories",
          description: "Explore our collection of terror tales",
          timestamp: new Date().toISOString(),
          type: "info",
          isRead: false,
          link: "/browse"
        },
        {
          id: 2,
          title: "New featured horror story",
          description: "Check out this week's featured horror story",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
          type: "info",
          isRead: false,
          link: "/featured"
        }
      ];
    }
  };
  
  const markAsRead = async (id: number) => {
    // In production, this would send a request to the API
    if (user) {
      try {
        // Mark notification as read
        // await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
        
        // For now, just update the state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    } else {
      // For anonymous users, just update the state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    }
  };
  
  const markAllAsRead = async () => {
    try {
      // In production, this would send a request to the API
      if (user) {
        // await fetch('/api/notifications/read-all', { method: 'POST' });
      }
      
      // Update all notifications to read
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success": return "bg-green-500";
      case "warning": return "bg-amber-500";
      case "error": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <TooltipProvider>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] p-0"
                      variant="destructive"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[380px] p-0" side="bottom" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription className="mt-1">
                    {unreadCount > 0 
                      ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                      : 'No new notifications'}
                  </CardDescription>
                </div>
                {user && ( // Only show for logged-in users
                  <div className="flex items-center space-x-1 rounded-md p-1">
                    <Switch 
                      id="push-notifications" 
                      checked={enablePush} 
                      onCheckedChange={setEnablePush} 
                      aria-label="Toggle push notifications"
                    />
                    <label htmlFor="push-notifications" className="text-xs text-muted-foreground cursor-pointer">
                      Push
                    </label>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-2 py-1">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-40">
                  <BellRing className="h-8 w-8 mb-2 text-muted-foreground/70" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="p-2 space-y-1">
                    {/* Admin users get categorized notifications */}
                    {user?.isAdmin && (
                      <>
                        {/* Group notifications by category */}
                        {Array.from(new Set(notifications.map(n => n.category || 'general'))).map(category => (
                          <div key={category} className="mb-4">
                            <h4 className="text-sm font-medium mb-2 px-2 text-muted-foreground capitalize">
                              {category}
                            </h4>
                            {notifications
                              .filter(n => (n.category || 'general') === category)
                              .map((notification) => (
                                <NotificationItem 
                                  key={notification.id}
                                  notification={notification}
                                  onMarkAsRead={markAsRead}
                                  getNotificationColor={getNotificationColor}
                                />
                              ))}
                          </div>
                        ))}
                      </>
                    )}
                    
                    {/* Regular users and anonymous users get a simple list */}
                    {!user?.isAdmin && notifications.map((notification) => (
                      <NotificationItem 
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        getNotificationColor={getNotificationColor}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                className="w-full" 
                size="sm"
                onClick={markAllAsRead}
                disabled={notifications.every(n => n.isRead)}
              >
                <Check className="mr-2 h-4 w-4" /> Mark all as read
              </Button>
              {user?.isAdmin && (
                <Button
                  className="ml-2"
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href="/admin/notifications">Manage All</a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  getNotificationColor: (type: Notification["type"]) => string;
}

function NotificationItem({ notification, onMarkAsRead, getNotificationColor }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });
  
  return (
    <div 
      className={cn(
        "relative px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer",
        notification.isRead ? "opacity-80" : ""
      )}
      role="button"
      onClick={handleClick}
    >
      <div className="grid grid-cols-[8px_1fr] gap-3 items-start">
        <span 
          className={cn(
            "flex h-2 w-2 translate-y-1 rounded-full",
            getNotificationColor(notification.type),
            notification.isRead && "opacity-50"
          )} 
        />
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <p className={cn(
              "text-sm font-medium leading-none",
              !notification.isRead && "font-semibold"
            )}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-5">New</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{notification.description}</p>
          <p className="text-xs text-muted-foreground/70">{timeAgo}</p>
        </div>
      </div>
      
      {notification.link && (
        <a 
          href={notification.link} 
          className="absolute inset-0" 
          aria-label={`View details about ${notification.title}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">View details</span>
        </a>
      )}
    </div>
  );
}
