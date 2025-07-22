import React from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ToastDocsPage() {
  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-6">
        <Link href="/demo/toast" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Toast Demo
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Toast Notification Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Complete guide to using the toast notification system in your application
        </p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
            <CardDescription>What are toast notifications and when to use them</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Toast notifications are non-disruptive messages that appear temporarily on the screen to provide feedback
              to users about the outcome of an action or to display important information. They're named "toast" notifications
              because they pop up like toast from a toaster.
            </p>
            
            <h3 className="text-lg font-semibold mt-4">When to use toast notifications:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>To confirm a successful action (e.g., "Changes saved successfully")</li>
              <li>To notify about errors or warnings (e.g., "Failed to save changes")</li>
              <li>To alert about system status changes (e.g., "You're now offline")</li>
              <li>To provide non-critical information (e.g., "New content available")</li>
            </ul>
            
            <div className="bg-muted p-4 rounded-md mt-4">
              <p className="font-medium">Best Practices:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Keep messages short and clear</li>
                <li>Use different variants to indicate different message types</li>
                <li>Provide actions when appropriate (e.g., "Undo", "View")</li>
                <li>Don't overuse toast notifications – they should enhance, not disrupt the user experience</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Basic Usage</CardTitle>
            <CardDescription>Simple examples for common scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="useToast">
              <TabsList className="mb-4">
                <TabsTrigger value="useToast">useToast Hook</TabsTrigger>
                <TabsTrigger value="showToast">useShowToast Helper</TabsTrigger>
                <TabsTrigger value="predefined">Predefined Toasts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="useToast" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The core hook for creating toast notifications. Provides full control over toast appearance and behavior.
                </p>
                <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto">
                  <pre>{`// Basic usage
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  const showBasicToast = () => {
    toast({
      title: "Hello",
      description: "This is a basic toast notification",
      variant: "default" // or "success", "destructive"
    });
  };
  
  // ... rest of your component
}`}</pre>
                </div>
                
                <p className="text-sm font-medium mt-4">Available options:</p>
                <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto">
                  <pre>{`toast({
  title: string | ReactNode;       // Main message
  description?: string | ReactNode; // Optional description
  variant?: "default" | "destructive" | "success"; // Appearance variant
  duration?: number;               // How long to display (ms) - default: 5000
  action?: ToastActionElement;     // Optional action button
});`}</pre>
                </div>
              </TabsContent>
              
              <TabsContent value="showToast" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A simplified utility that provides convenient methods for common toast patterns.
                </p>
                <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto">
                  <pre>{`// Using the utility helper
import { useShowToast } from '@/components/toast/toast-utils';

function MyComponent() {
  const showToast = useShowToast();
  
  // Simple notifications
  const handleSuccess = () => {
    showToast.success("Operation completed successfully");
  };
  
  const handleError = () => {
    showToast.error("An error occurred");
  };
  
  const showInformation = () => {
    showToast.simple("Did you know? You can customize your profile");
  };
  
  // ... rest of your component
}`}</pre>
                </div>
                
                <p className="text-sm font-medium mt-4">Available methods:</p>
                <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto">
                  <pre>{`// Helper methods
showToast.simple(message, variant?, duration?);  // Basic toast with just a title
showToast.success(message, duration?);           // Success toast shorthand
showToast.error(message, duration?);             // Error toast shorthand

// Toast with action button
showToast.withAction({
  title: string;                  // Main message
  description?: string;           // Optional description
  actionText: string;             // Button text
  variant?: ToastVariant;         // Appearance variant
  onAction: () => void;           // Action callback
  duration?: number;              // How long to display (ms)
});`}</pre>
                </div>
              </TabsContent>
              
              <TabsContent value="predefined" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Pre-defined toast configurations for common scenarios to ensure consistency throughout the application.
                </p>
                <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto">
                  <pre>{`// Using pre-defined toast configurations
import { useToast } from '@/hooks/use-toast';
import { CommonToasts } from '@/components/toast/toast-utils';

function MyComponent() {
  const { toast } = useToast();
  
  const showOfflineToast = () => {
    toast(CommonToasts.OFFLINE);
  };
  
  const showSavedToast = () => {
    toast(CommonToasts.SAVED);
  };
  
  // ... rest of your component
}`}</pre>
                </div>
                
                <p className="text-sm font-medium mt-4">Available predefined toasts:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><code>CommonToasts.OFFLINE</code> - Notification for when the user loses connection</li>
                  <li><code>CommonToasts.ONLINE</code> - Notification for when the user's connection is restored</li>
                  <li><code>CommonToasts.SAVED</code> - Notification for successful save operations</li>
                  <li><code>CommonToasts.ERROR</code> - Generic error notification</li>
                  <li><code>CommonToasts.LOGIN_REQUIRED</code> - Notification for authentication requirements</li>
                  <li><code>CommonToasts.COPIED</code> - Notification for clipboard copy operations</li>
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Advanced Usage</CardTitle>
            <CardDescription>Complex interactions and toast sequences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">Adding action buttons</h3>
            <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto">
              <pre>{`import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

function MyComponent() {
  const { toast } = useToast();
  
  const showToastWithAction = () => {
    toast({
      title: "File deleted",
      description: "The file has been moved to trash",
      variant: "default",
      action: (
        <ToastAction 
          altText="Undo" 
          onClick={() => handleUndoDelete()}
        >
          Undo
        </ToastAction>
      ),
    });
  };
}`}</pre>
            </div>
            
            <h3 className="text-lg font-semibold mt-6">Toast sequences</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Creating chains of toast notifications for multi-step processes.
            </p>
            <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto">
              <pre>{`import { useShowToast } from '@/components/toast/toast-utils';

function MyComponent() {
  const showToast = useShowToast();
  
  const startProcess = () => {
    // First toast with action
    showToast.withAction({
      title: "Start process?",
      description: "This will process all pending items",
      variant: "default",
      actionText: "Start",
      onAction: () => {
        // Show processing toast
        showToast.simple("Processing items...");
        
        // Simulate processing
        setTimeout(() => {
          // Show completion toast
          showToast.success("All items processed successfully");
        }, 2000);
      }
    });
  };
}`}</pre>
            </div>
            
            <h3 className="text-lg font-semibold mt-6">Toast with multiple actions</h3>
            <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto">
              <pre>{`import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

function MyComponent() {
  const { toast } = useToast();
  
  const showMultiActionToast = () => {
    toast({
      title: "Update Available",
      description: "A new version of the app is available",
      variant: "default",
      action: (
        <div className="flex gap-2 mt-2">
          <ToastAction 
            altText="Update Now" 
            onClick={() => handleUpdate()}
            className="flex-1"
          >
            Update Now
          </ToastAction>
          <ToastAction 
            altText="Later" 
            onClick={() => handleLater()}
            className="flex-1"
          >
            Later
          </ToastAction>
        </div>
      ),
    });
  };
}`}</pre>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Use Cases & Examples</CardTitle>
            <CardDescription>Real-world applications of toast notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Form Submission Feedback</h3>
              <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto mt-2">
                <pre>{`import { useShowToast } from '@/components/toast/toast-utils';

function ContactForm() {
  const showToast = useShowToast();
  
  const onSubmit = async (data) => {
    try {
      // API call to submit form
      await submitContactForm(data);
      
      // Success notification
      showToast.success("Message sent successfully");
      
      // Clear form
      resetForm();
    } catch (error) {
      // Error notification
      showToast.error("Failed to send message. Please try again.");
    }
  };
  
  // ... rest of form component
}`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Network Status Changes</h3>
              <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto mt-2">
                <pre>{`import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CommonToasts } from '@/components/toast/toast-utils';

function NetworkMonitor() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Function to handle online status change
    const handleOnline = () => {
      toast(CommonToasts.ONLINE);
    };
    
    // Function to handle offline status change
    const handleOffline = () => {
      toast(CommonToasts.OFFLINE);
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);
  
  return null; // This component doesn't render anything
}`}</pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">User Action Confirmation with Undo</h3>
              <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto mt-2">
                <pre>{`import { useShowToast } from '@/components/toast/toast-utils';

function TodoList() {
  const showToast = useShowToast();
  const [todos, setTodos] = useState([...]);
  
  const removeTodo = (id) => {
    // Store the removed todo for potential undo
    const removedTodo = todos.find(todo => todo.id === id);
    
    // Update state
    setTodos(todos.filter(todo => todo.id !== id));
    
    // Show toast with undo action
    showToast.withAction({
      title: "Task deleted",
      description: removedTodo.title,
      variant: "default",
      actionText: "Undo",
      onAction: () => {
        // Restore the removed todo
        setTodos(prev => [...prev, removedTodo]);
        
        // Confirmation toast
        showToast.success("Task restored");
      }
    });
  };
  
  // ... rest of component
}`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customization</CardTitle>
            <CardDescription>How to extend and customize the toast system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The toast notification system is built on top of Radix UI's Toast primitive and can be customized in various ways.
              Below are some examples of how to extend or modify the toast system for your specific needs.
            </p>
            
            <h3 className="text-lg font-semibold mt-4">Adding custom variants</h3>
            <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto mt-2">
              <pre>{`// In client/src/components/ui/toast.tsx
const toastVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        destructive: "...",
        success: "...",
        // Add your custom variant
        warning: "group border-yellow-600 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// In client/src/hooks/use-toast.ts
export type ToastVariant = "default" | "destructive" | "success" | "warning";

// Then use it in your component
toast({
  title: "Warning",
  description: "This action might have consequences",
  variant: "warning",
});`}</pre>
            </div>
            
            <h3 className="text-lg font-semibold mt-6">Custom toast components</h3>
            <p className="text-sm text-muted-foreground mb-3">
              You can create specialized toast components for specific use cases.
            </p>
            <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-50 overflow-auto mt-2">
              <pre>{`// Creating a custom specialized toast utility
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export function useAuthToasts() {
  const { toast } = useToast();
  
  // Session timeout notification
  const sessionTimeout = (onRenew: () => void) => {
    return toast({
      title: "Session Expiring",
      description: "Your session will expire in 5 minutes. Would you like to continue?",
      variant: "warning",
      duration: 300000, // 5 minutes
      action: (
        <ToastAction altText="Renew Session" onClick={onRenew}>
          Renew Session
        </ToastAction>
      ),
    });
  };
  
  // Logged out notification
  const loggedOut = () => {
    return toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
      variant: "success",
    });
  };
  
  return {
    sessionTimeout,
    loggedOut,
  };
}

// Using it in a component
function AuthComponent() {
  const authToasts = useAuthToasts();
  
  const handleSessionWarning = () => {
    authToasts.sessionTimeout(() => {
      // Renew the session
      api.renewSession();
    });
  };
  
  // ... rest of component
}`}</pre>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Considerations</CardTitle>
            <CardDescription>Ensuring toast notifications are accessible to all users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              When using toast notifications, it's important to consider accessibility to ensure all users, including those with
              disabilities, can benefit from these notifications. Here are some key considerations:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <span className="font-medium">Provide alternative text:</span> Always include the <code>altText</code> prop 
                in ToastAction components to ensure screen readers can announce the action correctly.
              </li>
              <li>
                <span className="font-medium">Sufficient duration:</span> Ensure toasts are displayed long enough for users 
                to read and interact with them. The default 5-second duration works for most cases, but consider longer durations 
                for toasts with more content or actions.
              </li>
              <li>
                <span className="font-medium">Color contrast:</span> The default toast styles have been designed to meet WCAG 
                color contrast requirements, but ensure any custom styles also maintain sufficient contrast.
              </li>
              <li>
                <span className="font-medium">Avoid overuse:</span> Too many toast notifications can overwhelm all users, but 
                especially those using screen readers or those with cognitive disabilities.
              </li>
              <li>
                <span className="font-medium">Focus management:</span> For critical toasts with actions, consider moving focus 
                to the toast to ensure users are aware of it.
              </li>
            </ul>
            
            <div className="bg-muted p-4 rounded-md mt-4">
              <p className="font-medium">Testing Tip:</p>
              <p className="text-sm mt-1">
                Test your toast notifications with a screen reader to ensure they are properly announced and that actions can be
                easily accessed and activated. Also, verify that toasts can be dismissed using only the keyboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}