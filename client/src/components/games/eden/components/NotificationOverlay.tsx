import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameNotification } from '../types';

interface NotificationOverlayProps {
  notifications: GameNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  notifications,
  onDismiss
}) => {
  // Auto-dismiss notifications after their duration
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onDismiss]);

  const getNotificationStyle = (type: GameNotification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-800/80 border-green-600';
      case 'warning':
        return 'bg-amber-800/80 border-amber-600';
      case 'danger':
        return 'bg-red-800/80 border-red-600';
      case 'info':
      default:
        return 'bg-blue-800/80 border-blue-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`px-4 py-3 rounded-lg border shadow-md backdrop-blur-sm ${getNotificationStyle(notification.type)}`}
          >
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-white text-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="ml-3 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationOverlay;