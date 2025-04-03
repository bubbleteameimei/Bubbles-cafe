import { useState } from 'react';
import { AdminFeedbackDashboard } from '../components/admin/FeedbackDashboard';
import { FeedbackAnalyticsContainer } from '../components/admin/FeedbackAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'wouter';

export default function AdminFeedbackPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Check if user is authenticated and is an admin
  const { data: authData, isLoading } = useQuery({
    queryKey: ['/api/auth/status'],
    queryFn: async () => {
      const response = await fetch('/api/auth/status');
      if (!response.ok) {
        throw new Error('Failed to fetch auth status');
      }
      return response.json();
    },
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }
  
  // Redirect if not authenticated or not an admin
  if (!authData?.isAuthenticated || !authData?.user?.isAdmin) {
    return <Redirect to="/login?redirect=/admin-feedback" />;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Feedback Management System</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Feedback Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="pt-6">
          <AdminFeedbackDashboard />
        </TabsContent>
        
        <TabsContent value="analytics" className="pt-6">
          <FeedbackAnalyticsContainer />
        </TabsContent>
      </Tabs>
    </div>
  );
}