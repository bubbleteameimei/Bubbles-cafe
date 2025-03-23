/**
 * Error Toast Provider
 * 
 * This component sets up the toast notification system for error handling.
 * It connects the standalone error handling utility with the React toast mechanism.
 */

import { useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { setToastHandler } from '../../lib/error-handler';

export default function ErrorToastProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  
  // Register the toast handler with our error utility
  useEffect(() => {
    setToastHandler(toast);
    
    return () => {
      // Reset to default when component unmounts
      setToastHandler(() => {
        console.warn('Toast handler not available - component unmounted');
      });
    };
  }, [toast]);
  
  // The provider doesn't render anything itself other than its children
  return <>{children}</>;
}