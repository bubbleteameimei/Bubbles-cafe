import { useState, useEffect } from 'react';
import { XCircle, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FallbackIndicatorProps {
  apiStatus: 'available' | 'unavailable' | 'checking';
  errorType?: 'timeout' | 'cors' | 'parse' | 'authentication' | 'rate_limit' | 'unknown';
  onRetryConnection: () => Promise<boolean>;
}

export function FallbackIndicator({ 
  apiStatus, 
  errorType, 
  onRetryConnection 
}: FallbackIndicatorProps) {
  const [isVisible, setIsVisible] = useState(apiStatus === 'unavailable');
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(apiStatus === 'unavailable');
  }, [apiStatus]);

  // Don't render if the API is available
  if (!isVisible) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const result = await onRetryConnection();
      if (result) {
        toast({
          title: "Connection Restored",
          description: "Successfully reconnected to WordPress API.",
          variant: "success",
          duration: 3000
        });
        setIsVisible(false);
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to reconnect to WordPress API. Using local content.",
          variant: "destructive",
          duration: 4000
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Connection Error",
        description: `Error reconnecting: ${errorMessage}`,
        variant: "destructive",
        duration: 4000
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case 'timeout':
        return "Connection to WordPress timed out.";
      case 'cors':
        return "Cross-origin request blocked.";
      case 'parse':
        return "Unable to parse WordPress data.";
      case 'authentication':
        return "Authentication error with WordPress.";
      case 'rate_limit':
        return "WordPress API rate limit exceeded.";
      default:
        return "WordPress connection unavailable.";
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 text-amber-50 p-3 shadow-md border-b border-amber-900 animate-fadeIn">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <span className="font-creepster text-lg">
            Tales from the Archive
          </span>
          <span className="text-sm ml-2 font-special-elite">
            {getErrorMessage()}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-3 py-1 text-xs rounded-sm bg-amber-900 hover:bg-amber-800 text-amber-50 font-special-elite flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRetrying ? (
              <>
                <RefreshCcw className="h-3 w-3 animate-spin" />
                Reconnecting...
              </>
            ) : (
              <>
                <RefreshCcw className="h-3 w-3" />
                Reconnect
              </>
            )}
          </button>
          <button
            onClick={() => setIsVisible(false)} 
            className="p-1 rounded-sm hover:bg-amber-900/40 transition-colors"
            aria-label="Dismiss"
          >
            <XCircle className="h-4 w-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}