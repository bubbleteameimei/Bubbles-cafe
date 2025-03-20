import React, { useEffect } from 'react';
import { Notification } from '../types';

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

/**
 * Displays game notifications and alerts to the player
 */
const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  notifications, 
  onDismiss 
}) => {
  // Auto-dismiss notifications after a certain time
  useEffect(() => {
    if (notifications.length === 0) return;

    // Set a timeout to auto-dismiss notifications
    const timeouts = notifications.map(notification => {
      // Different dismiss times based on notification type
      const dismissTime = notification.type === 'error' 
        ? 10000  // 10 seconds for errors
        : notification.type === 'success' 
          ? 5000  // 5 seconds for success messages
          : 7000; // 7 seconds for info/warnings

      return setTimeout(() => {
        onDismiss(notification.id);
      }, dismissTime);
    });

    // Clear timeouts on component unmount
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [notifications, onDismiss]);

  // Get appropriate CSS class based on notification type
  const getNotificationClass = (type: string) => {
    switch (type) {
      case 'error':
        return 'notification-error';
      case 'success':
        return 'notification-success';
      case 'warning':
        return 'notification-warning';
      case 'info':
      default:
        return 'notification-info';
    }
  };

  // No notifications to display
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-system">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification ${getNotificationClass(notification.type)}`}
        >
          <div className="notification-content">
            <p>{notification.message}</p>
          </div>
          <button 
            className="dismiss-button"
            onClick={() => onDismiss(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;