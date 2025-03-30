import React from 'react';
import { useLocation } from 'wouter';
import { FeedbackButton } from './FeedbackButton';

/**
 * ConditionalFeedbackButton
 * 
 * A wrapper around FeedbackButton that only renders the button on specific pages.
 * Only shows on the community page, not on index, reader, or other pages.
 */
export function ConditionalFeedbackButton() {
  // Get the current location directly with useLocation hook
  const [location] = useLocation();
  
  // Only show on community page
  const shouldShowFeedback = location.startsWith('/community');
  
  if (!shouldShowFeedback) {
    return null;
  }
  
  return <FeedbackButton />;
}