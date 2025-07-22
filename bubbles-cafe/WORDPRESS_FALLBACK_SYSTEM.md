# WordPress Integration Fallback System

This document explains the WordPress integration and auto-synchronization system implemented in the application.

## Overview

The application integrates with a WordPress site (BubbleTeaMeiMei) to fetch stories and content using WordPress's REST API. To ensure maximum reliability and offline functionality, we've implemented a comprehensive fallback system with automatic synchronization.

## Key Components

### 1. WordPress Auto-Sync Service (wordpress-sync.ts)

This service automatically synchronizes WordPress posts every 5 minutes, storing them in local browser storage.

- **Sync Interval**: 5 minutes
- **Storage Location**: Browser's localStorage (persists between sessions)
- **Data Retention**: Local posts are considered valid for up to 24 hours
- **Implementation**: Initialized on application startup in App.tsx

### 2. Multi-Level Fallback System

The system implements a cascading fallback approach when retrieving WordPress content:

1. **Primary Source**: WordPress REST API (https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com)
2. **Fallback 1**: Local synchronized posts from auto-sync service
3. **Fallback 2**: Server API endpoint (/api/posts)

### 3. Error Handling and Recovery

- API status is checked before making requests to avoid unnecessary network operations
- A progressive retry mechanism handles intermittent connectivity issues
- API status is cached for 5 minutes to prevent repeated checks
- Detailed error logging helps diagnose and debug API issues

## Fallback Flow

The system makes decisions on which data source to use based on the following decision tree:

1. First attempt to use locally synchronized posts:
   - If available and not too old (< 24 hours), use immediately
   - In parallel, try to refresh from the API in the background

2. If no local posts are available, check WordPress API status:
   - If API is available, fetch directly from WordPress
   - If API is down, use server-side fallback

3. If both API and server fallback fail:
   - Show appropriate error messages
   - Allow for manual retry

## Synchronization Process

The synchronization process works as follows:

1. At application startup and every 5 minutes thereafter:
   - Attempt to fetch latest posts from WordPress API
   - Store successful responses in localStorage

2. When a sync fails:
   - Record the error details and timestamp
   - Continue to use previously synced data
   - Retry at the next scheduled interval

3. When a user navigates to content:
   - Check for locally synced content first (for speed)
   - Verify with live API in the background (for freshness)

## Benefits

- **Improved Reliability**: Content remains accessible even during WordPress API outages
- **Better Performance**: Local content loads instantly without network delays
- **Reduced API Load**: Fewer direct API calls to WordPress servers
- **Offline Support**: Core content functionality works without active internet connection
- **Seamless Degradation**: Users experience no interruption when backend services have issues

## Implementation Details

The fallback system is implemented across several key files:

- `client/src/lib/wordpress-sync.ts`: Auto-sync service
- `client/src/lib/wordpress-api.ts`: API interface with fallback logic
- `client/src/App.tsx`: Service initialization

## Debugging

API and synchronization activity is logged in the browser console with the `[WordPress]` prefix for easy filtering and debugging.