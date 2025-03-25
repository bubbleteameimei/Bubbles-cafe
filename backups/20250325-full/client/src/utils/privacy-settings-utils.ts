/**
 * Privacy settings utility functions
 * Provides helper functions for managing user privacy settings
 */

import type { PrivacySettings } from '@/hooks/use-privacy-settings';

/**
 * Default privacy settings with privacy-first approach
 * New users get these restrictive settings by default
 */
export const getDefaultPrivacySettings = (): PrivacySettings => {
  return {
    // Backend fields
    profileVisible: false,            // Profiles private by default
    shareReadingHistory: false,       // Reading history not shared by default
    anonymousCommenting: true,        // Comments anonymous by default
    twoFactorAuthEnabled: false,      // 2FA disabled by default
    loginNotifications: true,         // Login notifications enabled by default
    
    // Frontend-only fields
    dataRetentionPeriod: 90,          // 90 day retention by default 
    emailNotifications: true,         // Notifications enabled by default
    activityTracking: false           // Activity tracking disabled by default
  };
};

/**
 * Validate privacy settings to ensure they follow expected format
 * @param settings The settings object to validate
 * @returns A validated settings object with any missing properties filled with defaults
 */
export const validatePrivacySettings = (settings: Partial<PrivacySettings>): PrivacySettings => {
  const defaultSettings = getDefaultPrivacySettings();
  
  // Merge provided settings with defaults for any missing properties
  return {
    ...defaultSettings,
    ...settings
  };
};

/**
 * Generate a human-readable summary of privacy settings changes
 * @param oldSettings Previous settings
 * @param newSettings New settings
 * @returns Array of strings describing changes
 */
export const getPrivacySettingsChanges = (
  oldSettings: PrivacySettings, 
  newSettings: PrivacySettings
): string[] => {
  const changes: string[] = [];
  
  if (oldSettings.profileVisible !== newSettings.profileVisible) {
    changes.push(`Profile visibility ${newSettings.profileVisible ? 'enabled' : 'disabled'}`);
  }
  
  if (oldSettings.shareReadingHistory !== newSettings.shareReadingHistory) {
    changes.push(`Reading history sharing ${newSettings.shareReadingHistory ? 'enabled' : 'disabled'}`);
  }
  
  if (oldSettings.anonymousCommenting !== newSettings.anonymousCommenting) {
    changes.push(`Anonymous commenting ${newSettings.anonymousCommenting ? 'enabled' : 'disabled'}`);
  }
  
  if (oldSettings.twoFactorAuthEnabled !== newSettings.twoFactorAuthEnabled) {
    changes.push(`Two-factor authentication ${newSettings.twoFactorAuthEnabled ? 'enabled' : 'disabled'}`);
  }
  
  if (oldSettings.loginNotifications !== newSettings.loginNotifications) {
    changes.push(`Login notifications ${newSettings.loginNotifications ? 'enabled' : 'disabled'}`);
  }
  
  if (oldSettings.dataRetentionPeriod !== newSettings.dataRetentionPeriod) {
    changes.push(`Data retention period changed to ${newSettings.dataRetentionPeriod} days`);
  }
  
  if (oldSettings.emailNotifications !== newSettings.emailNotifications) {
    changes.push(`Email notifications ${newSettings.emailNotifications ? 'enabled' : 'disabled'}`);
  }
  
  if (oldSettings.activityTracking !== newSettings.activityTracking) {
    changes.push(`Activity tracking ${newSettings.activityTracking ? 'enabled' : 'disabled'}`);
  }
  
  return changes;
};

/**
 * Extract privacy impact level from settings to highlight privacy risks
 * @param settings The privacy settings to analyze
 * @returns 'high' | 'medium' | 'low' privacy impact
 */
export const getPrivacyImpactLevel = (settings: PrivacySettings): 'high' | 'medium' | 'low' => {
  let exposureScore = 0;
  
  // Calculate a privacy exposure score based on settings
  if (settings.profileVisible) exposureScore += 2;
  if (settings.shareReadingHistory) exposureScore += 2;
  if (!settings.anonymousCommenting) exposureScore += 1;
  if (!settings.twoFactorAuthEnabled) exposureScore += 2; // Not having 2FA increases risk
  if (settings.dataRetentionPeriod > 180) exposureScore += 2;
  if (settings.activityTracking) exposureScore += 3;
  
  // Login notifications actually reduce privacy impact (security benefit)
  if (settings.loginNotifications) exposureScore -= 1;
  
  // Determine impact level based on exposure score
  if (exposureScore >= 6) return 'high';
  if (exposureScore >= 3) return 'medium';
  return 'low';
};