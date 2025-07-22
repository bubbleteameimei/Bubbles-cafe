import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  getDefaultPrivacySettings, 
  validatePrivacySettings, 
  getPrivacySettingsChanges,
  getPrivacyImpactLevel 
} from '@/utils/privacy-settings-utils';

export interface PrivacySettings {
  // Fields that match the backend schema
  profileVisible: boolean;
  shareReadingHistory: boolean;
  anonymousCommenting: boolean;
  twoFactorAuthEnabled: boolean;
  loginNotifications: boolean;
  
  // Frontend-only fields with defaults
  dataRetentionPeriod: number; // in days
  activityTracking: boolean;
  emailNotifications: boolean;
}

export function usePrivacySettings() {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get default settings from utility function
  const defaultSettings = getDefaultPrivacySettings();

  // Fetch settings using React Query
  const { 
    data: settings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/user/privacy-settings'],
    queryFn: async () => {
      try {
        console.log('Fetching privacy settings...');
        const response = await apiRequest<PrivacySettings>('/api/user/privacy-settings', {
          method: 'GET',
          credentials: 'include' // Ensure cookies are sent with the request
        });
        
        if (!response) {
          throw new Error(`Error fetching privacy settings: No response received`);
        }
        
        console.log('Successfully fetched privacy settings', response);
        
        // Merge backend data with frontend-only fields
        const extendedSettings: PrivacySettings = {
          ...defaultSettings,
          ...response,
        };
        
        return extendedSettings;
      } catch (error) {
        console.error('Failed to fetch privacy settings', error);
        return defaultSettings;
      }
    },
    enabled: isAuthReady && isAuthenticated, // Only run query if auth is ready and user is authenticated
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<PrivacySettings>) => {
      // Validate settings before sending to API
      const validatedSettings = validatePrivacySettings(newSettings);
      
      console.log('Updating privacy settings:', validatedSettings);
      
      // Filter out frontend-only fields before sending to backend
      const backendFields = ['profileVisible', 'shareReadingHistory', 'anonymousCommenting', 
                           'twoFactorAuthEnabled', 'loginNotifications'];
      
      const backendSettings = Object.fromEntries(
        Object.entries(validatedSettings).filter(([key]) => backendFields.includes(key))
      );
      
      const response = await apiRequest('/api/user/privacy-settings', {
        method: 'PATCH',
        body: JSON.stringify(backendSettings),
        credentials: 'include' // Ensure cookies are sent with the request
      });
      
      if (!response) {
        throw new Error('Failed to update privacy settings - no response received');
      }
      
      return response;
    },
    onSuccess: (data, variables) => {
      // Get the current settings
      const currentSettings = settings || defaultSettings;
      
      // Generate a human-readable summary of changes
      const changesArray = getPrivacySettingsChanges(currentSettings, {
        ...currentSettings,
        ...variables
      });
      
      // Get privacy impact level from new settings
      const impactLevel = getPrivacyImpactLevel({
        ...currentSettings,
        ...variables
      });
      
      // Invalidate the query to refetch the updated settings
      queryClient.invalidateQueries({ queryKey: ['/api/user/privacy-settings'] });
      
      // Show different toast message based on the privacy impact level
      if (impactLevel === 'high' && changesArray.length > 0) {
        toast({
          title: "Settings updated with privacy warnings",
          description: "Your current settings provide less privacy protection. Consider reviewing your choices.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Settings updated",
          description: changesArray.length > 0 
            ? `Changes: ${changesArray.join(', ')}`
            : "Your privacy settings have been saved successfully.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save privacy settings",
        variant: "destructive",
      });
    }
  });

  // Helper function to update a single setting
  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  return {
    settings: settings || defaultSettings,
    isLoading,
    error,
    updateSetting,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    isAuthReady
  };
}