# WordPress API Fallback System Documentation

## Overview
The WordPress API Fallback System provides robust content delivery even when the primary WordPress API is unavailable. It implements a multi-tiered approach to ensure content availability through:

1. Primary WordPress API integration
2. Secondary WordPress API endpoints
3. Local database fallback
4. Cached content retrieval
5. Status persistence across sessions

## Key Features

### Multi-Endpoint Checking
- Attempts connection to multiple WordPress endpoints
- Implements intelligent endpoint prioritization
- Provides automatic failover between endpoints

### Intelligent Caching System
- Stores successful WordPress responses in localStorage
- Implements time-based cache expiration
- Manages different cache invalidation strategies per content type

### Status Persistence
- Maintains API connection status across page loads and sessions
- Implements localStorage-based status tracking
- Provides visual indicators of fallback status to users

### Comprehensive Error Categorization
- Differentiates between various WordPress API error types:
  - Network timeouts
  - CORS errors
  - Authentication failures
  - Rate limiting issues
  - Parse errors

### User Experience Enhancements
- Themed fallback UI consistent with horror styling
- Clear user messaging about connection status
- Manual reconnection capability

## Technical Implementation

### API Status Check
```typescript
export async function checkWordPressAPIStatus(): Promise<boolean> {
  try {
    const cachedStatus = localStorage.getItem('wordpressApiStatus');
    if (cachedStatus) {
      const { status, timestamp } = JSON.parse(cachedStatus);
      // Use cached status if less than 5 minutes old
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return status === 'available';
      }
    }
    
    // Try multiple endpoints for better reliability
    const endpoints = [
      '/wp/v2/posts?per_page=1',
      '/wp/v2/pages?per_page=1',
      '/wp/v2/categories?per_page=1'
    ];
    
    for (const endpoint of endpoints) {
      const response = await fetch(`${WORDPRESS_API_URL}${endpoint}`);
      if (response.ok) {
        localStorage.setItem('wordpressApiStatus', JSON.stringify({
          status: 'available',
          timestamp: Date.now()
        }));
        return true;
      }
    }
    
    localStorage.setItem('wordpressApiStatus', JSON.stringify({
      status: 'unavailable',
      timestamp: Date.now()
    }));
    return false;
  } catch (error) {
    localStorage.setItem('wordpressApiStatus', JSON.stringify({
      status: 'unavailable',
      timestamp: Date.now(),
      error: error.message
    }));
    return false;
  }
}
```

### Error Categorization Logic
```typescript
export function categorizeWordPressError(error: any): WordPressErrorType {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorDetails = error?.toString().toLowerCase() || '';
  
  if (errorMessage.includes('timeout') || errorDetails.includes('timeout')) {
    return 'timeout';
  }
  
  if (errorMessage.includes('cors') || errorDetails.includes('cors') || 
      errorMessage.includes('origin') || errorDetails.includes('access-control')) {
    return 'cors';
  }
  
  if (errorMessage.includes('json') || errorDetails.includes('json') || 
      errorMessage.includes('parse') || errorDetails.includes('syntax')) {
    return 'parse';
  }
  
  if (errorMessage.includes('authentication') || errorDetails.includes('auth') ||
      errorMessage.includes('401') || errorDetails.includes('unauthorized')) {
    return 'authentication';
  }
  
  if (errorMessage.includes('rate') || errorDetails.includes('limit') ||
      errorMessage.includes('429') || errorDetails.includes('too many requests')) {
    return 'rate_limit';
  }
  
  return 'unknown';
}
```

### WordPress Rate Limits
- Analytics Endpoints: 200 requests per minute
- General API Endpoints: 50 requests per 15 minutes
- Authentication Endpoints: 5 requests per 15 minutes

## User Interface Elements

### Fallback Mode Indicator
- Toast notification when fallback mode is activated
- Persistence indicator in UI for continued fallback status
- Different visual styling for fallback content vs. regular content

### Reconnection Controls
- Manual reconnection button
- Automatic reconnection attempts at configurable intervals
- Clear feedback on reconnection success/failure

## Future Enhancements
- Implement offline mode with Service Worker
- Add differential sync for content updates
- Extend caching strategies for media content
- Implement user preference for fallback behavior