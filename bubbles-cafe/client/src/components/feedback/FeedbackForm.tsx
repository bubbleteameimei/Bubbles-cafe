import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Feedback schema for validation
const feedbackSchema = z.object({
  type: z.enum(['general', 'bug', 'feature', 'content']),
  content: z.string().min(5, "Please provide more details about your feedback"),
  page: z.string().optional(),
  category: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

// Collect browser information
const getBrowserInfo = () => {
  return {
    browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
             navigator.userAgent.includes('Firefox') ? 'Firefox' : 
             navigator.userAgent.includes('Safari') ? 'Safari' : 
             navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown',
    operatingSystem: navigator.platform || 'Unknown',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    userAgent: navigator.userAgent
  };
};

export function FeedbackForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  // Initialize form with default values
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: 'general',
      content: '',
      page: '',
      category: 'general',
    },
  });

  // Set current page on component mount
  useEffect(() => {
    setCurrentPage(window.location.pathname);
    form.setValue('page', window.location.pathname);
  }, []);

  // Handle form submission
  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);

    try {
      // Collect browser info
      const browserInfo = getBrowserInfo();
      
      // Prepare payload with form data and browser info
      const payload = {
        ...data,
        ...browserInfo,
      };
      
      // Submit feedback to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Show success toast
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We appreciate your input.",
        variant: "default",
      });

      // Reset form and set submitted state
      form.reset();
      setSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show thank you card after submission
  if (submitted) {
    return (
      <Card className="w-full mx-auto shadow-md relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-green-50 rounded-full blur-xl"></div>
        <CardHeader className="border-b border-b-gray-100">
          <CardTitle className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <span>Thank You for Your Feedback!</span>
          </CardTitle>
          <CardDescription className="pl-14">
            Your thoughts have been submitted successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 mb-5 italic pl-14">
            We really appreciate you taking the time to share your thoughts with us. Your feedback directly helps us make Bubble's Café better for everyone!
          </div>
          <div className="flex justify-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => setSubmitted(false)}
              className="group border-green-200 hover:bg-green-50 transition-all duration-300"
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-500 group-hover:scale-110 transition-all duration-300" />
              <span className="text-green-600">Submit Another Feedback</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">Feedback Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/50 border border-gray-200 hover:border-primary/50 transition-all duration-300">
                        <SelectValue placeholder="Select a feedback type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General Feedback</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="content">Content Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/50 border border-gray-200 hover:border-primary/50 transition-all duration-300">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="ui">User Interface</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="accessibility">Accessibility</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-medium">Your Feedback</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what you think..."
                    className="resize-none h-32 bg-white/50 border border-gray-200 hover:border-primary/50 transition-all duration-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className={`w-full group ${isSubmitting ? 'opacity-80' : 'hover:shadow-md'} transition-all duration-300`} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="group-hover:scale-105 transform transition-transform duration-300">Submit Feedback</span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}