import React, { useState, useEffect, useRef } from 'react';
import { NotificationProps, GameNotification } from '../types';

/**
 * NotificationSystem - Displays game notifications with animation
 */
const NotificationSystem: React.FC<NotificationProps> = ({ 
  notifications,
  onDismiss
}) => {
  const notificationRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
  
  // Helper to get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      case 'achievement':
        return '🏆';
      case 'item':
        return '📦';
      case 'quest':
        return '📜';
      default:
        return 'ℹ';
    }
  };
  
  // Setup auto-dismiss for notifications with duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    notifications.forEach(notification => {
      if (notification.autoDismiss && notification.duration) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration);
        
        timers.push(timer);
      }
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, onDismiss]);
  
  // Handle notification dismiss
  const handleDismiss = (notificationId: string) => {
    // Get the notification element
    const notificationElement = notificationRefs.current[notificationId];
    
    if (notificationElement) {
      // Add exit animation class
      notificationElement.classList.add('notification-exit');
      
      // Wait for animation to complete before actually removing
      setTimeout(() => {
        onDismiss(notificationId);
      }, 300); // Match the animation duration
    } else {
      // If element reference not found, just dismiss
      onDismiss(notificationId);
    }
  };
  
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          ref={el => notificationRefs.current[notification.id] = el}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <div className="notification-icon">
              {notification.iconUrl ? (
                <img 
                  src={notification.iconUrl} 
                  alt={notification.type} 
                  className="notification-custom-icon" 
                />
              ) : (
                <span className="notification-default-icon">
                  {getNotificationIcon(notification.type)}
                </span>
              )}
            </div>
            
            <div className="notification-text">
              {notification.title && (
                <div className="notification-title">{notification.title}</div>
              )}
              <div className="notification-message">{notification.message}</div>
            </div>
            
            <button 
              className="notification-close"
              onClick={() => handleDismiss(notification.id)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 350px;
          max-height: 90vh;
          overflow-y: auto;
          padding-right: 5px;
          pointer-events: none;
        }
        
        .notification {
          background-color: rgba(30, 30, 40, 0.9);
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: notification-enter 0.3s ease forwards;
          border-left: 4px solid #4a4a5a;
          pointer-events: auto;
          backdrop-filter: blur(4px);
          font-family: 'Times New Roman', serif;
          color: #e0e0e0;
          transform-origin: top right;
        }
        
        .notification-exit {
          animation: notification-exit 0.3s ease forwards;
        }
        
        .notification-success {
          border-left-color: #66bb6a;
        }
        
        .notification-error {
          border-left-color: #ef5350;
        }
        
        .notification-warning {
          border-left-color: #ffa726;
        }
        
        .notification-info {
          border-left-color: #42a5f5;
        }
        
        .notification-achievement {
          border-left-color: #ffcc00;
        }
        
        .notification-item {
          border-left-color: #7e57c2;
        }
        
        .notification-quest {
          border-left-color: #ab47bc;
        }
        
        .notification-content {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        
        .notification-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(60, 60, 80, 0.6);
          flex-shrink: 0;
        }
        
        .notification-default-icon {
          font-size: 16px;
          font-weight: bold;
        }
        
        .notification-custom-icon {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
        }
        
        .notification-text {
          flex: 1;
        }
        
        .notification-title {
          font-weight: bold;
          margin-bottom: 4px;
          font-size: 16px;
        }
        
        .notification-message {
          font-size: 14px;
          line-height: 1.4;
          color: #c8c8d8;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: #a0a0b0;
          font-size: 14px;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          transition: all 0.2s;
          margin-top: 2px;
        }
        
        .notification-close:hover {
          background-color: rgba(120, 120, 140, 0.3);
          color: #e0e0e0;
        }
        
        @keyframes notification-enter {
          0% {
            opacity: 0;
            transform: translateX(30px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes notification-exit {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(30px) scale(0.9);
          }
        }
        
        @media (max-width: 768px) {
          .notification-container {
            top: 10px;
            right: 10px;
            max-width: 300px;
          }
          
          .notification {
            padding: 10px;
          }
          
          .notification-icon {
            width: 24px;
            height: 24px;
          }
          
          .notification-title {
            font-size: 14px;
          }
          
          .notification-message {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;