/**
 * Email Service Test Page
 * 
 * This page provides an interface for administrators to test email service functionality.
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import AdminLayout from '@/components/layout/admin-layout';
import EmailServiceTest from '@/components/admin/EmailServiceTest';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function EmailTestPage() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Check if user is authenticated and is an admin
  const { data: authData, isLoading } = useQuery({
    queryKey: ['/api/auth/status'],
    retry: false
  });
  
  // If auth check is still loading, render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, show access denied
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need to be logged in as an administrator to access this page.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Link href="/login">
            <Button variant="default">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // If user is authenticated but not admin, show unauthorized
  if (!user.isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            You need administrator privileges to access this page.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Link href="/">
            <Button variant="default">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Email Service Test</h1>
          <p className="text-muted-foreground">
            Test and verify email service functionality including both SendGrid and MailerSend providers.
          </p>
        </div>
        
        <div className="mt-8">
          <EmailServiceTest />
        </div>
      </div>
    </AdminLayout>
  );
}