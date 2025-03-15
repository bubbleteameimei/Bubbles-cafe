import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Notification } from "@/components/NotificationProvider";

interface NotificationIconProps {
  notifications?: Notification[];
  onClick?: () => void;
  className?: string;
}

export function NotificationIcon({ notifications = [], onClick, className = "" }: NotificationIconProps) {
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`w-10 h-10 rounded-md border border-border/30 hover:bg-accent/10 active:bg-accent/20 relative touch-manipulation transition-all duration-150 ease-out active:scale-95 ${className}`}
      aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="relative">
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] px-[5px] h-[18px] flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span className="absolute inset-0 bg-current opacity-0 hover:opacity-5 active:opacity-10 transition-opacity duration-150 rounded-md" />
      </span>
    </Button>
  );
}