import React, { useEffect } from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

/**
 * 504 Error Page - Gateway Timeout
 * 
 * A simplified 504 page that doesn't use hooks that could cause ordering issues.
 * This component can be safely rendered at any point in the component tree.
 */
export default function GatewayTimeout504() {
  // Set page title and meta description
  useEffect(() => {
    document.title = "504 - Gateway Timeout | Horror Stories";
    
    // Find the description meta tag, or create one if it doesn't exist
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', "Our servers are taking too long to respond.");
    
    return () => {
      document.title = "Horror Stories";
    };
  }, []);
  
  return (
    <SimplifiedErrorPage
      statusCode={504}
      title="Gateway Timeout"
      message="It was working fine... until you arrived. Our server has gone dark."
      actionText="Try Again"
      actionLink="/"
    />
  );
}