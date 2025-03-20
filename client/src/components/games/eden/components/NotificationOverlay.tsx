import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  duration?: number;
}

interface NotificationOverlayProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ 
  notifications,
  onDismiss
}) => {
  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-800/90';
      case 'warning': return 'bg-amber-800/90';
      case 'success': return 'bg-emerald-800/90';
      case 'danger': return 'bg-red-800/90';
      default: return 'bg-gray-800/90';
    }
  };

  return (
    <div className="fixed top-0 right-0 p-4 z-50 pointer-events-none">
      <div className="flex flex-col space-y-2 items-end">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div 
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={`${getBackgroundColor(notification.type)} text-white rounded-md shadow-lg max-w-md p-3 pointer-events-auto`}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm mr-6">{notification.message}</p>
                <button 
                  onClick={() => onDismiss(notification.id)}
                  className="ml-2 text-white/70 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationOverlay;