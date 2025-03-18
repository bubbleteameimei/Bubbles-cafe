# Privacy Settings

This document outlines the privacy settings implementation for the horror stories website.

## Architecture Overview

The privacy settings feature provides users with control over their personal data and reading experiences. The implementation follows a secure, privacy-first approach.

### Database Schema

Privacy settings are stored in the `userPrivacySettings` table with the following structure:
- `userId` - The user ID (primary key reference)
- `profileVisibility` - Controls whether the user's profile is visible to others (boolean)
- `shareReadingHistory` - Controls whether reading history is used for recommendations (boolean)
- `anonymousCommenting` - Controls whether comments are anonymous (boolean)
- `dataRetentionPeriod` - How long user data is retained in days (integer)
- `emailNotifications` - Controls email notification preferences (boolean)
- `activityTracking` - Controls whether user activity is tracked (boolean)
- `createdAt` - When the settings were created (timestamp)
- `updatedAt` - When the settings were last updated (timestamp)

### API Endpoints

The following REST endpoints handle privacy settings:
- `GET /api/user/privacy-settings` - Retrieve user privacy settings
- `PATCH /api/user/privacy-settings` - Update user privacy settings

### Frontend Components

- `usePrivacySettings` hook - Manages state and API communication
- `PrivacySettingsPage` component - UI for managing privacy settings

## Security Features

- Authentication required for all privacy settings endpoints
- Default restrictive settings applied for new users
- Privacy settings changes are logged for audit purposes
- All API endpoints have proper rate limiting
- Privacy settings are immediately applied when changed

## User Controls

The privacy settings provide controls for:
1. **Profile Visibility** - Control who can see your profile
2. **Reading History** - Control how reading data is used
3. **Anonymous Commenting** - Hide your identity in comments
4. **Data Retention** - Control how long data is stored
5. **Email Notifications** - Manage email communications
6. **Activity Tracking** - Control usage tracking

## Future Enhancements

- Export user data in machine-readable format
- Enhanced account deletion options
- Granular control over which profile elements are visible
- Advanced cookie management options
- Data retention period customization

## Implementation Notes

- Privacy settings use React Query for data fetching and caching
- The UI follows the design system guidelines with consistent switch components
- All text elements include proper ARIA attributes for accessibility
- Loading and error states handled with appropriate UI feedback