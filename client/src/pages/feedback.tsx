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
import { MessageSquare, PlusCircle, RefreshCw, AlertCircle, LogIn } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Status badge component with appropriate colors and icons
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string, icon: React.ReactNode, label: string }> = {
    pending: {
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      icon: <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>,
      label: 'Pending'
    },
    reviewed: {
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      icon: <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            </svg>,
      label: 'Reviewed'
    },
    resolved: {
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      icon: <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>,
      label: 'Resolved'
    },
    rejected: {
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      icon: <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>,
      label: 'Rejected'
    },
  };

  const config = statusConfig[status] || {
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 16V16.01M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>,
    label: status.charAt(0).toUpperCase() + status.slice(1)
  };

  return (
    <Badge className={`${config.color} flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200`}>
      {config.icon}
      {config.label}
    </Badge>
  );
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
  
  // Check authentication status from the response
  const isAuthenticated = authData?.isAuthenticated || false;
  
  // Show appropriate UI based on whether user is authenticated or not
  const pageTitle = isAuthenticated ? "Your Feedback" : "Feedback and Suggestions";
  
  // For non-authenticated users, show submission form with login tip
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
        
        <Card className="mb-6 shadow-md border border-primary/20 relative overflow-hidden">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <LogIn className="h-5 w-5 text-primary" />
              </div>
              <span>Sign in for enhanced feedback tracking</span>
            </CardTitle>
            <CardDescription className="pl-14">
              Create an account to track your feedback submissions and receive status updates
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-4 mt-2">
              <Button variant="outline" className="flex-1 border-primary/20" asChild>
                <Link to="/login" className="inline-flex items-center justify-center">
                  Sign in
                </Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link to="/register" className="inline-flex items-center justify-center">
                  Create account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6 shadow-md relative overflow-hidden">
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
          <CardHeader className="border-b border-b-gray-100">
            <CardTitle className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <span>Share Your Thoughts With Us!</span>
            </CardTitle>
            <CardDescription className="pl-14">
              <span className="font-medium">No login required</span> - we're excited to hear what you think!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="text-sm text-gray-600 mb-5">
              Your suggestions help us improve Bubble's Café. We appreciate your valuable input.
            </div>
            <FeedbackForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state for authenticated users with no feedback
  if (feedbackData?.feedback?.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
        
        <Card className="mb-6 shadow-md relative overflow-hidden">
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
          <CardHeader className="border-b border-b-gray-100">
            <CardTitle className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <span>Be the First to Share Your Thoughts!</span>
            </CardTitle>
            <CardDescription className="pl-14">
              You haven't submitted any feedback yet. We'd love to hear from you!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="text-sm text-gray-600 mb-5">
              Your suggestions help us improve Bubble's Café. We appreciate your valuable input.
            </div>
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
            <Card className="border-red-200 shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-50 rounded-full blur-xl"></div>
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100/60">
                <CardTitle className="text-red-700 flex items-center">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  Oops! Something Went Wrong
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-gray-600 mb-4 pl-14">There was a problem loading your feedback. Let's try again!</div>
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => refetch()} 
                    className="mt-2 border-red-200 hover:bg-red-50 group transition-all duration-300"
                  >
                    <RefreshCw className="mr-2 h-4 w-4 text-red-500 group-hover:rotate-180 transition-all duration-500" />
                    <span className="text-red-500">Refresh Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!isError && (
            <Card className="shadow-md relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
              <CardHeader className="border-b border-b-gray-100">
                <CardTitle className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <span>Your Feedback Journey</span>
                </CardTitle>
                <CardDescription className="pl-14">
                  Track the status of all your previous feedback submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5">
                      <TableHead className="font-medium">Type</TableHead>
                      <TableHead className="font-medium">Content</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbackData.feedback.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-gray-50/80">
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
              <CardFooter className="bg-gray-50/50 border-t border-t-gray-100">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('new')}
                  className="group border-primary/20 hover:bg-primary/5 transition-all duration-300"
                >
                  <PlusCircle className="mr-2 h-4 w-4 text-primary group-hover:scale-110 transition-all duration-300" />
                  <span className="text-primary">Share New Feedback</span>
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="new" className="pt-6">
          <Card className="shadow-md relative overflow-hidden">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
            <CardHeader className="border-b border-b-gray-100">
              <CardTitle className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <span>Share Your Thoughts With Us!</span>
              </CardTitle>
              <CardDescription className="pl-14">
                We value your input to help us improve our service
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 relative">
              <div className="text-sm text-gray-600 mb-5">
                Your suggestions help us improve Bubble's Café. We appreciate your valuable input.
              </div>
              <FeedbackForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}