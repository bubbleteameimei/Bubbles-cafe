
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useToast } from '@/hooks/use-toast';

export const ToastDemo = () => {
  const { toast: customToast } = useToast();
  
  const showToastify = () => {
    toast.success('This is a react-toastify success message!');
    toast.error('This is a react-toastify error message!');
    toast.info('This is a react-toastify info message!');
  };
  
  const showCustomToast = () => {
    customToast({
      title: "Success!",
      description: "This is using your custom toast system",
      variant: "success",
    });
  };
  
  return (
    <div className="flex flex-col space-y-4 items-center mt-4">
      <h2 className="text-xl font-bold">Toast Notifications Demo</h2>
      <div className="flex space-x-4">
        <Button onClick={showToastify}>Show Toastify Notifications</Button>
        <Button onClick={showCustomToast}>Show Custom Toast</Button>
      </div>
    </div>
  );
};

export default ToastDemo;
