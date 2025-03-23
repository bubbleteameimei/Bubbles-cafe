import React, { useEffect } from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

/**
 * 500 Error Page - Internal Server Error
 * 
 * A simplified 500 page that doesn't use hooks that could cause ordering issues.
 * This component can be safely rendered at any point in the component tree.
 */
export default function InternalServerError500() {
  // Set page title and meta description
  useEffect(() => {
    document.title = "500 - Internal Server Error | Horror Stories";
    
    // Find the description meta tag, or create one if it doesn't exist
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', "Something went wrong with our server.");
    
    return () => {
      document.title = "Horror Stories";
    };
  }, []);
  
  return (
    <SimplifiedErrorPage
      statusCode={500}
      title="Internal Server Error"
      message="What did you do? Something has gone terribly wrong on our server."
      actionText="Return to Safety"
      actionLink="/"
    />
  );
}