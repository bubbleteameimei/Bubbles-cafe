import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info
} from 'lucide-react';

export function ToastDemo() {
  const { toast } = useToast();

  const showDefaultToast = () => {
    toast({
      title: "Default Toast",
      description: "This is a default toast notification",
    });
  };

  const showSuccessToast = () => {
    toast({
      title: "Success!",
      description: "Your action was completed successfully",
      variant: "success",
    });
  };

  const showErrorToast = () => {
    toast({
      title: "Error!",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <Button onClick={showDefaultToast} variant="outline">
          <Info className="mr-2 h-4 w-4" />
          Default Toast
        </Button>
        <span className="text-xs text-muted-foreground">
          General information
        </span>
      </div>
      
      <div className="flex gap-2 items-center">
        <Button onClick={showSuccessToast} variant="outline" className="border-green-500">
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Success Toast
        </Button>
        <span className="text-xs text-muted-foreground">
          Positive confirmation
        </span>
      </div>
      
      <div className="flex gap-2 items-center">
        <Button onClick={showErrorToast} variant="outline" className="border-red-500">
          <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
          Error Toast
        </Button>
        <span className="text-xs text-muted-foreground">
          Error indication
        </span>
      </div>
    </div>
  );
}