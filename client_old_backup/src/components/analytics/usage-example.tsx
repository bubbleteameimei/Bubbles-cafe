import React from 'react';
import { AnalyticsWrapper } from './AnalyticsWrapper';
import { useCookieCategory } from '@/hooks/use-cookie-category';

/**
 * Example of how to use the AnalyticsWrapper component
 * This is just for demonstration purposes, not an actual component to use in the app
 */
export function AnalyticsExample() {
  return (
    <div>
      <h1>Regular Page Content</h1>

      {/* Track a page view */}
      <AnalyticsWrapper 
        eventName="page_view" 
        eventData={{ 
          page: "example-page",
          referrer: document.referrer  
        }}
      >
        <div>
          <p>This content is wrapped in an analytics tracker.</p>
          <p>Analytics events will only be fired if the user has consented to analytics cookies.</p>
        </div>
      </AnalyticsWrapper>

      {/* Track a specific user interaction */}
      <AnalyticsWrapper 
        eventName="button_click" 
        eventData={{ 
          buttonId: "sign-up",
          location: "hero-section"  
        }}
      >
        <button 
          className="px-4 py-2 bg-primary text-white rounded"
          onClick={() => console.log("Button clicked")}
        >
          Sign Up
        </button>
      </AnalyticsWrapper>
    </div>
  );
}

/**
 * Example usage of the cookie category hook directly
 */
export function CookieCategoryExample() {
  // Use the hook inside your component
  const { isAllowed, runIfAllowed } = useCookieCategory();

  const handleButtonClick = () => {
    // Run marketing-related code only if marketing cookies are allowed
    runIfAllowed('marketing', () => {
      console.log("Marketing tracking code executed");
      // Actual implementation would send data to marketing tools
    });

    // Always run this code regardless of cookie consent
    console.log("Button clicked - basic functionality");
  };

  return (
    <div>
      <h2>Cookie Category Example</h2>
      
      {/* Conditional rendering based on cookie category consent */}
      {isAllowed('analytics') ? (
        <p>Analytics are enabled. Thank you for helping us improve!</p>
      ) : (
        <p>Analytics are disabled. Enable them in privacy settings to help us improve.</p>
      )}
      
      <button onClick={handleButtonClick} className="px-4 py-2 bg-primary text-white rounded">
        Click Me
      </button>
      
      {/* The marketing features will only be visible if marketing cookies are allowed */}
      {isAllowed('marketing') && (
        <div className="mt-4 p-4 bg-muted rounded">
          <h3>Personalized Recommendations</h3>
          <p>Based on your interests, we think you might like these stories...</p>
        </div>
      )}
    </div>
  );
}