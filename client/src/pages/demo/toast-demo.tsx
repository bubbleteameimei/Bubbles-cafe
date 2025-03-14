import React, { useState } from 'react';
import { ToastDemo } from '@/components/ToastDemo';
import { ToastActionsDemo } from '@/components/toast/ToastActionsDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Info, ChevronLeft, Bell, Gavel, CheckSquare, AlertCircle } from 'lucide-react';
import { useShowToast } from '@/components/toast/toast-utils';
import { Link } from 'wouter';

export default function ToastDemoPage() {
  const { toast } = useToast();
  const showToast = useShowToast();
  const [toastCount, setToastCount] = useState(0);
  
  // Custom toast examples with advanced interactions
  const showCustomToast = () => {
    const id = toast({
      title: "New Notification",
      description: "You have a new important notification",
      variant: "default",
      action: (
        <ToastAction 
          altText="View" 
          onClick={() => {
            toast({
              title: "Notification Viewed",
              description: "You've viewed the notification",
              variant: "success"
            });
          }}
        >
          View
        </ToastAction>
      ),
    });
    
    setToastCount(prev => prev + 1);
  };
  
  const showComplexInteraction = () => {
    const id = showToast.withAction({
      title: "Confirm Action",
      description: "This action cannot be undone. Please confirm.",
      variant: "destructive",
      actionText: "Confirm",
      onAction: () => {
        // First show processing toast
        showToast.success("Processing your request...");
        
        // Simulate API call
        setTimeout(() => {
          // Then show completion toast
          showToast.withAction({
            title: "Action Completed",
            description: "Your request has been processed successfully.",
            variant: "success",
            actionText: "Undo",
            onAction: () => {
              showToast.simple("Action has been reversed", "default");
            }
          });
        }, 1500);
      }
    });
  };
  
  const showMultiActionToast = () => {
    return (
      <div className="flex gap-2">
        <Button 
          onClick={() => {
            toast({
              title: "Legal Notice",
              description: "Please review our updated Terms of Service and Privacy Policy",
              action: (
                <div className="flex gap-2 mt-2">
                  <ToastAction 
                    altText="View Terms" 
                    onClick={() => showToast.simple("Viewing Terms of Service")}
                    className="flex-1"
                  >
                    <Gavel className="mr-1 h-4 w-4" />
                    Terms
                  </ToastAction>
                  <ToastAction 
                    altText="View Privacy" 
                    onClick={() => showToast.simple("Viewing Privacy Policy")}
                    className="flex-1"
                  >
                    <CheckSquare className="mr-1 h-4 w-4" />
                    Privacy
                  </ToastAction>
                </div>
              ),
            });
          }}
          variant="outline"
        >
          Multi-Action Toast
        </Button>
      </div>
    );
  };
  
  const testOnlineStatusToast = () => {
    // First show offline toast
    showToast.withAction({
      title: "You're offline",
      description: "Internet connection lost. Some features may be unavailable.",
      variant: "destructive",
      actionText: "Try Again",
      onAction: () => {
        // Show checking toast
        showToast.simple("Checking connection...", "default");
        
        // Simulate checking
        setTimeout(() => {
          // Show back online toast
          showToast.success("You're back online!");
        }, 1200);
      }
    });
  };
  
  const notificationCountToast = () => {
    showToast.withAction({
      title: `${toastCount} Notifications`,
      description: `You have ${toastCount} unread notifications`,
      variant: "default",
      actionText: "Clear All",
      onAction: () => {
        setToastCount(0);
        showToast.success("All notifications cleared");
      }
    });
  };
  
  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Toast Notification Demo</h1>
        <p className="text-muted-foreground mt-2">
          Explore different toast notification styles and interactions available in the application.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Basic Toast Types</CardTitle>
            <CardDescription>Simple toast notifications with different variants</CardDescription>
          </CardHeader>
          <CardContent>
            <ToastDemo />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Action Toasts</CardTitle>
            <CardDescription>Toast notifications with actionable buttons</CardDescription>
          </CardHeader>
          <CardContent>
            <ToastActionsDemo />
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Advanced Notifications</CardTitle>
          <CardDescription>Complex interactions and use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="multi">
            <TabsList className="mb-4">
              <TabsTrigger value="multi">Multi-step</TabsTrigger>
              <TabsTrigger value="actions">Multiple Actions</TabsTrigger>
              <TabsTrigger value="status">Status Updates</TabsTrigger>
              <TabsTrigger value="count">Notification Count</TabsTrigger>
            </TabsList>
            
            <TabsContent value="multi" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This demonstrates a multi-step toast flow, where one action triggers follow-up notifications.
              </p>
              <Button onClick={showComplexInteraction} variant="default">
                <AlertCircle className="mr-2 h-4 w-4" />
                Start Complex Interaction
              </Button>
            </TabsContent>
            
            <TabsContent value="actions" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Toasts can include multiple action buttons for different user choices.
              </p>
              {showMultiActionToast()}
            </TabsContent>
            
            <TabsContent value="status" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Demonstrates status change notifications, like online/offline status.
              </p>
              <Button onClick={testOnlineStatusToast} variant="outline">
                <Info className="mr-2 h-4 w-4" />
                Test Connection Status
              </Button>
            </TabsContent>
            
            <TabsContent value="count" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Maintaining state between toast notifications (current count: {toastCount}).
              </p>
              <div className="flex gap-2">
                <Button onClick={showCustomToast} variant="outline">
                  <Bell className="mr-2 h-4 w-4" />
                  Add Notification
                </Button>
                <Button onClick={notificationCountToast} variant="default">
                  Show Notification Count
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
          <CardDescription>How to use toast notifications in your code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto">
            <pre>{`// Basic toast usage
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Simple toast
toast({
  title: "Hello",
  description: "This is a simple toast",
  variant: "default" // or "success", "destructive"
});

// Toast with action
import { ToastAction } from '@/components/ui/toast';

toast({
  title: "Action Required",
  description: "Please confirm this action",
  variant: "default",
  action: (
    <ToastAction altText="Confirm" onClick={handleConfirm}>
      Confirm
    </ToastAction>
  ),
});

// Using the utility helper
import { useShowToast } from '@/components/toast/toast-utils';

const showToast = useShowToast();

// Simple notifications
showToast.simple("Message sent successfully");
showToast.success("Operation completed");
showToast.error("An error occurred");

// Action toast with helper
showToast.withAction({
  title: "Warning",
  description: "This will delete the item",
  actionText: "Continue",
  variant: "destructive",
  onAction: handleDelete
});`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}