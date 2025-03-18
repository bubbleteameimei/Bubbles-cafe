import React, { useEffect } from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

/**
 * 429 Error Page - Too Many Requests
 * 
 * A simplified 429 page that doesn't use hooks that could cause ordering issues.
 * This component can be safely rendered at any point in the component tree.
 */
export default function TooManyRequests429() {
  // Set page title and meta description
  useEffect(() => {
    document.title = "429 - Too Many Requests | Horror Stories";
    
    // Find the description meta tag, or create one if it doesn't exist
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', "You have sent too many requests in a short period of time.");
    
    return () => {
      document.title = "Horror Stories";
    };
  }, []);
  
  return (
    <SimplifiedErrorPage
      statusCode={429}
      title="Too Many Requests"
      message="You're asking for too much. The darkness needs time to respond..."
      actionText="Return to Safety"
      actionLink="/"
    />
  );
}