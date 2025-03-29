/**
 * Loading Provider Component
 * 
 * This file contains the React component that provides loading functionality
 * to the application and renders the LoadingScreen when isLoading is true.
 */
import { createContext, useContext, useState, type ReactNode, useCallback } from "react";
import { LoadingScreen } from "../components/ui/loading-screen";

// Create a context for loading state
type LoadingContextType = {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  withLoading: <T,>(promise: Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: <T,>(promise: Promise<T>): Promise<T> => promise
});

export function useLoading() {
  return useContext(LoadingContext);
}

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = useCallback(() => {
    setIsLoading(true);
    document.body.classList.add('loading-active');
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    document.body.classList.remove('loading-active');
  }, []);

  const withLoading = useCallback(<T,>(promise: Promise<T>): Promise<T> => {
    showLoading();
    return promise
      .finally(() => {
        hideLoading();
      });
  }, [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, withLoading }}>
      {children}
      {isLoading && <LoadingScreen />}
    </LoadingContext.Provider>
  );
};