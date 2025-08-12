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
      return true;
    }, () => false);
    return () => {};
  }, [eventName, eventData, runIfAllowed]);

  // Performance tracking can still work if performance cookies are allowed
  useEffect(() => {
    let remove: (() => void) | undefined;
    runIfAllowed('performance', () => {
      // Track performance metrics if performance cookies are allowed
      const trackPerformance = () => {
        if (window.performance && 'getEntriesByType' in window.performance) {
          const performanceEntries = window.performance.getEntriesByType('navigation');
          console.log('Performance data tracked:', performanceEntries);
        }
      };
      if (document.readyState === 'complete') {
        trackPerformance();
      } else {
        window.addEventListener('load', trackPerformance);
        remove = () => window.removeEventListener('load', trackPerformance);
      }
      return true;
    }, () => false);
    return () => { if (remove) remove(); };
  }, [runIfAllowed]);

  return (
    <>
      {!isAllowed('analytics') && (
        <div className="hidden" />
      )}
      {children}
    </>
  );
}