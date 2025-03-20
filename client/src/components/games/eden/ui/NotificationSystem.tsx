import React, { useState, useEffect } from 'react';
import { Notification } from '../types';

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'top-center' | 'bottom-center';
  autoClose?: boolean;
  autoCloseTime?: number;
}

/**
 * Displays game notifications with different types and animations
 */
const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  position = 'top-right',
  autoClose = true,
  autoCloseTime = 5000,
}) => {
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);
  const [exiting, setExiting] = useState<Record<string, boolean>>({});
  
  // Update active notifications when the notifications prop changes
  useEffect(() => {
    if (notifications.length === 0) {
      setActiveNotifications([]);
      setExiting({});
      return;
    }

    // Add new notifications to the active list
    const currentNotificationIds = new Set(activeNotifications.map(n => n.id));
    const newNotifications = notifications.filter(n => !currentNotificationIds.has(n.id));
    
    if (newNotifications.length > 0) {
      setActiveNotifications(prev => [...prev, ...newNotifications]);
    }
  }, [notifications, activeNotifications]);

  // Auto-close notifications after a specified time
  useEffect(() => {
    if (!autoClose) return;
    
    const timeouts: NodeJS.Timeout[] = [];
    
    activeNotifications.forEach(notification => {
      if (exiting[notification.id]) return;
      
      // Use custom duration from notification or default
      const duration = notification.duration || autoCloseTime;
      
      const timeoutId = setTimeout(() => {
        handleDismiss(notification.id);
      }, duration);
      
      timeouts.push(timeoutId);
    });
    
    // Clean up timeouts on unmount
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [activeNotifications, exiting, autoClose, autoCloseTime]);
  
  // Handle notification dismissal
  const handleDismiss = (id: string) => {
    // Mark notification as exiting to trigger animation
    setExiting(prev => ({ ...prev, [id]: true }));
    
    // Remove notification after animation completes
    setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== id));
      setExiting(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      
      // Call onDismiss callback if provided
      if (onDismiss) {
        onDismiss(id);
      }
    }, 300); // Should match CSS transition time
  };
  
  // Get position styles based on the position prop
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'top-left':
        return { top: '20px', left: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'top-center':
        return { top: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
      default:
        return { top: '20px', right: '20px' };
    }
  };
  
  // Helper to get notification background color based on type
  const getNotificationBackground = (type: string) => {
    switch (type) {
      case 'success':
        return 'rgba(40, 100, 60, 0.9)';
      case 'error':
        return 'rgba(150, 40, 40, 0.9)';
      case 'warning':
        return 'rgba(150, 100, 20, 0.9)';
      case 'info':
        return 'rgba(40, 60, 100, 0.9)';
      case 'discovery':
        return 'rgba(100, 50, 130, 0.9)';
      case 'achievement':
        return 'rgba(140, 100, 20, 0.9)';
      case 'quest':
        return 'rgba(60, 90, 120, 0.9)';
      default:
        return 'rgba(60, 60, 70, 0.9)';
    }
  };
  
  // Helper to get notification icon based on type
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
      case 'discovery':
        return '✧';
      case 'achievement':
        return '🏆';
      case 'quest':
        return '📜';
      default:
        return '•';
    }
  };
  
  // Helper to get icon background color based on type
  const getIconBackground = (type: string) => {
    switch (type) {
      case 'success':
        return 'rgba(30, 140, 80, 1)';
      case 'error':
        return 'rgba(200, 50, 50, 1)';
      case 'warning':
        return 'rgba(200, 130, 20, 1)';
      case 'info':
        return 'rgba(50, 80, 150, 1)';
      case 'discovery':
        return 'rgba(130, 60, 170, 1)';
      case 'achievement':
        return 'rgba(180, 140, 20, 1)';
      case 'quest':
        return 'rgba(80, 120, 160, 1)';
      default:
        return 'rgba(80, 80, 90, 1)';
    }
  };
  
  // If there are no notifications, don't render anything
  if (activeNotifications.length === 0) {
    return null;
  }
  
  return (
    <div
      className="notifications-container"
      style={{
        position: 'fixed',
        zIndex: 1000,
        width: 'min(100%, 320px)',
        maxHeight: '80vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none', // This allows clicking through the container
        ...getPositionStyles(),
      }}
    >
      {activeNotifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${exiting[notification.id] ? 'exiting' : 'entering'}`}
          style={{
            backgroundColor: getNotificationBackground(notification.type),
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            padding: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            pointerEvents: 'auto', // Make the notification clickable
            opacity: exiting[notification.id] ? 0 : 1,
            transform: exiting[notification.id] 
              ? 'translateX(100%)' 
              : 'translateX(0)',
            transition: 'opacity 300ms ease-out, transform 300ms ease-out',
            backdropFilter: 'blur(4px)',
            border: `1px solid ${getIconBackground(notification.type)}`,
            color: '#ffffff',
            fontFamily: 'serif',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Notification background glow effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.15,
              background: `radial-gradient(circle at 30% 30%, ${getIconBackground(notification.type)}, transparent 70%)`,
              zIndex: 0
            }}
          />
          
          {/* Notification Icon */}
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: getIconBackground(notification.type),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '10px',
              fontSize: '0.9rem',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              zIndex: 1
            }}
          >
            {getNotificationIcon(notification.type)}
          </div>
          
          {/* Notification Content */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Notification Title (if present) */}
            {notification.title && (
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  marginBottom: '3px',
                  color: '#ffffff'
                }}
              >
                {notification.title}
              </div>
            )}
            
            {/* Notification Message */}
            <div
              style={{
                fontSize: '0.95rem',
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: 1.4
              }}
            >
              {notification.message}
            </div>
            
            {/* Metadata (if present) */}
            {notification.meta && (
              <div
                style={{
                  fontSize: '0.8rem',
                  marginTop: '5px',
                  opacity: 0.8,
                  fontStyle: 'italic'
                }}
              >
                {notification.meta}
              </div>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => handleDismiss(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0 5px',
              marginLeft: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'color 0.2s ease',
              position: 'relative',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
            aria-label="Close notification"
          >
            ×
          </button>
          
          {/* Progress Bar for auto-close */}
          {autoClose && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                animation: `shrink ${notification.duration || autoCloseTime}ms linear forwards`,
                width: '100%',
                transformOrigin: 'left center',
                zIndex: 1
              }}
            />
          )}
        </div>
      ))}
      
      {/* Animations */}
      <style>
        {`
          @keyframes shrink {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }
          
          .notifications-container::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          .notifications-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 4px;
          }
          
          .notifications-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
          }
          
          .notifications-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.4);
          }
          
          .notification.entering {
            animation: slideIn 0.3s ease-out forwards;
          }
          
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationSystem;