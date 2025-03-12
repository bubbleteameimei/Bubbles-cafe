
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const ToastDemo = () => {
  const { toast } = useToast();
  
  const showSuccessToast = () => {
    toast({
      title: "Success!",
      description: "This is a success notification",
      variant: "success",
    });
  };
  
  const showErrorToast = () => {
    toast({
      title: "Error!",
      description: "Something went wrong",
      variant: "destructive",
    });
  };
  
  const showDefaultToast = () => {
    toast({
      title: "Info",
      description: "Just some information for you",
      variant: "default",
    });
  };
  
  return (
    <div className="flex flex-col space-y-4 items-center mt-4">
      <h2 className="text-xl font-bold">Toast Notifications Demo</h2>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={showSuccessToast} className="bg-green-600 hover:bg-green-700">Success Toast</Button>
        <Button onClick={showErrorToast} className="bg-red-600 hover:bg-red-700">Error Toast</Button>
        <Button onClick={showDefaultToast} className="bg-blue-600 hover:bg-blue-700">Info Toast</Button>
      </div>
    </div>
  );
};

export default ToastDemo;
