import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'new-story';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  date: Date;
  link?: string;
  storyId?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  showNotificationToast: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Try to load from localStorage first
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert stored date strings back to Date objects
        return parsed.map((n: any) => ({
          ...n,
          date: new Date(n.date)
        }));
      }
    } catch (error) {
      console.error('[Notifications] Error loading from localStorage:', error);
    }
    return [];
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Save notifications to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('[Notifications] Error saving to localStorage:', error);
    }
  }, [notifications]);

  // Check for new stories periodically
  useEffect(() => {
    let lastChecked = new Date();
    
    const checkForNewStories = async () => {
      try {
        // Check for most recent post
        const response = await fetch('/api/posts?limit=1');
        if (!response.ok) return;
        
        const data = await response.json();
        if (!data.posts || !data.posts.length) return;
        
        const latestPost = data.posts[0];
        const postDate = new Date(latestPost.date);
        
        // Only notify if the latest post is newer than our last check
        // and we don't already have a notification for it
        if (postDate > lastChecked && !notifications.some(n => n.storyId === latestPost.id)) {
          addNotification({
            type: 'new-story',
            title: 'New Story Published',
            message: `"${latestPost.title.rendered}" is now available to read!`,
            link: `/reader/${latestPost.slug}`,
            storyId: latestPost.id
          });
        }
        
        lastChecked = new Date();
      } catch (error) {
        console.error('[Notifications] Error checking for new stories:', error);
      }
    };
    
    // Check immediately on mount
    checkForNewStories();
    
    // Then every 5 minutes (adjust as needed)
    const interval = setInterval(checkForNewStories, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      date: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Also show a toast notification
    showNotificationToast(newNotification);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const { toast } = useToast();
  
  const showNotificationToast = (notification: Notification) => {
    // Only show toast for unread notifications
    if (notification.read) return;
    
    toast({
      title: notification.title,
      description: notification.message,
      action: notification.link ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            window.location.href = notification.link as string;
            markAsRead(notification.id);
          }}
        >
          Read Now
        </Button>
      ) : undefined
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    showNotificationToast
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}