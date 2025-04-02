import { useState, useEffect } from 'react';

export type NightModePreference = 'light' | 'night' | 'system';

/**
 * Hook to manage night mode preferences
 * Night mode is specifically for reading experience, separate from the theme
 * Auto mode and time-based activation have been removed
 */
export function useNightMode() {
  const [preference, setPreference] = useState<NightModePreference>(() => {
    // Try to read from localStorage first
    const savedPreference = localStorage.getItem('night-mode-preference');
    
    // Handle legacy 'auto' setting by converting it to 'system'
    if (savedPreference === 'auto') {
      localStorage.setItem('night-mode-preference', 'system');
      return 'system';
    }
    
    if (savedPreference && ['light', 'night', 'system'].includes(savedPreference)) {
      return savedPreference as NightModePreference;
    }
    
    // Default to system preference
    return 'system';
  });

  const [isNightMode, setIsNightMode] = useState(false);

  // Function to check system dark mode preference
  const checkSystemPreference = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Effect to apply night mode
  useEffect(() => {
    console.log('[NightMode] Updating night mode preference to:', preference);
    
    // Update localStorage
    localStorage.setItem('night-mode-preference', preference);
    
    // Determine if night mode should be active
    let shouldEnableNightMode = false;
    
    if (preference === 'night') {
      shouldEnableNightMode = true;
    } else if (preference === 'light') {
      shouldEnableNightMode = false;
    } else if (preference === 'system') {
      shouldEnableNightMode = checkSystemPreference();
    }
    
    setIsNightMode(shouldEnableNightMode);
    
    // Apply night mode class to the reader page if on reader
    const readerPage = document.querySelector('[data-reader-page="true"]');
    if (readerPage) {
      if (shouldEnableNightMode) {
        readerPage.classList.add('night-mode');
      } else {
        readerPage.classList.remove('night-mode');
      }
    }
    
    // Set up appropriate listeners based on preference
    if (preference === 'system') {
      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e: MediaQueryListEvent) => {
        setIsNightMode(e.matches);
        if (readerPage) {
          if (e.matches) {
            readerPage.classList.add('night-mode');
          } else {
            readerPage.classList.remove('night-mode');
          }
        }
      };
      
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [preference, isNightMode]);
  
  // Function to switch to a specific preference
  const updateNightModePreference = (newPreference: NightModePreference) => {
    console.log('[NightMode] Setting night mode preference:', newPreference);
    setPreference(newPreference);
  };
  
  return {
    preference,
    isNightMode,
    updateNightModePreference
  };
}