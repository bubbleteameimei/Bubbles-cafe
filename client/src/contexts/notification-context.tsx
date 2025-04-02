import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
import { CreepyTextGlitch } from '@/components/effects/CursedNotificationEffect';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'new-story' | 'cursed';

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
  lastNotificationOpen: Date | null;
  setLastNotificationOpen: (date: Date | null) => void;
  showCursedEffect: boolean;
  setShowCursedEffect: (show: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Time threshold to trigger the cursed effect (in milliseconds)
// 24 hours in milliseconds = 86400000, but we'll use a much shorter time for testing
const IGNORED_THRESHOLD = 30 * 1000; // 30 seconds for easy testing

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

  // Track when notifications were last viewed
  const [lastNotificationOpen, setLastNotificationOpen] = useState<Date | null>(() => {
    try {
      const saved = localStorage.getItem('lastNotificationOpen');
      return saved ? new Date(saved) : null;
    } catch {
      return null;
    }
  });

  // State for the cursed effect
  const [showCursedEffect, setShowCursedEffect] = useState(false);
  
  // Save last open time to localStorage
  useEffect(() => {
    if (lastNotificationOpen) {
      localStorage.setItem('lastNotificationOpen', lastNotificationOpen.toISOString());
    }
  }, [lastNotificationOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Save notifications to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('[Notifications] Error saving to localStorage:', error);
    }
  }, [notifications]);

  // Add special cursed notification for users who ignore notifications
  const hasAddedCursedRef = useRef(false);
  useEffect(() => {
    // If there are unread notifications and the user hasn't checked in a while
    if (unreadCount > 0 && lastNotificationOpen && !hasAddedCursedRef.current) {
      const now = new Date();
      const timeSinceLastOpen = now.getTime() - lastNotificationOpen.getTime();
      
      // If user has been ignoring notifications for the threshold period
      if (timeSinceLastOpen > IGNORED_THRESHOLD) {
        console.log('[Notifications] User has been ignoring notifications for too long, adding cursed notification');
        
        // Add a special cursed notification (only if we haven't added one already)
        if (!notifications.some(n => n.type === 'cursed')) {
          addNotification({
            type: 'cursed',
            title: 'Why are you ignoring me?',
            message: 'I noticed you haven\'t checked your notifications in a while.',
            link: '/notifications'
          });
          
          hasAddedCursedRef.current = true;
        }
      }
    }
  }, [unreadCount, lastNotificationOpen]);

  // Reset the cursed flag when notifications are read
  useEffect(() => {
    if (unreadCount === 0) {
      hasAddedCursedRef.current = false;
    }
  }, [unreadCount]);

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
    
    // Also show a toast notification unless it's a cursed notification
    // (we want that one to be a surprise when they open the menu)
    if (notification.type !== 'cursed') {
      showNotificationToast(newNotification);
    }
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
    
    // Special handling for cursed notifications with more intense effects
    if (notification.type === 'cursed') {
      // Play a subtle sound effect if available in the browser
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 500);
      } catch (e) {
        console.log('Browser does not support Web Audio API');
      }
      
      toast({
        title: (
          <div className="flex items-center">
            <CreepyTextGlitch 
              text="Why are you ignoring me?" 
              intensityFactor={10} 
              permanent={true} 
            />
          </div>
        ),
        description: (
          <span className="text-red-400">
            I'll be watching your notifications more closely now...
          </span>
        ),
        variant: 'destructive',
        duration: 2000
      });
      return;
    }
    
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
    showNotificationToast,
    lastNotificationOpen,
    setLastNotificationOpen,
    showCursedEffect,
    setShowCursedEffect
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