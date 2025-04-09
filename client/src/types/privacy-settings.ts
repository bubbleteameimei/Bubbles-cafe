/**
 * Privacy settings type definitions
 */

/**
 * User privacy settings interface
 * Contains all privacy and data-related user preferences
 */
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
  
  // Data collection preferences
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowThirdPartySharing: boolean;
  
  // Marketing preferences
  allowMarketingEmails: boolean;
  allowActivityReminders: boolean;
  
  // Cookie preferences
  acceptEssentialCookies: boolean; // Always true, required for site functionality
  acceptPreferenceCookies: boolean;
  acceptAnalyticsCookies: boolean;
  acceptMarketingCookies: boolean;
  
  // External integrations
  allowSocialMediaIntegration: boolean;
}

/**
 * Available privacy impact levels
 * Used to assess the privacy impact of user's settings
 */
export type PrivacyImpactLevel = 'high' | 'medium' | 'low';

/**
 * Interface for tracking privacy settings changes
 */
export interface PrivacySettingsChange {
  settingKey: keyof PrivacySettings;
  oldValue: boolean;
  newValue: boolean;
  impactLevel: PrivacyImpactLevel;
}