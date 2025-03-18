import React, { useEffect } from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

/**
 * 403 Error Page - Forbidden Access
 * 
 * A simplified 403 page that doesn't use hooks that could cause ordering issues.
 * This component can be safely rendered at any point in the component tree.
 */
export default function Forbidden403() {
  // Set page title and meta description
  useEffect(() => {
    document.title = "403 - Forbidden | Horror Stories";
    
    // Find the description meta tag, or create one if it doesn't exist
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', "You don't have permission to access this page.");
    
    return () => {
      document.title = "Horror Stories";
    };
  }, []);
  
  return (
    <SimplifiedErrorPage
      statusCode={403}
      title="Forbidden"
      message="It's locked for a reason. Leave!"
      actionText="Return to Safety"
      actionLink="/"
    />
  );
}