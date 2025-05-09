import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AlertCircle, Database, WifiOff } from 'lucide-react';

export function DbStatusIndicator() {
  const [showStatus, setShowStatus] = useState(false);
  
  // Query the database status endpoint
  const { data, error } = useQuery({
    queryKey: ['system', 'database-status'],
    queryFn: async () => {
      const response = await fetch('/api/system/database-status');
      if (!response.ok) {
        throw new Error('Failed to fetch database status');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 1, // Only retry once
  });
  
  // Determine status
  const status = data?.status || (error ? 'error' : 'loading');
  const isDisabled = status === 'endpoint_disabled';
  
  // Show indicator if database is disabled or there's an error
  useEffect(() => {
    if (isDisabled || status === 'error') {
      setShowStatus(true);
    }
  }, [isDisabled, status]);
  
  // Always show the indicator for testing purposes
  // Later we'll restore: if (!showStatus || status === 'connected') return null;
  
  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 p-3 shadow-lg rounded-lg text-sm flex items-center gap-2 max-w-xs
        ${isDisabled 
          ? 'bg-amber-900/80 text-amber-50 border border-amber-600' 
          : 'bg-red-900/80 text-red-50 border border-red-600'
        } backdrop-blur-sm`}
    >
      {isDisabled ? (
        <>
          <WifiOff size={16} className="text-amber-400" />
          <div>
            <p className="font-semibold">Limited Mode Active</p>
            <p className="text-xs opacity-90">Database temporarily unavailable</p>
          </div>
        </>
      ) : (
        <>
          <AlertCircle size={16} className="text-red-400" />
          <div>
            <p className="font-semibold">Connection Error</p>
            <p className="text-xs opacity-90">Unable to connect to the database</p>
          </div>
        </>
      )}
      
      <button 
        onClick={() => setShowStatus(false)} 
        className="ml-auto text-xs opacity-80 hover:opacity-100"
      >
        Dismiss
      </button>
    </div>
  );
}