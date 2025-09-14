
/**
 * Empty GlobalLoadingOverlay
 * All loading is now handled by the main LoadingScreen component
 */
import React, { createContext, useContext } from 'react';

// Define the context type
interface GlobalLoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoadingOverlay: () => void;
  hideLoadingOverlay: () => void;
  setLoadingMessage: (message: string) => void;
}

// Create the context with default values
const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
  isLoading: false,
  loadingMessage: '',
  showLoadingOverlay: () => {},
  hideLoadingOverlay: () => {},
  setLoadingMessage: () => {},
});

// No-op hook
export function useGlobalLoadingOverlay() {
  return useContext(GlobalLoadingContext);
}

// Empty provider that just renders children
export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Default export
export default {
  useGlobalLoadingOverlay,
  GlobalLoadingProvider
};
