
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface NotificationBadgeProps {
  count?: number;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline" | "icon";
  showZero?: boolean;
}

export function NotificationBadge({
  count,
  onClick,
  className,
  variant = "default",
  showZero = false,
}: NotificationBadgeProps) {
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState<number | undefined>(count);
  
  useEffect(() => {
    if (count !== undefined) {
      setNotificationCount(count);
      return;
    }
    
    // If count is not provided, fetch from API
    const fetchNotifications = async () => {
      try {
        // For development/demo purposes
        if (process.env.NODE_ENV === 'development') {
          // Generate different counts based on user type
          if (user?.isAdmin) {
            setNotificationCount(Math.floor(Math.random() * 10) + 1);
          } else if (user) {
            setNotificationCount(Math.floor(Math.random() * 5));
          } else {
            setNotificationCount(Math.floor(Math.random() * 2));
          }
          return;
        }
        
        // In production this would fetch from API
        let endpoint = '/api/notifications/count';
        if (user?.isAdmin) {
          endpoint = '/api/admin/notifications/count';
        } else if (user) {
          endpoint = '/api/user/notifications/count';
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch notification count');
        
        const data = await response.json();
        setNotificationCount(data.count);
      } catch (error) {
        console.error('Error fetching notification count:', error);
        setNotificationCount(0);
      }
    };
    
    fetchNotifications();
    
    // Poll for new notifications periodically
    const intervalId = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user, count]);
  
  if (variant === "icon") {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn("relative", className)} 
        onClick={onClick}
        aria-label={`${notificationCount || 0} notifications`}
      >
        <Bell className="h-5 w-5" />
        {(notificationCount || 0) > 0 && (
          <Badge 
            className="absolute -top-2 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] p-0"
            variant="destructive"
          >
            {(notificationCount || 0) > 9 ? '9+' : notificationCount}
          </Badge>
        )}
      </Button>
    );
  }
  
  if (variant === "outline") {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={cn("gap-1.5", className)}
        onClick={onClick}
      >
        <Bell className="h-4 w-4" />
        {((notificationCount || 0) > 0 || showZero) && (
          <span className="text-xs">
            {notificationCount || 0}
          </span>
        )}
      </Button>
    );
  }
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm bg-muted cursor-pointer",
        className
      )}
      onClick={onClick}
      role="button"
    >
      <Bell className="h-4 w-4" />
      <span>
        {((notificationCount || 0) > 0 || showZero) && (
          <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
            {notificationCount || 0}
          </Badge>
        )}
      </span>
    </div>
  );
}
