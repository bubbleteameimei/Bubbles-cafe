import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { CreepyTextGlitch } from '@/components/effects/CreepyTextGlitch';

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

const IGNORED_THRESHOLD = 30 * 1000;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((n: any) => ({
          ...n,
          date: new Date(n.date)
        }));
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [lastNotificationOpen, setLastNotificationOpen] = useState<Date | null>(() => {
    try {
      const saved = localStorage.getItem('lastNotificationOpen');
      return saved ? new Date(saved) : null;
    } catch {
      return null;
    }
  });

  const [showCursedEffect, setShowCursedEffect] = useState(false);
  
  useEffect(() => {
    if (lastNotificationOpen) {
      localStorage.setItem('lastNotificationOpen', lastNotificationOpen.toISOString());
    }
  }, [lastNotificationOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch {
      // ignore storage errors
    }
  }, [notifications]);

  const { toast } = useToast();
  
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showNotificationToast = useCallback((notification: Notification) => {
    if (notification.read) return;
    if (notification.type === 'cursed') {
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
      } catch {
        // ignore audio errors
      }
      toast({
        title: (
          <div className="flex items-center">
            <CreepyTextGlitch text="Why are you ignoring me?" intensityFactor={10} permanent={true} />
          </div>
        ),
        description: (
          <span className="text-red-400">I'll be watching your notifications more closely now...</span>
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
        <Button variant="outline" size="sm" onClick={() => { window.location.href = notification.link as string; markAsRead(notification.id); }}>
          Read Now
        </Button>
      ) : undefined
    });
  }, [toast, markAsRead]);

  const hasAddedCursedRef = useRef(false);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      date: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    if (notification.type !== 'cursed') {
      showNotificationToast(newNotification);
    }
  }, [showNotificationToast]);

  useEffect(() => {
    if (unreadCount > 0 && lastNotificationOpen && !hasAddedCursedRef.current) {
      const now = new Date();
      const timeSinceLastOpen = now.getTime() - lastNotificationOpen.getTime();
      
      if (timeSinceLastOpen > IGNORED_THRESHOLD) {
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
  }, [unreadCount, lastNotificationOpen, notifications, addNotification]);

  useEffect(() => {
    if (unreadCount === 0) {
      hasAddedCursedRef.current = false;
    }
  }, [unreadCount]);

  useEffect(() => {
    let lastChecked = new Date();
    
    const checkForNewStories = async () => {
      try {
        const response = await fetch('/api/posts?limit=1');
        if (!response.ok) return;
        
        const data = await response.json();
        if (!data.posts || !data.posts.length) return;
        
        const latestPost = data.posts[0];
        const postDate = new Date(latestPost.date);
        
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
      } catch {
        // ignore fetch errors
      }
    };
    
    checkForNewStories();
    const interval = setInterval(checkForNewStories, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [notifications, addNotification]);

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