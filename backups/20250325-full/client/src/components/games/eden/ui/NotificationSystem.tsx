import React, { useState, useEffect } from 'react';
import { NotificationProps, GameNotification } from '../types';

/**
 * NotificationSystem - Displays in-game notifications with animation effects
 */
const NotificationSystem: React.FC<NotificationProps> = ({
  notifications = [],
  onNotificationClose,
  maxVisible = 3,
  autoHideDuration = 5000,
  position = 'top-right'
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<GameNotification[]>([]);
  const [notificationQueue, setNotificationQueue] = useState<GameNotification[]>([]);
  
  // Process notifications when they change
  useEffect(() => {
    const newNotifications = notifications.filter(
      notification => !visibleNotifications.some(n => n.id === notification.id) && 
                      !notificationQueue.some(n => n.id === notification.id)
    );
    
    if (newNotifications.length > 0) {
      setNotificationQueue(prevQueue => [...prevQueue, ...newNotifications]);
    }
  }, [notifications, visibleNotifications, notificationQueue]);
  
  // Process the notification queue
  useEffect(() => {
    if (notificationQueue.length > 0 && visibleNotifications.length < maxVisible) {
      // Move notifications from queue to visible
      const toProcess = notificationQueue.slice(0, maxVisible - visibleNotifications.length);
      
      setVisibleNotifications(prev => [...prev, ...toProcess]);
      setNotificationQueue(prev => prev.slice(toProcess.length));
    }
  }, [notificationQueue, visibleNotifications, maxVisible]);
  
  // Set auto-hide timers for notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    visibleNotifications.forEach(notification => {
      // If notification doesn't have a specific duration, use the default
      const duration = notification.duration || autoHideDuration;
      
      // Skip if notification is persistent (duration is 0 or negative)
      if (duration <= 0) return;
      
      const timer = setTimeout(() => {
        handleCloseNotification(notification.id);
      }, duration);
      
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleNotifications, autoHideDuration]);
  
  // Handle notification close
  const handleCloseNotification = (id: string) => {
    setVisibleNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      
      if (notification && onNotificationClose) {
        onNotificationClose(notification);
      }
      
      return prev.filter(n => n.id !== id);
    });
  };
  
  // Get position-specific style class
  const getPositionClass = () => {
    switch (position) {
      case 'top-left':
        return 'notification-position-top-left';
      case 'top-right':
        return 'notification-position-top-right';
      case 'bottom-left':
        return 'notification-position-bottom-left';
      case 'bottom-right':
        return 'notification-position-bottom-right';
      case 'top-center':
        return 'notification-position-top-center';
      case 'bottom-center':
        return 'notification-position-bottom-center';
      default:
        return 'notification-position-top-right';
    }
  };
  
  // Get notification style based on type
  const getNotificationTypeClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
      default:
        return 'notification-info';
    }
  };
  
  if (visibleNotifications.length === 0) {
    return null;
  }
  
  return (
    <div className={`notification-container ${getPositionClass()}`}>
      {visibleNotifications.map((notification) => (
        <div 
          key={notification.id}
          className={`notification ${getNotificationTypeClass(notification.type)} ${notification.customClass || ''}`}
        >
          <div className="notification-content">
            {notification.title && (
              <div className="notification-title">{notification.title}</div>
            )}
            <div className="notification-message">{notification.message}</div>
            {notification.details && (
              <div className="notification-details">{notification.details}</div>
            )}
          </div>
          <button 
            className="notification-close"
            onClick={() => handleCloseNotification(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
      
      <style>{`
        .notification-container {
          position: fixed;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 1000;
          max-height: 100vh;
          overflow-y: auto;
          pointer-events: none;
          padding: 15px;
        }
        
        .notification-position-top-right {
          top: 0;
          right: 0;
          align-items: flex-end;
        }
        
        .notification-position-top-left {
          top: 0;
          left: 0;
          align-items: flex-start;
        }
        
        .notification-position-bottom-right {
          bottom: 0;
          right: 0;
          align-items: flex-end;
        }
        
        .notification-position-bottom-left {
          bottom: 0;
          left: 0;
          align-items: flex-start;
        }
        
        .notification-position-top-center {
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          align-items: center;
        }
        
        .notification-position-bottom-center {
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          align-items: center;
        }
        
        .notification {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          width: 100%;
          max-width: 350px;
          min-width: 250px;
          pointer-events: auto;
          animation: notification-enter 0.3s ease forwards;
          padding: 15px;
          margin-bottom: 5px;
          font-family: 'Times New Roman', serif;
          color: #e0e0e0;
        }
        
        .notification:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.6);
        }
        
        @keyframes notification-enter {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .notification-info {
          background-color: rgba(30, 50, 80, 0.9);
          border-left: 4px solid #3498db;
        }
        
        .notification-success {
          background-color: rgba(30, 60, 40, 0.9);
          border-left: 4px solid #2ecc71;
        }
        
        .notification-warning {
          background-color: rgba(60, 50, 20, 0.9);
          border-left: 4px solid #f39c12;
        }
        
        .notification-error {
          background-color: rgba(60, 30, 30, 0.9);
          border-left: 4px solid #e74c3c;
        }
        
        .notification-content {
          flex: 1;
          padding-right: 10px;
        }
        
        .notification-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }
        
        .notification-message {
          font-size: 14px;
          line-height: 1.4;
        }
        
        .notification-details {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 5px;
          font-style: italic;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: #a0a0c0;
          font-size: 18px;
          cursor: pointer;
          padding: 0 5px;
          line-height: 1;
          align-self: flex-start;
        }
        
        .notification-close:hover {
          color: #ffffff;
        }
        
        /* Responsive adjustments */
        @media (max-width: 480px) {
          .notification-container {
            padding: 10px;
            max-width: 100%;
          }
          
          .notification {
            width: 100%;
            max-width: 100%;
            padding: 12px;
          }
          
          .notification-title {
            font-size: 14px;
          }
          
          .notification-message {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;