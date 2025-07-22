import React, { useEffect } from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

/**
 * 503 Error Page - Service Unavailable
 * 
 * A simplified 503 page that doesn't use hooks that could cause ordering issues.
 * This component can be safely rendered at any point in the component tree.
 */
export default function ServiceUnavailable503() {
  // Set page title and meta description
  useEffect(() => {
    document.title = "503 - Service Unavailable | Horror Stories";
    
    // Find the description meta tag, or create one if it doesn't exist
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', "Our service is temporarily unavailable.");
    
    return () => {
      document.title = "Horror Stories";
    };
  }, []);
  
  return (
    <SimplifiedErrorPage
      statusCode={503}
      title="Service Unavailable"
      message="The system is... busy with something else. Something darker perhaps."
      actionText="Try Again Later"
      actionLink="/"
    />
  );
}