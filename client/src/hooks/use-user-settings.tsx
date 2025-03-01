import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export type UserSettings = {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  textToSpeech: {
    enabled: boolean;
    volume: number;
    rate: number;
    pitch: number;
    voice: string;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    inSite: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "friends";
    activityVisibility: "public" | "private" | "friends";
    twoFactorEnabled: boolean;
  };
  offlineAccess: {
    enabled: boolean;
    autoSync: boolean;
    storageLimit: number;
  };
};

const defaultSettings: UserSettings = {
  theme: 'system',
  fontSize: 16,
  fontFamily: 'inter',
  textToSpeech: {
    enabled: false,
    volume: 75,
    rate: 1,
    pitch: 1,
    voice: '',
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
  },
  notifications: {
    email: true,
    push: true,
    inSite: true,
  },
  privacy: {
    profileVisibility: "public",
    activityVisibility: "public",
    twoFactorEnabled: false,
  },
  offlineAccess: {
    enabled: false,
    autoSync: true,
    storageLimit: 100,
  }
};

export function useUserSettings() {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch settings from API
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: async () => {
      console.log('[Settings] Fetching user settings from API...');
      try {
        const res = await apiRequest('GET', '/api/user/settings');
        console.log('[Settings] API response status:', res.status);

        if (!res.ok) {
          console.log('[Settings] API request failed, falling back to localStorage');
          throw new Error(`API request failed with status ${res.status}`);
        }

        const data = await res.json();
        console.log('[Settings] Successfully fetched settings from API');
        return data as UserSettings;
      } catch (error) {
        // Detailed error logging
        console.log('[Settings] Error fetching from API:', error);
        console.log('[Settings] Attempting localStorage fallback...');

        const localSettings = localStorage.getItem('userSettings');
        if (localSettings) {
          console.log('[Settings] Found settings in localStorage');
          return JSON.parse(localSettings);
        }

        console.log('[Settings] No settings found, using defaults');
        return defaultSettings;
      }
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      console.log('[Settings] Updating settings:', newSettings);
      const res = await apiRequest('PATCH', '/api/user/settings', newSettings);
      console.log('[Settings] Update response status:', res.status);

      if (!res.ok) {
        throw new Error(`Failed to update settings: ${res.status}`);
      }

      return res.json();
    },
    onSuccess: (data) => {
      console.log('[Settings] Successfully updated settings');
      queryClient.setQueryData(['/api/user/settings'], data);
      localStorage.setItem('userSettings', JSON.stringify(data));
      toast({
        title: 'Settings updated',
        description: 'Your preferences have been saved.',
      });
    },
    onError: (error: Error) => {
      console.error('[Settings] Failed to update settings:', error);
      toast({
        title: 'Failed to save settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Initialize settings from localStorage
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      console.log('[Settings] Initializing settings...');
      const localSettings = localStorage.getItem('userSettings');
      if (localSettings) {
        console.log('[Settings] Found initial settings in localStorage');
        const parsed = JSON.parse(localSettings);
        queryClient.setQueryData(['/api/user/settings'], parsed);
      } else {
        console.log('[Settings] No initial settings found in localStorage');
      }
      setIsInitialized(true);
    }
  }, [isInitialized, isLoading]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    console.log('[Settings] Updating settings with:', newSettings);

    // Optimistically update local storage
    const currentSettings = settings || defaultSettings;
    const updatedSettings = { ...currentSettings, ...newSettings };
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    console.log('[Settings] Settings saved to localStorage');

    // Update API
    await updateSettingsMutation.mutateAsync(newSettings);
  }, [settings, updateSettingsMutation]);

  // Apply settings to document
  useEffect(() => {
    if (settings) {
      console.log('[Settings] Applying settings to document...');

      // Apply font size
      document.documentElement.style.setProperty('--base-font-size', `${settings.fontSize}px`);

      // Apply font family
      document.documentElement.style.setProperty('--font-family', settings.fontFamily);

      // Apply accessibility settings
      document.documentElement.classList.toggle('high-contrast', settings.accessibility.highContrast);
      document.documentElement.classList.toggle('reduced-motion', settings.accessibility.reducedMotion);

      // Apply other settings that affect the document
      if (settings.accessibility.screenReader) {
        document.documentElement.setAttribute('role', 'application');
      } else {
        document.documentElement.removeAttribute('role');
      }

      console.log('[Settings] Settings applied to document');
    }
  }, [settings]);

  return {
    settings: settings || defaultSettings,
    isLoading,
    updateSettings,
    isPending: updateSettingsMutation.isPending,
  };
}