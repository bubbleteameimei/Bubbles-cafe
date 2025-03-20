import React, { useState, useEffect } from 'react';
import { NotificationSystemProps, GameNotification } from '../types';

/**
 * NotificationSystem Component - Displays game notifications and alerts
 */
const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  onAction
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<GameNotification[]>([]);
  const [animatingOut, setAnimatingOut] = useState<Record<string, boolean>>({});
  
  // Update visible notifications when props change
  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);
  
  // Setup auto-dismiss timers for notifications
  useEffect(() => {
    // For each notification with a timeout
    const timers = notifications
      .filter(n => n.timeout && n.timeout > 0)
      .map(notification => {
        // Set a timer to dismiss this notification after timeout
        return setTimeout(() => {
          handleDismiss(notification.id);
        }, notification.timeout);
      });
    
    // Clear timers on unmount
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, onDismiss]);
  
  // Handle dismissal with animation
  const handleDismiss = (id: string) => {
    // Start animation out
    setAnimatingOut(prev => ({ ...prev, [id]: true }));
    
    // After animation completes, call the actual dismiss handler
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Match the animation duration
  };
  
  // Handle action button click
  const handleAction = (id: string) => {
    onAction(id);
  };
  
  // Get class name based on notification type
  const getNotificationClass = (type: GameNotification['type']) => {
    switch (type) {
      case 'warning':
        return 'notification-warning';
      case 'danger':
        return 'notification-danger';
      case 'discovery':
        return 'notification-discovery';
      case 'achievement':
        return 'notification-achievement';
      default:
        return 'notification-info';
    }
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type: GameNotification['type']) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🔥';
      case 'discovery':
        return '🔍';
      case 'achievement':
        return '🏆';
      default:
        return 'ℹ️';
    }
  };
  
  return (
    <div className="notification-system">
      {visibleNotifications.map(notification => (
        <div 
          key={notification.id}
          className={`notification ${getNotificationClass(notification.type)} ${
            animatingOut[notification.id] ? 'animate-out' : 'animate-in'
          }`}
        >
          <div className="notification-icon">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="notification-content">
            <div className="notification-message">
              {notification.message}
            </div>
            
            {notification.action && (
              <button
                className="notification-action"
                onClick={() => handleAction(notification.id)}
              >
                {notification.action.label}
              </button>
            )}
          </div>
          
          <button 
            className="notification-dismiss"
            onClick={() => handleDismiss(notification.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
      
      <style>
        {`
          .notification-system {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 900;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
            pointer-events: none;
          }
          
          .notification {
            background-color: rgba(30, 30, 40, 0.9);
            border-left: 4px solid #666;
            color: white;
            padding: 12px;
            border-radius: 4px;
            display: flex;
            align-items: flex-start;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(5px);
            pointer-events: auto;
            transform-origin: top left;
            transition: all 0.3s ease;
          }
          
          .notification.animate-in {
            animation: slideIn 0.3s ease forwards;
          }
          
          .notification.animate-out {
            animation: slideOut 0.3s ease forwards;
          }
          
          .notification-info {
            border-left-color: #3498db;
          }
          
          .notification-warning {
            border-left-color: #f39c12;
          }
          
          .notification-danger {
            border-left-color: #e74c3c;
          }
          
          .notification-discovery {
            border-left-color: #9b59b6;
          }
          
          .notification-achievement {
            border-left-color: #2ecc71;
          }
          
          .notification-icon {
            margin-right: 10px;
            font-size: 20px;
          }
          
          .notification-content {
            flex: 1;
            padding-right: 5px;
          }
          
          .notification-message {
            font-size: 14px;
            margin-bottom: 5px;
            line-height: 1.4;
          }
          
          .notification-action {
            background-color: rgba(80, 80, 100, 0.3);
            border: 1px solid rgba(100, 100, 150, 0.3);
            color: white;
            padding: 3px 10px;
            font-size: 12px;
            border-radius: 3px;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }
          
          .notification-action:hover {
            background-color: rgba(100, 100, 120, 0.5);
          }
          
          .notification-dismiss {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            font-size: 14px;
            padding: 0 5px;
            transition: color 0.2s ease;
          }
          
          .notification-dismiss:hover {
            color: white;
          }
          
          @keyframes slideIn {
            0% {
              opacity: 0;
              transform: translateX(-20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideOut {
            0% {
              opacity: 1;
              transform: translateX(0);
            }
            100% {
              opacity: 0;
              transform: translateX(-20px);
            }
          }
          
          @media (max-width: 500px) {
            .notification-system {
              top: 10px;
              left: 10px;
              max-width: calc(100% - 20px);
            }
            
            .notification {
              padding: 8px;
            }
            
            .notification-icon {
              font-size: 16px;
            }
            
            .notification-message {
              font-size: 12px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationSystem;