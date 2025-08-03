import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoadingOverlay: (message?: string) => void;
  hideLoadingOverlay: () => void;
  setLoadingMessage: (message: string) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
  isLoading: false,
  loadingMessage: '',
  showLoadingOverlay: () => {},
  hideLoadingOverlay: () => {},
  setLoadingMessage: () => {},
});

export function useGlobalLoadingOverlay() {
  return useContext(GlobalLoadingContext);
}

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showLoadingOverlay = useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoadingOverlay = useCallback(() => {
    setIsLoading(false);
  }, []);

  const contextValue = {
    isLoading,
    loadingMessage,
    showLoadingOverlay,
    hideLoadingOverlay,
    setLoadingMessage,
  };

  return (
    <GlobalLoadingContext.Provider value={contextValue}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-card border rounded-lg p-6 shadow-lg max-w-sm mx-4"
            >
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <div>
                  <p className="font-medium">{loadingMessage}</p>
                  <p className="text-sm text-muted-foreground">Please wait...</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlobalLoadingContext.Provider>
  );
}