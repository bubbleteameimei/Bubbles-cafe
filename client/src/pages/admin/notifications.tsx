
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle, Trash2, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

interface Notification {
  id: number;
  message: string;
  createdAt: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  category: string;
  source: string;
  link?: string;
}

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      // const response = await fetch('/api/admin/notifications/all');
      // const data = await response.json();
      
      // For demo purposes, we'll generate some mock data
      const mockNotifications: Notification[] = [
        {
          id: 1,
          message: "A new community story has been submitted for approval",
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          type: "info",
          isRead: false,
          category: "content",
          source: "community_post"
        },
        {
          id: 2,
          message: "User reported comment contains offensive content",
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          type: "warning",
          isRead: false,
          category: "moderation",
          source: "comment_report",
          link: "/admin/comments/flagged"
        },
        {
          id: 3,
          message: "Weekly traffic analytics report is ready",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          type: "info",
          isRead: true,
          category: "analytics",
          source: "system",
          link: "/admin/analytics"
        },
        {
          id: 4,
          message: "Database backup completed successfully",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          type: "success",
          isRead: true,
          category: "system",
          source: "database"
        },
        {
          id: 5,
          message: "Error detected in comment moderation system",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
          type: "error",
          isRead: false,
          category: "system",
          source: "moderation"
        },
        {
          id: 6,
          message: "New user registration spike detected",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          type: "warning",
          isRead: false,
          category: "users",
          source: "analytics"
        },
        {
          id: 7,
          message: "Featured story has been published",
          createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          type: "success",
          isRead: true,
          category: "content",
          source: "scheduled_post"
        },
        {
          id: 8,
          message: "Low disk space warning (85% utilized)",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          type: "warning",
          isRead: false,
          category: "system",
          source: "storage"
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      // In a real implementation, this would send a request to the API
      // await fetch(`/api/admin/notifications/${id}/read`, { method: 'POST' });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      // In a real implementation, this would send a request to the API
      // await fetch('/api/admin/notifications/read-all', { method: 'POST' });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      // In a real implementation, this would send a request to the API
      // await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
      
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const clearAllNotifications = async () => {
    try {
      // In a real implementation, this would send a request to the API
      // await fetch('/api/admin/notifications/clear-all', { method: 'DELETE' });
      
      setNotifications([]);
      
      toast({
        title: "Success",
        description: "All notifications cleared",
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive",
      });
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'read':
        return notifications.filter(n => n.isRead);
      default:
        return notifications;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Manage system notifications and alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchNotifications}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-muted-foreground" />
                <CardTitle>System Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
            <CardDescription>
              Monitor system events, user activities, and content updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger 
                    value="all" 
                    onClick={() => setFilter('all')}
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="unread" 
                    onClick={() => setFilter('unread')}
                  >
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="read" 
                    onClick={() => setFilter('read')}
                  >
                    Read
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="m-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-60">
                    <p className="text-muted-foreground">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-60">
                    <Bell className="h-10 w-10 mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-1">
                      {/* Group notifications by date */}
                      {Array.from(
                        new Set(
                          filteredNotifications.map(n => 
                            format(new Date(n.createdAt), 'MMMM d, yyyy')
                          )
                        )
                      ).map(date => (
                        <div key={date} className="mb-6">
                          <h3 className="text-sm font-medium mb-3 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                            {date}
                          </h3>
                          {filteredNotifications
                            .filter(n => 
                              format(new Date(n.createdAt), 'MMMM d, yyyy') === date
                            )
                            .map(notification => (
                              <div 
                                key={notification.id} 
                                className={`
                                  border rounded-lg mb-3 p-4 
                                  ${notification.isRead ? 'bg-muted/30' : 'bg-background border-muted-foreground/20'}
                                  transition-colors hover:bg-muted/50
                                `}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    {getTypeIcon(notification.type)}
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
                                          {notification.message}
                                        </p>
                                        {!notification.isRead && (
                                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                            New
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center mt-1 gap-2">
                                        <p className="text-xs text-muted-foreground">
                                          {format(new Date(notification.createdAt), 'h:mm a')}
                                        </p>
                                        <Badge 
                                          variant="outline" 
                                          className="text-[10px] px-1 py-0 h-4 capitalize"
                                        >
                                          {notification.category}
                                        </Badge>
                                        <Badge 
                                          variant="outline" 
                                          className="text-[10px] px-1 py-0 h-4 capitalize"
                                        >
                                          {notification.source}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {!notification.isRead && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => markAsRead(notification.id)}
                                        title="Mark as read"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-500/70 hover:text-red-500"
                                      onClick={() => deleteNotification(notification.id)}
                                      title="Delete notification"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {notification.link && (
                                  <div className="mt-2 pl-7">
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="h-6 p-0 text-xs"
                                      asChild
                                    >
                                      <a href={notification.link}>View details</a>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
              
              <TabsContent value="unread" className="m-0">
                {/* Same content but filtered for unread */}
              </TabsContent>
              
              <TabsContent value="read" className="m-0">
                {/* Same content but filtered for read */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['system', 'content', 'users', 'moderation', 'analytics'].map((category) => (
                  <Card key={category} className="border p-4">
                    <CardTitle className="text-base capitalize mb-2">{category} Notifications</CardTitle>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor={`${category}-email`} className="text-sm">Email alerts</label>
                        <Switch id={`${category}-email`} defaultChecked={category === 'system'} />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor={`${category}-dashboard`} className="text-sm">Dashboard alerts</label>
                        <Switch id={`${category}-dashboard`} defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor={`${category}-push`} className="text-sm">Push notifications</label>
                        <Switch id={`${category}-push`} defaultChecked={['system', 'moderation'].includes(category)} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
