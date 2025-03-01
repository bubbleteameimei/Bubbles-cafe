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
      try {
        const res = await apiRequest('GET', '/api/user/settings');
        return (await res.json()) as UserSettings;
      } catch (error) {
        // Fall back to localStorage if API fails
        const localSettings = localStorage.getItem('userSettings');
        return localSettings ? JSON.parse(localSettings) : defaultSettings;
      }
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      const res = await apiRequest('PATCH', '/api/user/settings', newSettings);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user/settings'], data);
      localStorage.setItem('userSettings', JSON.stringify(data));
      toast({
        title: 'Settings updated',
        description: 'Your preferences have been saved.',
      });
    },
    onError: (error: Error) => {
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
      const localSettings = localStorage.getItem('userSettings');
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        queryClient.setQueryData(['/api/user/settings'], parsed);
      }
      setIsInitialized(true);
    }
  }, [isInitialized, isLoading]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    // Optimistically update local storage
    const currentSettings = settings || defaultSettings;
    const updatedSettings = { ...currentSettings, ...newSettings };
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));

    // Update API
    await updateSettingsMutation.mutateAsync(newSettings);
  }, [settings, updateSettingsMutation]);

  // Apply settings to document
  useEffect(() => {
    if (settings) {
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
    }
  }, [settings]);

  return {
    settings: settings || defaultSettings,
    isLoading,
    updateSettings,
    isPending: updateSettingsMutation.isPending,
  };
}