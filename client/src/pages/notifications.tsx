import { useState } from 'react';
import { useNotifications, Notification } from '@/contexts/notification-context';
import { format } from 'date-fns';
import { Check, Bell, CheckCheck, Trash2, ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { addTestNotification } from '@/utils/add-test-notification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import FadeInSection from '@/components/transitions/FadeInSection';

export default function NotificationsPage() {
  const [location, setLocation] = useLocation();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    addNotification
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      setLocation(notification.link);
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : activeTab === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.read);

  return (
    <FadeInSection>
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 h-8 px-2" 
            onClick={() => setLocation('/')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground text-sm">
              Stay updated with your story notifications
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => addTestNotification(addNotification, 'new-story')}
            className="h-8 text-xs"
          >
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Test Notification
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Your Notifications</CardTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-8 text-xs"
                  >
                    <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearNotifications}
                    className="h-8 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>
            
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all" className="text-xs">
                  All
                  {notifications.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                      {notifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read" className="text-xs">
                  Read
                  {(notifications.length - unreadCount) > 0 && (
                    <Badge variant="outline" className="ml-2 h-5 px-1.5 text-[10px]">
                      {notifications.length - unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                <p className="text-muted-foreground">
                  {activeTab === 'all' 
                    ? "No notifications yet" 
                    : activeTab === 'unread' 
                      ? "No unread notifications" 
                      : "No read notifications"}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {activeTab === 'all' && "You'll be notified when new stories are published"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`py-4 cursor-pointer hover:bg-muted/40 transition-colors px-4 -mx-4 ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-full ${
                        notification.type === 'success' ? "bg-green-100 text-green-700" :
                        notification.type === 'error' ? "bg-red-100 text-red-700" :
                        notification.type === 'warning' ? "bg-yellow-100 text-yellow-700" :
                        notification.type === 'new-story' ? "bg-primary/10 text-primary" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {notification.type === 'success' ? <Check className="h-4 w-4" /> :
                        <Bell className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium ${
                            !notification.read ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {format(notification.date, 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        {notification.link && (
                          <div className="mt-2">
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
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
          
          {filteredNotifications.length > 0 && (
            <CardFooter className="flex justify-between border-t pt-4 text-xs text-muted-foreground">
              <p>Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}</p>
              <p>Last updated: {format(new Date(), 'MMM d, yyyy')}</p>
            </CardFooter>
          )}
        </Card>
      </div>
    </FadeInSection>
  );
}