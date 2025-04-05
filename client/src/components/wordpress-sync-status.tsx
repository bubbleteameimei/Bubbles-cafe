import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircleIcon, CheckCircleIcon, RefreshCwIcon } from 'lucide-react';
import { forceSyncNow } from '../lib/wordpress-sync';
import { useAuth } from '../hooks/use-auth';

/**
 * Component to display the WordPress sync status to admin users
 * Shows appropriate messages based on the sync status stored in localStorage
 * Provides options to retry sync operations when they fail
 * Only visible to admin users
 */
export function WordPressSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { user } = useAuth();
  
  // If user is not an admin, don't render anything
  if (!user?.isAdmin) {
    return null;
  }
  
  useEffect(() => {
    // Check for sync status in localStorage
    const checkSyncStatus = () => {
      try {
        const statusData = localStorage.getItem('wp_sync_status');
        if (!statusData) return;
        
        const parsedStatus = JSON.parse(statusData);
        
        // Only show recent status messages (within the last 5 minutes)
        const now = Date.now();
        if (now - parsedStatus.timestamp < 5 * 60 * 1000) {
          setSyncStatus(parsedStatus);
        } else {
          // Clear old status
          setSyncStatus(null);
        }
      } catch (error) {
        console.error('[WordPress] Error checking sync status:', error);
      }
    };
    
    // Check immediately
    checkSyncStatus();
    
    // Set up interval to check periodically
    const intervalId = setInterval(checkSyncStatus, 10000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Handle manual retry of sync operations
  const handleRetry = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    try {
      await forceSyncNow();
      // Note: We don't need to manually update the status here since
      // forceSyncNow will update localStorage, which our effect will detect
    } catch (error) {
      console.error('[WordPress] Manual sync retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Don't render anything if no status or if status is success and not retrying
  if ((!syncStatus || syncStatus.status === 'success') && !isRetrying) {
    return null;
  }

  // Determine appropriate styling based on status type
  // Only 'default' and 'destructive' variants are available in our Alert component
  const getAlertVariant = () => {
    // During retry operations, use default styling
    if (isRetrying) return 'default';
    return syncStatus?.status === 'error' ? 'destructive' : 'default';
  };

  // Get appropriate icon based on status type
  const getIcon = () => {
    // During retry operations, show the refresh icon
    if (isRetrying) return <RefreshCwIcon className="h-4 w-4 animate-spin" />;
    
    switch (syncStatus?.status) {
      case 'error':
        return <AlertCircleIcon className="h-4 w-4" />;
      case 'warning':
        return <InfoIcon className="h-4 w-4" />;
      case 'success':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <InfoIcon className="h-4 w-4" />;
    }
  };

  // Action button based on status type
  const getActionButton = () => {
    if (isRetrying) return null;
    
    const showRetryButton = 
      syncStatus?.type === 'complete_failure' || 
      syncStatus?.type === 'api_check_error' ||
      syncStatus?.type === 'sync_error' ||
      syncStatus?.type === 'timeout';
    
    if (showRetryButton) {
      return (
        <button 
          className="ml-2 underline text-xs inline-flex items-center"
          onClick={handleRetry}
          disabled={isRetrying}
        >
          <RefreshCwIcon className="h-3 w-3 mr-1" /> Retry sync
        </button>
      );
    }
    
    return null;
  };

  return (
    <Alert 
      variant={getAlertVariant()} 
      className="max-w-lg mx-auto mt-4 mb-2 text-sm"
    >
      <div className="flex items-center gap-2">
        {getIcon()}
        <AlertTitle>Admin: Content Sync Status</AlertTitle>
      </div>
      <AlertDescription>
        {isRetrying ? 'Syncing content from WordPress...' : syncStatus?.message}
        {getActionButton()}
        <div className="text-xs opacity-75 mt-1">This notification is only visible to administrators</div>
      </AlertDescription>
    </Alert>
  );
}