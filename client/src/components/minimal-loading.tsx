import { createContext, useContext } from "react";

/**
 * Empty Loading Implementation
 * 
 * This file provides a completely empty implementation of the loading system
 * without any actual loading screens or functionality.
 */

type LoadingContextType = {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
});

// Empty hook that does nothing
export function useLoading() {
  return useContext(LoadingContext);
}

// Empty provider that just renders children
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// No-op global API functions
export const showLoading = () => {};
export const hideLoading = () => {};

export default { useLoading, LoadingProvider, showLoading, hideLoading };