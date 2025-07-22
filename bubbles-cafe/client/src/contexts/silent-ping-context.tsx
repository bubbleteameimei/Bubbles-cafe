import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNotifications } from '../contexts/notification-context';

interface SilentPingContextType {
  triggerSilentPing: () => void;
  isEnabled: boolean;
  toggleEnabled: () => void;
}

const SilentPingContext = createContext<SilentPingContextType | undefined>(undefined);

// Creepy messages that appear in notifications but lead nowhere
const SILENT_PING_MESSAGES = [
  { title: "New message", message: "Someone just messaged you..." },
  { title: "Activity detected", message: "Someone viewed your profile" },
  { title: "New interaction", message: "Someone mentioned you" },
  { title: "Connection request", message: "Someone wants to connect" },
  { title: "System alert", message: "Important update available" },
  { title: "Story update", message: "A story you're following was updated" },
  { title: "Content alert", message: "New content has been published for you" },
  { title: "Reminder", message: "Don't forget about your unread stories" }
];

export function SilentPingProvider({ children }: { children: React.ReactNode }) {
  // Check if silent pings are enabled (off by default)
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('silentPingEnabled');
      return saved !== null ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('[SilentPing] Error loading from localStorage:', error);
      return false;
    }
  });

  // Save preference to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('silentPingEnabled', JSON.stringify(isEnabled));
    } catch (error) {
      console.error('[SilentPing] Error saving to localStorage:', error);
    }
  }, [isEnabled]);

  const { addNotification } = useNotifications();

  // Function to trigger a silent ping (notification that leads nowhere)
  const triggerSilentPing = useCallback(() => {
    if (!isEnabled) return;

    // Choose a random creepy message
    const randomMessage = SILENT_PING_MESSAGES[Math.floor(Math.random() * SILENT_PING_MESSAGES.length)];
    
    // Add the notification
    addNotification({
      type: 'info',
      title: randomMessage.title,
      message: randomMessage.message,
      // No link, so when clicked, it will do nothing
    });
  }, [addNotification, isEnabled]);

  // Schedule random silent pings (1-2 per day)
  useEffect(() => {
    if (!isEnabled) return;
    
    // Check if we've already shown a notification today
    const checkAndSetLastNotification = () => {
      // Try to get last notification timestamp from localStorage
      try {
        const lastPingTimeString = localStorage.getItem('lastSilentPingTime');
        const currentTimeMs = Date.now();
        
        if (lastPingTimeString) {
          const lastPingTime = parseInt(lastPingTimeString, 10);
          const hoursSinceLastPing = (currentTimeMs - lastPingTime) / (1000 * 60 * 60);
          
          // If it's been less than 12 hours since the last notification, don't show another
          if (hoursSinceLastPing < 12) {
            console.log('[SilentPing] Last ping was less than 12 hours ago, skipping');
            return false;
          }
        }
        
        // If we've decided to show a notification, update the timestamp
        return true;
      } catch (error) {
        console.error('[SilentPing] Error checking last notification time:', error);
        return true; // Default to allowing notification if there's an error
      }
    };
    
    // Random delay between 4-8 hours (in milliseconds)
    const getRandomDelay = () => (4 + Math.floor(Math.random() * 4)) * 60 * 60 * 1000;
    
    let timeout: NodeJS.Timeout;
    
    const schedulePing = () => {
      timeout = setTimeout(() => {
        // Only show notification if time criteria is met and random chance succeeds
        if (checkAndSetLastNotification() && Math.random() < 0.5) {
          triggerSilentPing();
          // Record this notification time
          localStorage.setItem('lastSilentPingTime', Date.now().toString());
        }
        
        // Schedule the next ping attempt
        schedulePing();
      }, getRandomDelay());
    };
    
    // Start the cycle
    schedulePing();
    
    // Clean up on unmount or when disabled
    return () => clearTimeout(timeout);
  }, [isEnabled, triggerSilentPing]);

  // Minimal chance of ping happening when the user does something
  // This provides occasional unexpected behavior but very rarely
  useEffect(() => {
    if (!isEnabled) return;
    
    const userActionListener = () => {
      try {
        // Check when the last notification was shown
        const lastPingTimeString = localStorage.getItem('lastSilentPingTime');
        const currentTimeMs = Date.now();
        
        if (lastPingTimeString) {
          const lastPingTime = parseInt(lastPingTimeString, 10);
          const hoursSinceLastPing = (currentTimeMs - lastPingTime) / (1000 * 60 * 60);
          
          // If it's been less than 12 hours, don't even consider showing a notification
          if (hoursSinceLastPing < 12) {
            return;
          }
        }
        
        // Extremely low probability on user action (1 in 1000)
        // Even rarer than before to ensure we hit maximum 1-2 times per day
        if (Math.random() < 0.001) {
          triggerSilentPing();
          localStorage.setItem('lastSilentPingTime', currentTimeMs.toString());
        }
      } catch (error) {
        console.error('[SilentPing] Error in user action listener:', error);
      }
    };
    
    // Listen for clicks and page transitions
    window.addEventListener('click', userActionListener);
    window.addEventListener('popstate', userActionListener);
    
    return () => {
      window.removeEventListener('click', userActionListener);
      window.removeEventListener('popstate', userActionListener);
    };
  }, [isEnabled, triggerSilentPing]);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const contextValue = {
    triggerSilentPing,
    isEnabled,
    toggleEnabled
  };

  return (
    <SilentPingContext.Provider value={contextValue}>
      {children}
    </SilentPingContext.Provider>
  );
}

export function useSilentPing() {
  const context = useContext(SilentPingContext);
  if (context === undefined) {
    throw new Error('useSilentPing must be used within a SilentPingProvider');
  }
  return context;
}