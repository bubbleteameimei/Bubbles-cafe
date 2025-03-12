import React, { useState, useEffect, useContext, createContext } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { useLocation } from 'wouter';

// Notification system context
interface Notification {
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

interface NewStoryNotificationProps {
  newStories?: number;
  lastChecked?: string;
  onDismiss?: () => void;
  className?: string;
  autoHideDuration?: number; // in milliseconds
  showCount?: boolean;
}

const NewStoryNotification: React.FC<NewStoryNotificationProps> = ({
  newStories = 1,
  lastChecked,
  onDismiss,
  className = '',
  autoHideDuration = 10000, // 10 seconds
  showCount = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [, navigate] = useLocation();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Only show notification if there are new stories
    if (newStories > 0) {
      // Add to notification system
      addNotification({
        title: 'New Stories Available',
        description: `${newStories} new horror ${newStories === 1 ? 'story' : 'stories'} since your last visit.`,
        type: 'story',
        link: '/stories'
      });

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000); // Delay appearance to avoid immediate popup
      
      return () => clearTimeout(timer);
    }
  }, [newStories, addNotification]);

  useEffect(() => {
    // Auto-hide the notification after specified duration
    if (isVisible && autoHideDuration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleClick = () => {
    navigate('/stories');
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={`fixed bottom-6 right-6 z-50 max-w-sm ${className}`}
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="flex items-center gap-3 rounded-lg bg-background/95 p-4 pr-8 shadow-lg backdrop-blur-sm border border-accent">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
              <Bell className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">New Stories Available</h3>
              <p className="text-sm text-muted-foreground">
                {showCount 
                  ? `${newStories} new horror ${newStories === 1 ? 'story' : 'stories'} since your last visit.`
                  : 'New horror stories have been added.'
                }
              </p>
              <Button
                onClick={handleClick}
                variant="link"
                className="mt-1 px-0 text-sm text-accent"
              >
                Read now
              </Button>
            </div>
            <button 
              onClick={handleDismiss}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent/10 hover:text-accent"
              aria-label="Dismiss notification"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewStoryNotification;