import React, { createContext, useContext } from 'react';
import { useRefreshController } from '@/hooks/use-refresh-controller';

// Define the context type
interface RefreshContextType {
  refresh: () => Promise<boolean | undefined>;
  isRefreshing: boolean;
  lastRefreshed: Date | null;
  getLastRefreshedText: () => string;
}

// Create the refresh context
const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

// Props for the RefreshProvider component
interface RefreshProviderProps {
  children: React.ReactNode;
  onBeforeRefresh?: () => Promise<void> | void;
  onAfterRefresh?: () => Promise<void> | void;
}

/**
 * Provider component for refresh functionality
 * Makes refresh methods available to the entire application
 */
export function RefreshProvider({ 
  children, 
  onBeforeRefresh,
  onAfterRefresh
}: RefreshProviderProps) {
  // Initialize the refresh controller
  const refreshController = useRefreshController({
    onBeforeRefresh,
    onAfterRefresh,
    shouldInvalidateQueries: true
  });

  return (
    <RefreshContext.Provider value={refreshController}>
      {children}
    </RefreshContext.Provider>
  );
}

/**
 * Hook to access the refresh functionality from any component
 */
export function useRefresh(): RefreshContextType {
  const context = useContext(RefreshContext);
  
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  
  return context;
}