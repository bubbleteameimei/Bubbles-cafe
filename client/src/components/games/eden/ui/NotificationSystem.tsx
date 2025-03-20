import React, { useState, useEffect } from 'react';
import { GameNotification, NotificationSystemProps } from '../types';

/**
 * NotificationSystem component - Displays game notifications and alerts
 */
const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss
}) => {
  const [activeNotifications, setActiveNotifications] = useState<GameNotification[]>([]);
  
  // Update active notifications when props change
  useEffect(() => {
    setActiveNotifications(notifications);
    
    // Auto-dismiss notifications with duration > 0
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onDismiss]);
  
  // Get appropriate styling based on notification type
  const getNotificationClass = (type: string): string => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'warning':
        return 'notification-warning';
      case 'error':
        return 'notification-error';
      default:
        return 'notification-info';
    }
  };
  
  // Handle manual dismissal
  const handleDismiss = (id: string) => {
    onDismiss(id);
  };
  
  if (activeNotifications.length === 0) {
    return null;
  }
  
  return (
    <div className="notification-container">
      {activeNotifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${getNotificationClass(notification.type)}`}
          role="alert"
        >
          <div className="notification-content">
            <p>{notification.message}</p>
          </div>
          <button 
            className="notification-dismiss" 
            onClick={() => handleDismiss(notification.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
      
      <style>
        {`
          .notification-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 300px;
          }
          
          .notification {
            display: flex;
            align-items: flex-start;
            padding: 15px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            animation: notification-fade-in 0.3s ease-out forwards;
            backdrop-filter: blur(3px);
          }
          
          @keyframes notification-fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .notification-content {
            flex: 1;
          }
          
          .notification-content p {
            margin: 0;
            font-size: 14px;
            line-height: 1.4;
          }
          
          .notification-dismiss {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 18px;
            cursor: pointer;
            padding: 0 0 0 10px;
            margin-top: -5px;
            transition: color 0.2s;
          }
          
          .notification-dismiss:hover {
            color: rgba(255, 255, 255, 1);
          }
          
          /* Notification Types */
          .notification-info {
            background-color: rgba(30, 100, 180, 0.85);
            border-left: 3px solid #3498db;
            color: white;
          }
          
          .notification-success {
            background-color: rgba(40, 150, 90, 0.85);
            border-left: 3px solid #2ecc71;
            color: white;
          }
          
          .notification-warning {
            background-color: rgba(200, 120, 30, 0.85);
            border-left: 3px solid #f39c12;
            color: white;
          }
          
          .notification-error {
            background-color: rgba(180, 40, 40, 0.85);
            border-left: 3px solid #e74c3c;
            color: white;
          }
          
          /* Dark Theme Adjustments */
          @media (prefers-color-scheme: dark) {
            .notification {
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationSystem;