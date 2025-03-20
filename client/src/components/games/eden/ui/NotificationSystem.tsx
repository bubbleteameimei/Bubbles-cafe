import React, { useState, useEffect } from 'react';
import { Notification, NotificationType } from '../types';

export interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss
}) => {
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);
  
  // Handle incoming notifications
  useEffect(() => {
    setActiveNotifications(prev => [...prev, ...notifications]);
    
    // Set up auto-dismiss for notifications with duration and autoDismiss
    notifications.forEach(notification => {
      if (notification.duration && notification.autoDismiss) {
        setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration);
      }
    });
  }, [notifications, onDismiss]);
  
  // Remove dismissed notifications
  useEffect(() => {
    setActiveNotifications(prev => 
      prev.filter(notification => notifications.some(n => n.id === notification.id))
    );
  }, [notifications]);
  
  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return '🛈';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✓';
      case 'discovery':
        return '🔍';
      case 'achievement':
        return '🏆';
      default:
        return 'ℹ️';
    }
  };
  
  // Get background color based on notification type
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return 'rgba(20, 30, 50, 0.9)';
      case 'warning':
        return 'rgba(70, 50, 20, 0.9)';
      case 'error':
        return 'rgba(70, 20, 20, 0.9)';
      case 'success':
        return 'rgba(20, 60, 30, 0.9)';
      case 'discovery':
        return 'rgba(40, 20, 60, 0.9)';
      case 'achievement':
        return 'rgba(60, 50, 10, 0.9)';
      default:
        return 'rgba(30, 30, 35, 0.9)';
    }
  };
  
  if (activeNotifications.length === 0) {
    return null;
  }
  
  return (
    <div className="notification-container">
      {activeNotifications.map((notification, index) => (
        <div 
          key={notification.id}
          className="notification"
          style={{
            backgroundColor: getNotificationColor(notification.type),
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div className="notification-icon">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="notification-content">
            {notification.message}
          </div>
          <button 
            className="notification-dismiss"
            onClick={() => onDismiss(notification.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
      
      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 1000;
          max-width: 350px;
          max-height: 80vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #8a5c41 transparent;
        }
        
        .notification-container::-webkit-scrollbar {
          width: 5px;
        }
        
        .notification-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .notification-container::-webkit-scrollbar-thumb {
          background-color: #8a5c41;
          border-radius: 20px;
        }
        
        .notification {
          display: flex;
          align-items: flex-start;
          padding: 12px 15px;
          border-radius: 6px;
          border-left: 4px solid #8a5c41;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          animation: slideIn 0.3s ease-out forwards;
          backdrop-filter: blur(4px);
          width: 100%;
        }
        
        @keyframes slideIn {
          from { 
            transform: translateX(100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .notification-icon {
          margin-right: 12px;
          font-size: 18px;
          line-height: 1.5;
        }
        
        .notification-content {
          flex: 1;
          font-size: 14px;
          color: #f1d7c5;
          line-height: 1.5;
        }
        
        .notification-dismiss {
          background: none;
          border: none;
          color: #f1d7c5;
          font-size: 18px;
          cursor: pointer;
          padding: 0 5px;
          opacity: 0.7;
          transition: opacity 0.2s;
          margin-left: 8px;
        }
        
        .notification-dismiss:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};