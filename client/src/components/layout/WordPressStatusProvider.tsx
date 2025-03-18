import { useEffect } from 'react';
import { WordPressApiProvider, useWordPressApi } from '@/contexts/WordPressApiContext';
import { FallbackIndicator } from '@/components/ui/FallbackIndicator';
import { useToast } from '@/hooks/use-toast';

interface StatusMonitorProps {
  showNotifications?: boolean;
}

// Internal component that uses the context
function StatusMonitor({ showNotifications = true }: StatusMonitorProps) {
  const { status, errorType, checkApiStatus, isUnavailable } = useWordPressApi();
  const { toast } = useToast();
  
  // Show a toast notification when status changes
  useEffect(() => {
    if (showNotifications) {
      if (isUnavailable) {
        toast({
          title: "Connection Issue",
          description: "WordPress connection unavailable. Using local content.",
          variant: "destructive",
          duration: 5000
        });
      }
    }
  }, [isUnavailable, showNotifications, toast]);

  return (
    <FallbackIndicator 
      apiStatus={status} 
      errorType={errorType} 
      onRetryConnection={checkApiStatus} 
    />
  );
}

// Main wrapper component
interface WordPressStatusWrapperProps {
  children: React.ReactNode;
  showNotifications?: boolean;
  showIndicator?: boolean;
}

export function WordPressStatusWrapper({ 
  children, 
  showNotifications = true,
  showIndicator = true
}: WordPressStatusWrapperProps) {
  return (
    <WordPressApiProvider>
      {showIndicator && <StatusMonitor showNotifications={showNotifications} />}
      {children}
    </WordPressApiProvider>
  );
}