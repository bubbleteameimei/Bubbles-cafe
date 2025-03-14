import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useShowToast } from './toast-utils';

export const ToastActionsDemo = () => {
  const { toast } = useToast();
  const showToast = useShowToast();
  
  const showActionToast = () => {
    toast({
      title: "Action Required",
      description: "Please confirm this action to continue",
      variant: "default",
      action: (
        <ToastAction altText="Confirm" onClick={() => alert('Action confirmed!')}>
          Confirm
        </ToastAction>
      ),
    });
  };
  
  const showSuccessWithAction = () => {
    showToast.withAction({
      title: "Success!",
      description: "File has been uploaded successfully",
      actionText: "View File",
      altText: "View uploaded file",
      onAction: () => alert('Viewing file...'),
      variant: "success"
    });
  };
  
  const showErrorWithAction = () => {
    showToast.withAction({
      title: "Error!",
      description: "Failed to save your changes",
      actionText: "Retry",
      altText: "Try again",
      onAction: () => alert('Retrying...'),
      variant: "destructive"
    });
  };
  
  return (
    <div className="flex flex-col space-y-4 items-center mt-4">
      <h2 className="text-xl font-bold">Toast Actions Demo</h2>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={showActionToast} className="bg-blue-600 hover:bg-blue-700">
          Show Action Toast
        </Button>
        <Button onClick={showSuccessWithAction} className="bg-green-600 hover:bg-green-700">
          Success with Action
        </Button>
        <Button onClick={showErrorWithAction} className="bg-red-600 hover:bg-red-700">
          Error with Action
        </Button>
      </div>
    </div>
  );
};

export default ToastActionsDemo;