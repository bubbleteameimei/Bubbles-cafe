/**
 * Email Service Test Component
 * 
 * This component provides a UI for testing the email service.
 * It allows administrators to check the status of email providers and send test emails.
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw, 
  Send 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Email form schema for validation
const emailFormSchema = z.object({
  to: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  html: z.boolean().optional().default(false),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

// Email service status response type
interface EmailServiceStatus {
  sendgrid: boolean;
  mailersend: boolean;
}

export default function EmailServiceTest() {
  const [activeTab, setActiveTab] = useState('status');
  const [sendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      to: '',
      subject: 'Test Email from Bubble\'s Cafe Storyteller',
      message: 'This is a test email sent from the admin panel to verify email service functionality.',
      html: true,
    },
  });
  
  // Query to fetch email service status
  const { 
    data: emailStatus, 
    isLoading: isStatusLoading, 
    isError: isStatusError,
    refetch: refetchStatus
  } = useQuery<EmailServiceStatus>({
    queryKey: ['/api/email/status'],
    retry: 1,
  });
  
  // Mutation to send test email
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: EmailFormValues) => {
      setSendingEmail(true);
      try {
        const response = await fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: emailData.to,
            subject: emailData.subject,
            ...(emailData.html 
              ? { html: emailData.message } 
              : { text: emailData.message }
            ),
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to send email');
        }
        
        return await response.json();
      } finally {
        setSendingEmail(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Email Sent',
        description: 'Test email has been sent successfully.',
        variant: 'default',
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Send Email',
        description: error.message || 'An error occurred while sending the email.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: EmailFormValues) => {
    sendEmailMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Service Status</TabsTrigger>
          <TabsTrigger value="send">Send Test Email</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Service Status</CardTitle>
              <CardDescription>
                Check the status of configured email service providers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isStatusLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2">Checking email service status...</span>
                </div>
              ) : isStatusError ? (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Error Checking Status</h4>
                    <p className="text-sm mt-1">
                      Could not connect to the email service API. Please check your server logs.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">SendGrid</h3>
                        <p className="text-sm text-muted-foreground">Primary Email Provider</p>
                      </div>
                      {emailStatus?.sendgrid ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Inactive</span>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">MailerSend</h3>
                        <p className="text-sm text-muted-foreground">Fallback Email Provider</p>
                      </div>
                      {emailStatus?.mailersend ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Inactive</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">Service Health Summary</h3>
                    {emailStatus?.sendgrid || emailStatus?.mailersend ? (
                      <div className="bg-success/10 border border-success/20 text-success p-3 rounded-md flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <div>
                          {emailStatus?.sendgrid && emailStatus?.mailersend ? (
                            "Both email services are active and ready to use."
                          ) : emailStatus?.sendgrid ? (
                            "Primary email service (SendGrid) is active. Fallback service is not available."
                          ) : (
                            "Fallback email service (MailerSend) is active. Primary service is not available."
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <div>
                          No email services are available. Please check your API keys and configurations.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => refetchStatus()} 
                disabled={isStatusLoading}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isStatusLoading ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>
                Send a test email to verify email service functionality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the email address where you want to receive the test email.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="html"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="form-checkbox h-4 w-4 text-primary border-border rounded focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Send as HTML</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={sendingEmail}
                    >
                      {sendingEmail ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Test Email
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
              <p className="mb-1">
                <strong>Note:</strong> This will send a real email using the configured email services.
              </p>
              <p>
                If the primary service (SendGrid) fails, the system will automatically attempt to use the fallback service (MailerSend).
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}