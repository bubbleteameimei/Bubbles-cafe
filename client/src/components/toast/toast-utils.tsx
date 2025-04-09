import React from 'react';
import { ToastAction } from '@/components/ui/toast';
import { useToast, ToastVariant } from '@/hooks/use-toast';

// Re-export the type from use-toast for convenient access
export type { ToastVariant };

interface ActionToastOptions {
  title: string;
  description?: string;
  actionText: string;
  variant?: ToastVariant;
  onAction: () => void;
  duration?: number;
}

/**
 * A hook providing simplified access to toast functions
 */
export function useShowToast() {
  const { toast } = useToast();

  // Simple toast with just a message
  const simple = (message: string, variant: ToastVariant = 'default', duration?: number) => {
    return toast({
      title: message,
      variant,
      duration,
    });
  };

  // Success toast shorthand
  const success = (message: string, duration?: number) => {
    return toast({
      title: message,
      variant: 'success',
      duration,
    });
  };
  
  // Error toast shorthand
  const error = (message: string, duration?: number) => {
    return toast({
      title: message,
      variant: 'destructive',
      duration,
    });
  };

  // Toast with action button
  const withAction = ({ 
    title, 
    description, 
    actionText, 
    variant = 'default', 
    onAction,
    duration 
  }: ActionToastOptions) => {
    return toast({
      title,
      description,
      variant,
      duration,
      action: (
        <ToastAction altText={actionText} onClick={onAction}>
          {actionText}
        </ToastAction>
      ),
    });
  };

  return {
    simple,
    success,
    error,
    withAction,
  };
}

// Pre-defined toast messages for common scenarios
export const CommonToasts = {
  OFFLINE: {
    title: 'You\'re offline',
    description: 'Some features may be unavailable while offline',
    variant: 'destructive' as ToastVariant,
  },
  ONLINE: {
    title: 'You\'re back online',
    description: 'All features are now available',
    variant: 'success' as ToastVariant,
  },
  SAVED: {
    title: 'Changes saved',
    description: 'Your changes have been saved successfully',
    variant: 'success' as ToastVariant,
  },
  ERROR: {
    title: 'An error occurred',
    description: 'Please try again later',
    variant: 'destructive' as ToastVariant,
  },
  LOGIN_REQUIRED: {
    title: 'Login required',
    description: 'Please log in to continue',
    variant: 'default' as ToastVariant,
  },
  COPIED: {
    title: 'Copied to clipboard',
    variant: 'success' as ToastVariant,
  },
};

// Helper to format bytes into a readable format
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}