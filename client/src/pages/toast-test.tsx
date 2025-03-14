import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ToastTest() {
  const { toast: hookToast } = useToast();
  const [title, setTitle] = useState('Test Notification');
  const [description, setDescription] = useState('This is a test notification message');
  const [duration, setDuration] = useState(5000);
  const [closeButton, setCloseButton] = useState(true);

  // Feedback form state
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to create toast options
  const getToastOptions = () => {
    return {
      description,
      duration,
      closeButton,
      action: closeButton ? {
        label: 'Undo',
        onClick: () => toast('Action clicked!')
      } : undefined
    };
  };

  // Function to submit feedback
  const submitFeedback = async () => {
    if (!feedbackContent.trim()) {
      toast.error('Please enter feedback content');
      return;
    }

    setIsSubmitting(true);
    
    // Get browser info for feedback submission
    const browserInfo = {
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
               navigator.userAgent.includes('Firefox') ? 'Firefox' : 
               navigator.userAgent.includes('Safari') ? 'Safari' : 'Other',
      operatingSystem: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      userAgent: navigator.userAgent
    };

    try {
      // Create the feedback data payload
      const feedbackData = {
        type: feedbackType,
        content: feedbackContent,
        rating: feedbackRating,
        page: '/toast-test',
        category: 'ui',
        ...browserInfo,
        metadata: {
          toastDuration: duration,
          toastTitle: title,
          toastHasAction: closeButton
        }
      };

      // Show loading toast
      toast.promise(
        fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData)
        }).then(response => {
          if (!response.ok) {
            throw new Error('Failed to submit feedback');
          }
          return response.json();
        }),
        {
          loading: 'Submitting feedback...',
          success: (data) => {
            // Reset form state
            setFeedbackContent('');
            setFeedbackRating(4);
            return 'Feedback submitted successfully!';
          },
          error: 'Failed to submit feedback. Please try again.'
        }
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('An error occurred while submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Toast Notification System</h1>
      <p className="text-muted-foreground mb-8">
        Test and preview different types of toast notifications using the Sonner library.
      </p>
      
      <Tabs defaultValue="sonner">
        <TabsList className="mb-6">
          <TabsTrigger value="sonner">Sonner Toasts</TabsTrigger>
          <TabsTrigger value="shadcn">ShadCN Toasts</TabsTrigger>
          <TabsTrigger value="api-test">API Toast Test</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Toast Configuration</CardTitle>
              <CardDescription>
                Customize your toast notifications for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Toast Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Enter toast title" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Toast Description</Label>
                <Input 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Enter toast description" 
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="duration">Duration (ms): {duration}</Label>
                </div>
                <Slider 
                  id="duration"
                  min={1000} 
                  max={10000} 
                  step={500} 
                  value={[duration]} 
                  onValueChange={(vals) => setDuration(vals[0])}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="close-button" 
                  checked={closeButton} 
                  onCheckedChange={setCloseButton} 
                />
                <Label htmlFor="close-button">Show Action Button</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sonner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Toasts</CardTitle>
                <CardDescription>Basic toast notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => toast(title, getToastOptions())}
                >
                  Default Toast
                </Button>
                
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => toast.success(title, getToastOptions())}
                >
                  Success Toast
                </Button>
                
                <Button 
                  className="w-full"
                  variant="destructive"
                  onClick={() => toast.error(title, getToastOptions())}
                >
                  Error Toast
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Advanced Toasts</CardTitle>
                <CardDescription>Special notification types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full"
                  variant="secondary"
                  onClick={() => toast.info(title, getToastOptions())}
                >
                  Info Toast
                </Button>
                
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => toast.warning(title, getToastOptions())}
                >
                  Warning Toast
                </Button>
                
                <Button 
                  className="w-full"
                  variant="default"
                  onClick={() => 
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: 'Loading...',
                        success: () => title,
                        error: 'Error occurred',
                      }
                    )
                  }
                >
                  Promise Toast
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="shadcn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ShadCN Toasts</CardTitle>
                <CardDescription>Using the ShadCN toast hook</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => 
                    hookToast({
                      title,
                      description,
                    })
                  }
                >
                  Default ShadCN Toast
                </Button>
                
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => 
                    hookToast({
                      title,
                      description,
                      variant: 'default',
                    })
                  }
                >
                  Success ShadCN Toast
                </Button>
                
                <Button 
                  className="w-full"
                  variant="destructive"
                  onClick={() => 
                    hookToast({
                      title,
                      description,
                      variant: 'destructive',
                    })
                  }
                >
                  Destructive ShadCN Toast
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="api-test">
          <Card>
            <CardHeader>
              <CardTitle>Test with Real API</CardTitle>
              <CardDescription>
                Submit feedback to test toast notifications with real API calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="feedback-type">Feedback Type</Label>
                <Select 
                  value={feedbackType}
                  onValueChange={setFeedbackType}
                >
                  <SelectTrigger id="feedback-type">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="praise">Praise</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="feedback-content">Feedback Content</Label>
                <Textarea 
                  id="feedback-content"
                  placeholder="Enter your feedback here..."
                  rows={5}
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="feedback-rating">Rating: {feedbackRating}/5</Label>
                </div>
                <Slider 
                  id="feedback-rating"
                  min={1} 
                  max={5} 
                  step={1} 
                  value={[feedbackRating]} 
                  onValueChange={(vals) => setFeedbackRating(vals[0])}
                />
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={submitFeedback}
                disabled={isSubmitting || !feedbackContent.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
              
              <div className="text-sm text-muted-foreground mt-2">
                This will submit real feedback to the API and display toast notifications for the process.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              How to use toast notifications in your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Sonner Toasts</h3>
                <pre className="p-4 bg-secondary/50 rounded-lg overflow-x-auto text-sm mt-2">
                  {`import { toast } from 'sonner'

// Basic usage
toast('Message')

// With description
toast('Message', { 
  description: 'Description text' 
})

// Different types
toast.success('Success message')
toast.error('Error message')
toast.info('Info message')
toast.warning('Warning message')

// Promise toast
toast.promise(fetchData(), {
  loading: 'Loading...',
  success: (data) => 'Successfully loaded data',
  error: (err) => 'Error loading data'
})`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">ShadCN Toasts</h3>
                <pre className="p-4 bg-secondary/50 rounded-lg overflow-x-auto text-sm mt-2">
                  {`import { useToast } from '@/hooks/use-toast'

// In your component
const { toast } = useToast()

// Basic usage
toast({
  title: 'Title',
  description: 'Description'
})

// Variants
toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive'
})`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}