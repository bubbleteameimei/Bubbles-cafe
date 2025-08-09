import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface GlobalLoadingContextType {
  isLoading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  loadingMessage: string;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(GlobalLoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a GlobalLoadingProvider');
  }
  return context;
}

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const showLoading = useCallback((message = "Loading content...") => {
    setIsLoading(true);
    setLoadingMessage(message);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage("");
  }, []);

  return (
    <GlobalLoadingContext.Provider value={{ isLoading, showLoading, hideLoading, loadingMessage }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg flex items-center gap-3 max-w-sm mx-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{loadingMessage}</span>
              <span className="text-xs text-muted-foreground">Please wait a moment</span>
            </div>
          </div>
          {/* Screen reader announcement */}
          <div className="sr-only" role="status" aria-live="polite">
            {loadingMessage}
          </div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
}