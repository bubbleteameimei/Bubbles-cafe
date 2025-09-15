import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNotifications } from './notification-context';

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
  // Check if silent pings are enabled (on by default)
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('silentPingEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (error) {
      console.error('[SilentPing] Error loading from localStorage:', error);
      return true;
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

  // Schedule random silent pings
  useEffect(() => {
    if (!isEnabled) return;
    
    // Random delay between 5-15 minutes
    const getRandomDelay = () => (5 + Math.floor(Math.random() * 10)) * 60 * 1000;
    
    let timeout: NodeJS.Timeout;
    
    const schedulePing = () => {
      timeout = setTimeout(() => {
        // Only 1 in 3 chance of actually showing the notification
        // This makes the behavior more unpredictable and eerie
        if (Math.random() < 0.33) {
          triggerSilentPing();
        }
        
        // Schedule the next ping
        schedulePing();
      }, getRandomDelay());
    };
    
    // Start the cycle
    schedulePing();
    
    // Clean up on unmount or when disabled
    return () => clearTimeout(timeout);
  }, [isEnabled, triggerSilentPing]);

  // For development/testing purposes: 
  // Let's have a small chance of a ping happening when the user does something
  useEffect(() => {
    if (!isEnabled) return;
    
    const userActionListener = () => {
      // Extremely low probability on user action (1 in 200)
      if (Math.random() < 0.005) {
        triggerSilentPing();
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