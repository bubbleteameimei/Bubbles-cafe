
import React, { createContext, useContext, useState, useEffect } from 'react';

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

// Hook to use the loading overlay
export function useGlobalLoadingOverlay() {
  return useContext(GlobalLoadingContext);
}

// Provider component
export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const showLoadingOverlay = () => {
    console.log('[GlobalLoading] Showing loading overlay');
    setIsLoading(true);
    // Prevent scrolling when loading
    document.body.classList.add('loading-active');
  };

  const hideLoadingOverlay = () => {
    console.log('[GlobalLoading] Hiding loading overlay');
    setIsLoading(false);
    // Re-enable scrolling
    document.body.classList.remove('loading-active');
  };

  const setMessage = (message: string) => {
    console.log('[GlobalLoading] Setting message:', message);
    setLoadingMessage(message);
  };

  return (
    <GlobalLoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        showLoadingOverlay,
        hideLoadingOverlay,
        setLoadingMessage: setMessage,
      }}
    >
      {children}
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            {/* Loading Text with Megrim Font */}
            <div className="eden-loading-content flex gap-1">
              <span>L</span>
              <span>O</span>
              <span>A</span>
              <span>D</span>
              <span>I</span>
              <span>N</span>
              <span>G</span>
            </div>
            
            {/* Loading Message */}
            {loadingMessage && (
              <div className="text-white/70 text-sm font-medium">
                {loadingMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
}

// Default export
export default {
  useGlobalLoadingOverlay,
  GlobalLoadingProvider
};
