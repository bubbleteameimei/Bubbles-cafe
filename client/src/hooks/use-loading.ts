/**
 * No-op loading hook placeholder.
 * Global loading screens have been removed; this returns stubbed functions.
 */
export type LoadingContextType = {
  isLoading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
  setLoadingMessage: (message: string) => void;
  suppressSkeletons: boolean;
};

export function useLoading(): LoadingContextType {
  const withLoading = <T,>(promise: Promise<T>): Promise<T> => promise;
  return {
    isLoading: false,
    showLoading: () => {},
    hideLoading: () => {},
    withLoading,
    setLoadingMessage: () => {},
    suppressSkeletons: false,
  };
}

export default useLoading;