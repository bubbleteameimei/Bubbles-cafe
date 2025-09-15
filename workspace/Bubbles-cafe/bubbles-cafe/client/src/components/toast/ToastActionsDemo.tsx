import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { ExternalLink, Download, Trash2, ArrowRight } from 'lucide-react';
import { useShowToast } from './toast-utils';

export function ToastActionsDemo() {
  const { toast } = useToast();
  const showToast = useShowToast();

  const showActionToast = () => {
    toast({
      title: "Action Required",
      description: "Please confirm or dismiss this notification",
      variant: "default",
      action: (
        <ToastAction altText="Confirm" onClick={() => showToast.success("Action confirmed!")}>
          Confirm
        </ToastAction>
      ),
    });
  };

  const showDownloadToast = () => {
    showToast.withAction({
      title: "Download Started",
      description: "Your file is being prepared for download",
      actionText: "View",
      onAction: () => {
        showToast.success("Viewing downloads...");
      }
    });
  };

  const showDestructiveToast = () => {
    showToast.withAction({
      title: "Delete Item?",
      description: "This action cannot be undone",
      variant: "destructive",
      actionText: "Delete",
      onAction: () => {
        setTimeout(() => {
          showToast.success("Item deleted successfully");
        }, 500);
      }
    });
  };

  const showLinkToast = () => {
    toast({
      title: "New Update Available",
      description: "A new version of the application is available",
      action: (
        <ToastAction 
          altText="View Details" 
          onClick={() => showToast.simple("Viewing update details...")}
          className="flex items-center"
        >
          <ArrowRight className="mr-1 h-4 w-4" />
          View
        </ToastAction>
      ),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <Button onClick={showActionToast} variant="outline">
          Simple Action
        </Button>
        <span className="text-xs text-muted-foreground">
          Basic confirmation action
        </span>
      </div>
      
      <div className="flex gap-2 items-center">
        <Button onClick={showDownloadToast} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Action
        </Button>
        <span className="text-xs text-muted-foreground">
          Action with follow-up
        </span>
      </div>
      
      <div className="flex gap-2 items-center">
        <Button onClick={showDestructiveToast} variant="outline" className="border-red-500">
          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
          Destructive Action
        </Button>
        <span className="text-xs text-muted-foreground">
          Dangerous action confirmation
        </span>
      </div>
      
      <div className="flex gap-2 items-center">
        <Button onClick={showLinkToast} variant="outline">
          <ExternalLink className="mr-2 h-4 w-4" />
          Link Action
        </Button>
        <span className="text-xs text-muted-foreground">
          Navigation action
        </span>
      </div>
    </div>
  );
}