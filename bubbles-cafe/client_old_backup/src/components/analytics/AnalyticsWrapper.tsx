import React, { useEffect, ReactNode } from 'react';
import { useCookieCategory } from '@/hooks/use-cookie-category';

interface AnalyticsWrapperProps {
  children: ReactNode;
  eventName?: string;
  eventData?: Record<string, any>;
}

/**
 * A wrapper component that conditionally tracks analytics events
 * based on user cookie consent settings
 */
export function AnalyticsWrapper({ 
  children, 
  eventName = 'view', 
  eventData = {} 
}: AnalyticsWrapperProps) {
  const { isAllowed, runIfAllowed } = useCookieCategory();

  useEffect(() => {
    // Only track this event if analytics cookies are allowed
    runIfAllowed('analytics', () => {
      // In a real implementation, this would call your analytics service
      console.log(`Analytics event tracked: ${eventName}`, eventData);
      
      // Example of sending to a hypothetical analytics service:
      // analyticsService.trackEvent(eventName, eventData);
    });
  }, [eventName, eventData, runIfAllowed]);

  // Performance tracking can still work if performance cookies are allowed
  useEffect(() => {
    runIfAllowed('performance', () => {
      // Track performance metrics if performance cookies are allowed
      const trackPerformance = () => {
        if (window.performance && 'getEntriesByType' in window.performance) {
          const performanceEntries = window.performance.getEntriesByType('navigation');
          
          console.log('Performance data tracked:', performanceEntries);
          // Send performance data to your performance monitoring service
        }
      };
      
      // Wait until the page is fully loaded
      if (document.readyState === 'complete') {
        trackPerformance();
      } else {
        window.addEventListener('load', trackPerformance);
        return () => window.removeEventListener('load', trackPerformance);
      }
    });
  }, [runIfAllowed]);

  return (
    <>
      {/* Optionally show a consent notice if analytics tracking is disabled */}
      {!isAllowed('analytics') && (
        <div className="hidden">
          {/* Hidden by default, but you could make this visible to encourage users to enable analytics */}
          {/* For example, a small notification that analytics are disabled */}
        </div>
      )}
      
      {/* Render the children regardless of analytics consent */}
      {children}
    </>
  );
}