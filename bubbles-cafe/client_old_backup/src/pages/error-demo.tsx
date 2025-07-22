import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ErrorPage from '@/components/ui/error-page';
import { useLoading } from '@/components/GlobalLoadingProvider';

/**
 * Error Demo Page
 * 
 * This page demonstrates the error page with eyeball loader
 * and the loading screen separately.
 */
const ErrorDemoPage: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  
  const toggleError = () => {
    setShowError(!showError);
  };
  
  const simulateLoading = () => {
    showLoading();
    setTimeout(() => {
      hideLoading();
    }, 3000);
  };

  if (showError) {
    return (
      <ErrorPage
        title="Test Error Page"
        message="This is a test error page with the eyeball loader. The eyeball loader is completely separate from the loading context."
        showDetails={false}
        onRetry={() => setShowError(false)}
      />
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Error and Loading Demos</h1>
      
      <div className="space-y-8">
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Error Page with Eyeball Loader</h2>
          <p className="mb-4">
            Click the button below to show the error page with the eyeball loader.
            This demonstrates how the eyeball loader appears on error pages.
          </p>
          <Button onClick={toggleError} variant="destructive">
            Show Error Page
          </Button>
        </div>
        
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Global Loading Screen</h2>
          <p className="mb-4">
            Click the button below to trigger the global loading screen for 3 seconds.
            This demonstrates the loading context functionality.
          </p>
          <Button onClick={simulateLoading}>
            Show Loading Screen (3s)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDemoPage;