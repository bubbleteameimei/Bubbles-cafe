import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FeedbackForm } from '../components/feedback/FeedbackForm';
import { Link, Redirect } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, PlusCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Status badge component with appropriate colors
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  const color = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

  return <Badge className={color}>{status}</Badge>;
};

export default function UserFeedbackPage() {
  const [activeTab, setActiveTab] = useState('history');
  
  // Check if user is authenticated
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['/api/auth/status'],
    queryFn: async () => {
      const response = await fetch('/api/auth/status');
      if (!response.ok) {
        throw new Error('Failed to fetch auth status');
      }
      return response.json();
    },
  });
  
  // Fetch user's feedback submissions
  const { data: feedbackData, isLoading: feedbackLoading, isError, refetch } = useQuery({
    queryKey: ['/api/user/feedback'],
    queryFn: async () => {
      const response = await fetch('/api/user/feedback');
      if (!response.ok) {
        throw new Error('Failed to fetch user feedback');
      }
      return response.json();
    },
    enabled: authData?.isAuthenticated,
  });
  
  // Fetch feedback stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/feedback/stats'],
    queryFn: async () => {
      const response = await fetch('/api/user/feedback/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback stats');
      }
      return response.json();
    },
    enabled: authData?.isAuthenticated,
  });
  
  // Show loading state
  if (authLoading || feedbackLoading || statsLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Your Feedback</h1>
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }
  
  // No longer redirecting if not authenticated
  // Instead we'll show appropriate UI based on authentication status
  
  // Check authentication status from the response
  const isAuthenticated = authData?.isAuthenticated || false;
  
  // Show appropriate UI based on whether user is authenticated or not
  const pageTitle = isAuthenticated ? "Your Feedback" : "Community Feedback";

  // For non-authenticated users, redirect to login page
  if (!isAuthenticated) {
    return <Redirect to="/login?redirect=/feedback" />;
  }
  
  // Empty state for authenticated users with no feedback
  if (feedbackData?.feedback?.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              No Feedback Submitted
            </CardTitle>
            <CardDescription>
              You haven't submitted any feedback yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              We value your opinion and would love to hear from you. 
              Your feedback helps us improve our service.
            </p>
            <FeedbackForm />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const stats = statsData?.stats || {
    total: feedbackData?.feedback?.length || 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    rejected: 0,
    responseRate: 0
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
      
      {/* Summary stats - only show to authenticated users */}
      {isAuthenticated && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4">
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200">
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4">
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200">
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-medium text-blue-600">Reviewed</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4">
              <p className="text-2xl font-bold text-blue-700">{stats.reviewed}</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-medium text-green-600">Resolved</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4">
              <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
            </CardContent>
          </Card>
          
          <Card className="border-red-200">
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4">
              <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Feedback History</TabsTrigger>
          <TabsTrigger value="new">Submit New Feedback</TabsTrigger>
        </TabsList>
        
        {/* History tab content */}
        <TabsContent value="history" className="pt-6">
          {isError && (
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-700 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Error Loading Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>There was a problem loading your feedback. Please try again.</p>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()} 
                  className="mt-4"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}
          
          {!isError && (
            <Card>
              <CardHeader>
                <CardTitle>Your Feedback History</CardTitle>
                <CardDescription>
                  Track the status of your previous feedback submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbackData.feedback.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium capitalize">{item.type}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.content}</TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('new')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Submit New Feedback
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="new" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Feedback</CardTitle>
              <CardDescription>
                We value your input to help us improve our service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}