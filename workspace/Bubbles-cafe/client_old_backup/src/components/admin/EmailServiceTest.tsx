/**
 * Email Service Test Component
 * 
 * A component for testing email service functionality from the admin panel.
 */

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Send, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

// Type for email service status
interface EmailServiceStatus {
  success: boolean;
  services: {
    gmail: boolean;
    sendgrid: boolean;
    mailersend: boolean;
  };
  primaryService: 'gmail' | 'sendgrid' | 'mailersend' | 'none';
}

export default function EmailServiceTest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [status, setStatus] = useState<EmailServiceStatus | null>(null);
  const [formData, setFormData] = useState({
    to: '',
    subject: 'Test Email from Bubble\'s Cafe',
    message: 'This is a test email from the Bubble\'s Cafe admin panel.'
  });

  // Fetch email service status on component mount
  useEffect(() => {
    fetchEmailStatus();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fetch email service status
  const fetchEmailStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch('/api/email/status');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch email status: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (error: any) {
      console.error('Error fetching email status:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch email service status: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setStatusLoading(false);
    }
  };

  // Send test email
  const sendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.to) {
      toast({
        title: 'Validation Error',
        description: 'Recipient email address is required',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSending(true);
      
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          text: formData.message,
          html: `<h1>${formData.subject}</h1><p>${formData.message}</p>`
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to send email: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: `Email sent successfully via ${data.details.service}`,
        variant: 'default'
      });
      
      // Refresh status after sending
      fetchEmailStatus();
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Email Sending Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  // Get badge variant based on service status
  const getServiceBadgeVariant = (isAvailable: boolean) => {
    return isAvailable ? 'success' : 'destructive';
  };

  // Get service badge label
  const getServiceBadgeLabel = (isAvailable: boolean) => {
    return isAvailable ? 'Available' : 'Unavailable';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Email Service Status</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchEmailStatus} 
            disabled={statusLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {statusLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : status ? (
          <Card>
            <CardHeader>
              <CardTitle>Service Providers</CardTitle>
              <CardDescription>
                Current status of available email service providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex flex-col space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Gmail</span>
                      <Badge variant={getServiceBadgeVariant(status.services.gmail)}>
                        {status.services.gmail ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {getServiceBadgeLabel(status.services.gmail)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {status.services.gmail ? 'Primary email provider' : 'Gmail service unavailable'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">SendGrid</span>
                      <Badge variant={getServiceBadgeVariant(status.services.sendgrid)}>
                        {status.services.sendgrid ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {getServiceBadgeLabel(status.services.sendgrid)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {status.services.sendgrid ? 'Fallback email provider' : 'SendGrid service unavailable'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">MailerSend</span>
                      <Badge variant={getServiceBadgeVariant(status.services.mailersend)}>
                        {status.services.mailersend ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {getServiceBadgeLabel(status.services.mailersend)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {status.services.mailersend ? 'Final fallback provider' : 'MailerSend service unavailable'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Active Provider</h3>
                  <div className="flex items-center">
                    <Badge variant={status.primaryService !== 'none' ? 'success' : 'destructive'}>
                      {status.primaryService !== 'none' ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {status.primaryService.toUpperCase()}
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3 w-3" />
                          No Available Provider
                        </>
                      )}
                    </Badge>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {status.primaryService !== 'none' 
                        ? 'Emails will be sent via this provider' 
                        : 'No email service is available. Configure at least one provider.'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <XCircle className="h-8 w-8 text-destructive" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Failed to retrieve email service status. Please try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Test Email Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>
            Send a test email to verify email functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="test-email-form" onSubmit={sendTestEmail}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to">Recipient Email</Label>
                <Input
                  id="to"
                  name="to"
                  placeholder="recipient@example.com"
                  value={formData.to}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Email subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Email message content"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => fetchEmailStatus()} disabled={statusLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          <Button 
            type="submit" 
            form="test-email-form" 
            disabled={sending || !status?.primaryService || status?.primaryService === 'none'}
          >
            {sending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Test Email
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}