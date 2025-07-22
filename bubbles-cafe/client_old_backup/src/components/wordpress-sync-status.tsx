import { useEffect, useState, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  InfoIcon, 
  AlertCircleIcon, 
  CheckCircleIcon, 
  RefreshCwIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  DatabaseIcon,
  HistoryIcon,
  BadgeInfoIcon,
  BookOpenIcon
} from 'lucide-react';
import { forceSyncNow } from '../lib/wordpress-sync';
import { useAuth } from '../hooks/use-auth';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

// Type definitions for status and history entries
interface SyncStatusEntry {
  status: string;
  type: string;
  message: string;
  timestamp: number;
  apiAvailable?: boolean;
  syncTime?: number;
  postsCount?: number;
  retryCount?: number;
  errorDetails?: string;
  errorType?: string;
  recordedAt?: number;
}

/**
 * Component to display the WordPress sync status to admin users
 * Shows appropriate messages based on the sync status stored in localStorage
 * Provides options to retry sync operations when they fail
 * Only visible to admin users
 * 
 * Enhanced with:
 * - Detailed sync statistics
 * - Visual health indicators
 * - Sync history tracking
 * - Advanced UI with expandable sections
 */
export function WordPressSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusEntry | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncHistory, setSyncHistory] = useState<SyncStatusEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    // Function to check and update sync status from localStorage
    const checkSyncStatus = () => {
      try {
        // Get current status from localStorage
        const statusData = localStorage.getItem('wp_sync_status');
        if (!statusData) return;
        
        const parsedStatus = JSON.parse(statusData) as SyncStatusEntry;
        
        // Get sync history from localStorage
        const historyData = localStorage.getItem('wp_sync_history');
        let history: SyncStatusEntry[] = [];
        
        if (historyData) {
          try {
            history = JSON.parse(historyData);
            if (history.length > 10) {
              history = history.slice(0, 10);
            }
          } catch (e) {
            console.error('[WordPress] Error parsing sync history:', e);
            history = [];
          }
        }
        
        // Only show recent status messages (within the last 5 minutes)
        const now = Date.now();
        if (now - parsedStatus.timestamp < 5 * 60 * 1000) {
          setSyncStatus(parsedStatus);
          setSyncHistory(history);
        } else {
          // Status is too old, clear it
          setSyncStatus(null);
          setSyncHistory(history);
        }
      } catch (error) {
        console.error('[WordPress] Error checking sync status:', error);
      }
    };
    
    // Check immediately and set up interval
    checkSyncStatus();
    const intervalId = setInterval(checkSyncStatus, 10000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []); // No dependencies to avoid re-running effect when status changes
  
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

  // Format timestamp helper
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'Unknown time';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };
  
  // Only admin users can see this component
  if (!user?.isAdmin) {
    return null;
  }
  
  // Don't render anything if no status or if status is success and not retrying
  if ((!syncStatus || syncStatus.status === 'success') && !isRetrying) {
    return null;
  }
  
  // Alert variant based on status
  const alertVariant = isRetrying ? 'default' : 
    syncStatus?.status === 'error' ? 'destructive' : 'default';
  
  // Status icon based on status
  const statusIcon = isRetrying ? (
    <RefreshCwIcon className="h-4 w-4 animate-spin" />
  ) : syncStatus?.status === 'error' ? (
    <AlertCircleIcon className="h-4 w-4" />
  ) : syncStatus?.status === 'warning' ? (
    <InfoIcon className="h-4 w-4" />
  ) : syncStatus?.status === 'success' ? (
    <CheckCircleIcon className="h-4 w-4" />
  ) : (
    <InfoIcon className="h-4 w-4" />
  );
  
  // Health badge component
  const healthBadge = isRetrying ? (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
      <RefreshCwIcon className="h-3 w-3 mr-1 animate-spin" /> Syncing
    </Badge>
  ) : syncStatus?.status === 'error' ? (
    <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
      <AlertCircleIcon className="h-3 w-3 mr-1" /> Error
    </Badge>
  ) : syncStatus?.status === 'warning' ? (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
      <InfoIcon className="h-3 w-3 mr-1" /> Warning
    </Badge>
  ) : syncStatus?.status === 'success' ? (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
      <CheckCircleIcon className="h-3 w-3 mr-1" /> Healthy
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
      <InfoIcon className="h-3 w-3 mr-1" /> Unknown
    </Badge>
  );
  
  // Action button based on status type
  const actionButton = isRetrying ? null : (
    (syncStatus?.type === 'complete_failure' || 
     syncStatus?.type === 'api_check_error' ||
     syncStatus?.type === 'sync_error' ||
     syncStatus?.type === 'timeout') ? (
      <button 
        className="ml-2 underline text-xs inline-flex items-center"
        onClick={handleRetry}
        disabled={isRetrying}
      >
        <RefreshCwIcon className="h-3 w-3 mr-1" /> Retry sync
      </button>
    ) : null
  );
  
  // Sync statistics display
  const syncStats = () => {
    const stats = {
      lastSync: syncStatus?.timestamp,
      postsCount: syncStatus?.postsCount || 0,
      totalTime: syncStatus?.syncTime || 0,
      retryCount: syncStatus?.retryCount || 0,
      apiStatus: syncStatus?.apiAvailable ? 'Available' : 'Unavailable'
    };

    return (
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3 text-gray-500" />
          <span className="text-gray-700 dark:text-gray-300">Last Sync:</span>
          <span className="ml-auto">{formatTime(stats.lastSync)}</span>
        </div>
        <div className="flex items-center gap-1">
          <BookOpenIcon className="h-3 w-3 text-gray-500" />
          <span className="text-gray-700 dark:text-gray-300">Posts:</span>
          <span className="ml-auto">{stats.postsCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <DatabaseIcon className="h-3 w-3 text-gray-500" />
          <span className="text-gray-700 dark:text-gray-300">API Status:</span>
          <span className="ml-auto">
            {stats.apiStatus === 'Available' ? (
              <span className="text-green-600 dark:text-green-400">Available</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">Unavailable</span>
            )}
          </span>
        </div>
        {stats.retryCount > 0 && (
          <div className="flex items-center gap-1">
            <RefreshCwIcon className="h-3 w-3 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">Retries:</span>
            <span className="ml-auto">{stats.retryCount}</span>
          </div>
        )}
        {stats.totalTime > 0 && (
          <div className="flex items-center gap-1 col-span-2">
            <ClockIcon className="h-3 w-3 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">Sync Time:</span>
            <span className="ml-auto">{stats.totalTime}ms</span>
          </div>
        )}
      </div>
    );
  };
  
  // Sync history display
  const renderHistory = () => {
    if (syncHistory.length === 0) {
      return (
        <div className="text-xs text-gray-500 italic mt-2">
          No sync history available
        </div>
      );
    }

    return (
      <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-2">
        <div className="text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
          Recent Sync Activity
        </div>
        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {syncHistory.map((item, index) => (
            <div 
              key={index} 
              className={`text-xs p-1 rounded flex items-start gap-1 ${
                item.status === 'error' 
                  ? 'bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300' 
                  : item.status === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300'
                    : 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="mt-0.5">
                {item.status === 'error' ? (
                  <AlertCircleIcon className="h-3 w-3" />
                ) : item.status === 'warning' ? (
                  <InfoIcon className="h-3 w-3" />
                ) : (
                  <CheckCircleIcon className="h-3 w-3" />
                )}
              </div>
              <div>
                <div className="leading-tight">{item.message}</div>
                <div className="text-xs opacity-80">{formatTime(item.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main render
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="max-w-lg mx-auto mt-4 mb-2 text-sm"
    >
      <Alert 
        variant={alertVariant}
        className={`${isExpanded ? 'rounded-b-none border-b-0' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusIcon}
            <AlertTitle className="flex items-center gap-2">
              Admin: Content Sync Status
              <div className="ml-2">{healthBadge}</div>
            </AlertTitle>
          </div>
          <CollapsibleTrigger asChild>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="h-7 w-7 rounded hover:bg-black/5 dark:hover:bg-white/10 inline-flex items-center justify-center">
                    {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{isExpanded ? 'Hide' : 'Show'} details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CollapsibleTrigger>
        </div>
        <AlertDescription>
          <div>{isRetrying ? 'Syncing content from WordPress...' : syncStatus?.message}</div>
          {actionButton}
          <div className="text-xs opacity-75 mt-1">This notification is only visible to administrators</div>
          <CollapsibleContent>
            {syncStats()}
            <div className="mt-3 flex justify-between">
              <button 
                className="text-xs inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                onClick={() => setShowHistory(!showHistory)}
              >
                <HistoryIcon className="h-3 w-3 mr-1" />
                {showHistory ? 'Hide history' : 'Show history'}
              </button>
              <button 
                className="text-xs inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                <RefreshCwIcon className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                Force sync now
              </button>
            </div>
            {showHistory && renderHistory()}
          </CollapsibleContent>
        </AlertDescription>
      </Alert>
      {isExpanded && (
        <div className="text-center text-xs bg-gray-50 dark:bg-gray-900 border border-t-0 border-gray-200 dark:border-gray-800 p-1.5 rounded-b-md">
          <BadgeInfoIcon className="h-3 w-3 inline mr-1 text-gray-500" />
          <span className="text-gray-500">WordPress sync runs automatically every 5 minutes</span>
        </div>
      )}
    </Collapsible>
  );
}