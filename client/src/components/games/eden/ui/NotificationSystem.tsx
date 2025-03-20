import React, { useState, useEffect, useRef } from 'react';
import { Notification } from '../types';

interface NotificationSystemProps {
  notifications: Notification[];
  onNotificationDismiss: (id: string) => void;
}

/**
 * Displays game notifications with auto-dismiss and manual dismiss options
 */
const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onNotificationDismiss
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<{[id: string]: boolean}>({});
  const notificationTimers = useRef<{[id: string]: NodeJS.Timeout}>({});
  
  // Set up automatic dismissal of notifications
  useEffect(() => {
    // Handle new notifications
    notifications.forEach(notification => {
      // Only set up timer if notification is not already visible
      if (!visibleNotifications[notification.id]) {
        setVisibleNotifications(prev => ({
          ...prev,
          [notification.id]: true
        }));
        
        // Set up auto-dismiss timer if a timeout is specified
        if (notification.timeout && notification.timeout > 0) {
          notificationTimers.current[notification.id] = setTimeout(() => {
            handleDismiss(notification.id);
          }, notification.timeout);
        }
      }
    });
    
    // Cleanup function to clear any timers on unmount
    return () => {
      Object.values(notificationTimers.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, [notifications]);
  
  // Handle dismissal of notification
  const handleDismiss = (id: string) => {
    // Clear the timeout if it exists
    if (notificationTimers.current[id]) {
      clearTimeout(notificationTimers.current[id]);
      delete notificationTimers.current[id];
    }
    
    // Animate notification out
    setVisibleNotifications(prev => ({
      ...prev,
      [id]: false
    }));
    
    // Call the dismiss callback after animation completes
    setTimeout(() => {
      onNotificationDismiss(id);
    }, 300); // Match this with the CSS transition duration
  };
  
  // Get notification type style
  const getNotificationTypeStyle = (type: string) => {
    switch (type) {
      case 'achievement':
        return {
          backgroundColor: 'rgba(60, 120, 255, 0.85)',
          borderColor: 'rgba(100, 160, 255, 0.7)',
          icon: '🏆'
        };
      case 'discovery':
        return {
          backgroundColor: 'rgba(80, 130, 200, 0.85)',
          borderColor: 'rgba(120, 170, 240, 0.7)',
          icon: '✨'
        };
      case 'hint':
        return {
          backgroundColor: 'rgba(80, 180, 80, 0.85)',
          borderColor: 'rgba(120, 220, 120, 0.7)',
          icon: '💡'
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(200, 130, 30, 0.85)',
          borderColor: 'rgba(240, 170, 70, 0.7)',
          icon: '⚠️'
        };
      case 'danger':
        return {
          backgroundColor: 'rgba(200, 60, 60, 0.85)',
          borderColor: 'rgba(240, 100, 100, 0.7)',
          icon: '⛔'
        };
      case 'quest':
        return {
          backgroundColor: 'rgba(140, 90, 200, 0.85)',
          borderColor: 'rgba(180, 130, 240, 0.7)',
          icon: '📜'
        };
      case 'item':
        return {
          backgroundColor: 'rgba(70, 130, 180, 0.85)',
          borderColor: 'rgba(110, 170, 220, 0.7)',
          icon: '📦'
        };
      default:
        return {
          backgroundColor: 'rgba(50, 60, 80, 0.85)',
          borderColor: 'rgba(90, 100, 120, 0.7)',
          icon: 'ℹ️'
        };
    }
  };
  
  // Filter to only include visible notifications
  const getVisibleNotifications = () => {
    return notifications.filter(notification => visibleNotifications[notification.id]);
  };
  
  return (
    <div className="notification-system" style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      maxWidth: '300px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none'
    }}>
      {getVisibleNotifications().map(notification => {
        const typeStyle = getNotificationTypeStyle(notification.type);
        
        return (
          <div
            key={notification.id}
            className="notification-item"
            style={{
              backgroundColor: typeStyle.backgroundColor,
              border: `1px solid ${typeStyle.borderColor}`,
              borderRadius: '6px',
              padding: '12px',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(5px)',
              transition: 'all 0.3s ease-in-out, transform 0.2s ease-out',
              transform: 'translateX(0)',
              opacity: 1,
              animation: 'notification-slide-in 0.3s ease-out',
              pointerEvents: 'auto'
            }}
          >
            <div className="notification-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div className="notification-title" style={{
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{typeStyle.icon}</span>
                {notification.title || capitalizeFirstLetter(notification.type)}
              </div>
              <button
                onClick={() => handleDismiss(notification.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>
            
            <div className="notification-content" style={{
              fontSize: '14px',
              lineHeight: 1.5
            }}>
              {notification.message}
            </div>
            
            {notification.timeout && notification.timeout > 0 && (
              <div className="notification-progress" style={{
                width: '100%',
                height: '3px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                marginTop: '10px',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div
                  className="progress-bar"
                  style={{
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    width: '100%',
                    animation: `progress-bar-shrink ${notification.timeout / 1000}s linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
      
      <style>
        {`
          @keyframes notification-slide-in {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes progress-bar-shrink {
            from {
              width: 100%;
            }
            to {
              width: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default NotificationSystem;