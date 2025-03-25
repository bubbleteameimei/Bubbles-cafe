import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { getDefaultPrivacySettings, validatePrivacySettings } from '@/utils/privacy-settings-utils';

export interface PrivacySettings {
  // User profile visibility
  profileVisible: boolean;
  
  // Reading activity sharing
  shareReadingHistory: boolean;
  
  // Comment privacy
  anonymousCommenting: boolean;
  
  // Account security
  twoFactorAuthEnabled: boolean;
  loginNotifications: boolean;
  
  // Data retention
  dataRetentionPeriod: number;
  
  // Email preferences
  emailNotifications: boolean;

  // Activity tracking
  activityTracking: boolean;
}

/**
 * Hook for managing user privacy settings
 * Handles loading, updating, and caching privacy settings
 */
export function usePrivacySettings() {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>(getDefaultPrivacySettings());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user's privacy settings when authenticated
  useEffect(() => {
    const fetchSettings = async () => {
      // If auth is not ready, keep loading
      if (!isAuthReady) {
        return;
      }
      
      // If not authenticated, stop loading and use defaults
      if (!isAuthenticated || !user) {
        console.log('User not authenticated, using default privacy settings');
        setSettings(getDefaultPrivacySettings());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching privacy settings...');
        const response = await fetch('/api/user/privacy-settings', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          // For development, use demo settings when API fails
          const isDev = process.env.NODE_ENV === 'development' || import.meta.env.DEV;
          if (isDev) {
            console.log('Using demo privacy settings for development');
            // Demo settings for development
            setSettings(validatePrivacySettings({
              profileVisible: true,
              shareReadingHistory: false,
              anonymousCommenting: true,
              twoFactorAuthEnabled: false,
              loginNotifications: true,
              dataRetentionPeriod: 90,
              emailNotifications: false,
              activityTracking: false
            }));
            setIsLoading(false);
            return;
          }
          throw new Error(`Failed to fetch privacy settings: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Merge with default settings in case the API is missing some fields
        setSettings(validatePrivacySettings({
          ...data,
          // Frontend-only defaults if not provided by backend
          dataRetentionPeriod: data.dataRetentionPeriod || 90,
          emailNotifications: data.emailNotifications ?? true,
          activityTracking: data.activityTracking ?? false
        }));
      } catch (err) {
        console.error('Failed to fetch privacy settings', err);
        setError('Failed to load privacy settings');
        // Use default settings if we can't load from API
        setSettings(getDefaultPrivacySettings());
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthReady) {
      fetchSettings();
    }
  }, [isAuthenticated, user, isAuthReady]);

  /**
   * Update a specific privacy setting
   */
  const updateSetting = useCallback(async (key: keyof PrivacySettings, value: any) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to update your privacy settings',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      console.log('Updating privacy settings:', { [key]: value });
      
      // Optimistically update the UI
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      // For development mode, just simulate success without API call
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        setTimeout(() => {
          // Successfully updated
          toast({
            title: 'Settings updated',
            description: 'Your privacy settings have been updated successfully (demo mode)',
          });
          setIsUpdating(false);
        }, 500);
        return;
      }
      
      // Send the update to the API
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ [key]: value })
      });

      if (!response.ok) {
        // Revert the optimistic update if the API call fails
        setSettings(prev => ({
          ...prev,
          [key]: !value // Toggle back to previous value
        }));
        throw new Error('Failed to update privacy settings');
      }

      // Successfully updated
      toast({
        title: 'Settings updated',
        description: 'Your privacy settings have been updated successfully',
      });
    } catch (err) {
      console.error('Failed to update privacy setting', err);
      setError('Failed to update privacy settings');
      toast({
        title: 'Update failed',
        description: 'Failed to update your privacy settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [isAuthenticated, user, toast]);

  /**
   * Update multiple privacy settings at once
   */
  const updateSettings = useCallback(async (newSettings: Partial<PrivacySettings>) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to update your privacy settings',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      // Optimistically update the UI
      setSettings(prev => ({
        ...prev,
        ...newSettings
      }));
      
      // Send the update to the API
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newSettings)
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      // Successfully updated
      toast({
        title: 'Settings updated',
        description: 'Your privacy settings have been updated successfully',
      });
    } catch (err) {
      console.error('Failed to update privacy settings', err);
      setError('Failed to update privacy settings');
      toast({
        title: 'Update failed',
        description: 'Failed to update your privacy settings. Please try again.',
        variant: 'destructive',
      });
      
      // Fetch settings again to reset to server state
      const response = await fetch('/api/user/privacy-settings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(validatePrivacySettings(data));
      }
    } finally {
      setIsUpdating(false);
    }
  }, [isAuthenticated, user, toast]);

  return {
    settings,
    isLoading,
    isUpdating,
    error,
    updateSetting,
    updateSettings,
    isAuthReady
  };
}