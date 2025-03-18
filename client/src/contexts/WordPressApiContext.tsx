import { createContext, useContext, ReactNode } from 'react';
import { useWordPressApiStatus, WordPressApiStatus, WordPressErrorType } from '@/hooks/use-wordpress-api-status';

interface WordPressApiContextType {
  status: WordPressApiStatus;
  errorType?: WordPressErrorType;
  lastChecked: number;
  checkApiStatus: () => Promise<boolean>;
  isAvailable: boolean;
  isChecking: boolean;
  isUnavailable: boolean;
}

const WordPressApiContext = createContext<WordPressApiContextType | undefined>(undefined);

export function WordPressApiProvider({ children }: { children: ReactNode }) {
  const { status, errorType, lastChecked, checkApiStatus } = useWordPressApiStatus();
  
  const value: WordPressApiContextType = {
    status,
    errorType,
    lastChecked,
    checkApiStatus,
    isAvailable: status === 'available',
    isChecking: status === 'checking',
    isUnavailable: status === 'unavailable'
  };
  
  return (
    <WordPressApiContext.Provider value={value}>
      {children}
      {status === 'unavailable' && (
        <div className="wordpress-fallback-active" data-error-type={errorType} />
      )}
    </WordPressApiContext.Provider>
  );
}

export function useWordPressApi() {
  const context = useContext(WordPressApiContext);
  
  if (context === undefined) {
    throw new Error('useWordPressApi must be used within a WordPressApiProvider');
  }
  
  return context;
}