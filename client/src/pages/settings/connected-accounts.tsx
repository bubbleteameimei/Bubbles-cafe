import React, { useEffect } from 'react';
import SimplifiedErrorPage from '@/components/errors/SimplifiedErrorPage';

export default function ConnectedAccountsPage() {
  // This page is intentionally an error page (feature unavailable)
  useEffect(() => {
    document.title = '503 - Service Unavailable | Bubble’s Cafe';
  }, []);

  return (
    <SimplifiedErrorPage
      statusCode={503}
      title="Service Unavailable"
      message="Connected accounts are not available right now. Please check back later."
      actionText="Go Home"
      actionLink="/"
    />
  );
}