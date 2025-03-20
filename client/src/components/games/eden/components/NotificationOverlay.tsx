import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Info, AlertTriangle } from 'lucide-react';
import { Notification } from '../types';

interface NotificationOverlayProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export default function NotificationOverlay({ notifications, onDismiss }: NotificationOverlayProps) {
  if (!notifications || notifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-30 w-full max-w-sm space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="pointer-events-auto"
          >
            <div 
              className={`${getBackgroundColor(notification.type)} p-4 rounded-lg shadow-lg border border-gray-800 flex items-start`}
            >
              <div className="flex-shrink-0 mr-3">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-medium">{notification.title}</h4>
                  <button 
                    onClick={() => onDismiss(notification.id)}
                    className="text-gray-400 hover:text-white transition-colors ml-2"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                
                {notification.action && (
                  <button
                    onClick={() => {
                      notification.action?.callback?.();
                      onDismiss(notification.id);
                    }}
                    className="mt-2 text-sm bg-gray-700/50 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function getBackgroundColor(type: string): string {
  switch (type) {
    case 'success':
      return 'bg-green-900/90 backdrop-blur-sm';
    case 'error':
      return 'bg-red-900/90 backdrop-blur-sm';
    case 'warning':
      return 'bg-yellow-900/90 backdrop-blur-sm';
    case 'info':
    default:
      return 'bg-gray-900/90 backdrop-blur-sm';
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'success':
      return <Bell size={20} className="text-green-400" />;
    case 'error':
      return <X size={20} className="text-red-400" />;
    case 'warning':
      return <AlertTriangle size={20} className="text-yellow-400" />;
    case 'info':
    default:
      return <Info size={20} className="text-blue-400" />;
  }
}