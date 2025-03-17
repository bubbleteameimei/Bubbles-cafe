import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types from the NotificationContext
export interface Notification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  date: string;
  type: 'story' | 'comment' | 'system';
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const defaultContext: NotificationContextType = {
  notifications: [],
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
};

export const NotificationContext = createContext<NotificationContextType>(defaultContext);

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
}

// Mock notification function for testing - replace with actual API call in production
const fetchNotifications = async (): Promise<Notification[]> => {
  // In a real implementation, this would fetch from an API
  return [
    {
      id: uuidv4(),
      title: 'Welcome to Stories',
      description: 'Explore our vast library of immersive stories and experiences.',
      read: false,
      date: new Date().toISOString(),
      type: 'system',
      link: '/stories'
    }
  ];
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  maxNotifications = 50 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Try to load from localStorage first
        const savedNotifications = localStorage.getItem('notifications');
        
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        } else {
          // If no saved notifications, fetch from API
          const fetchedNotifications = await fetchNotifications();
          setNotifications(fetchedNotifications);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };
    
    loadNotifications();
  }, []);
  
  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }, [notifications]);
  
  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      date: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => {
      // Add to beginning and limit to maxNotifications
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id 
          ? { ...notif, read: true } 
          : notif
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };
  
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};