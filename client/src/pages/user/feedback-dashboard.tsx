"use client"

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart4, 
  Clock, 
  FileText, 
  Filter, 
  MessageSquare, 
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved' | 'rejected';

export interface FeedbackItem {
  id: number;
  content: string;
  type: string;
  rating?: number;
  page: string;
  category: string;
  status: FeedbackStatus;
  createdAt: string;
  metadata: {
    browser: string;
    operatingSystem: string;
    screenResolution: string;
    userAgent: string;
    name?: string;
    email?: string;
  };
  adminResponse?: string;
}

export default function UserFeedbackDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  
  // Fetch user's feedback submissions
  const { data: userFeedback, isLoading: feedbackLoading, error: feedbackError } = useQuery({
    queryKey: ['/api/user/feedback'],
    queryFn: async () => {
      const response = await fetch('/api/user/feedback');
      if (!response.ok) {
        throw new Error('Failed to fetch user feedback');
      }
      return response.json();
    },
  });
  
  // Fetch user's feedback statistics
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/user/feedback/stats'],
    queryFn: async () => {
      const response = await fetch('/api/user/feedback/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback statistics');
      }
      return response.json();
    },
  });

  // Filter and sort feedback items
  const filteredFeedback = userFeedback?.feedback ? 
    userFeedback.feedback
      .filter((item: FeedbackItem) => {
        // Apply status filter
        if (statusFilter !== 'all' && item.status !== statusFilter) {
          return false;
        }
        
        // Apply search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          return (
            item.content.toLowerCase().includes(query) ||
            item.page.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
          );
        }
        
        return true;
      })
      .sort((a: FeedbackItem, b: FeedbackItem) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  // Use fetched statistics or calculate from feedback data as fallback
  const stats = statsData?.stats || {
    total: userFeedback?.feedback?.length || 0,
    pending: userFeedback?.feedback ? userFeedback.feedback.filter((item: FeedbackItem) => item.status === 'pending').length : 0,
    resolved: userFeedback?.feedback ? userFeedback.feedback.filter((item: FeedbackItem) => item.status === 'resolved').length : 0,
    reviewed: userFeedback?.feedback ? userFeedback.feedback.filter((item: FeedbackItem) => item.status === 'reviewed').length : 0,
    rejected: userFeedback?.feedback ? userFeedback.feedback.filter((item: FeedbackItem) => item.status === 'rejected').length : 0,
    responseRate: 0
  };

  const statusColors: Record<FeedbackStatus | 'all', string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    reviewed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    all: '' // This won't be used for display
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container py-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Feedback Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage your feedback submissions
          </p>
        </div>
        <Button className="w-full md:w-auto" asChild>
          <a href="/feedback">Submit New Feedback</a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <BarChart4 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>All Feedback</TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setStatusFilter('pending')}>Pending</TabsTrigger>
            <TabsTrigger value="reviewed" onClick={() => setStatusFilter('reviewed')}>Reviewed</TabsTrigger>
            <TabsTrigger value="resolved" onClick={() => setStatusFilter('resolved')}>Resolved</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {feedbackLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="mb-4">
                <CardHeader>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : feedbackError ? (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Error loading feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-500">Failed to load your feedback. Please try again later.</p>
              </CardContent>
            </Card>
          ) : filteredFeedback?.length === 0 ? (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>No feedback found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {searchQuery ? "No feedback matches your search criteria." : "You haven't submitted any feedback yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFeedback.map((item: FeedbackItem) => (
              <Card key={item.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                      <Badge variant="outline">{item.type}</Badge>
                      {item.rating && (
                        <Badge variant="outline">Rating: {item.rating}/5</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2">{item.category}</CardTitle>
                  <CardDescription>{item.page}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{item.content}</p>
                  
                  {item.adminResponse && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Admin Response:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.adminResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {/* Same component logic as 'all' tab but filtered for pending status */}
          {filteredFeedback
            .filter((item: FeedbackItem) => item.status === 'pending')
            .map((item: FeedbackItem) => (
              <Card key={item.id} className="mb-4">
                {/* Same card content as in 'all' tab */}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                      <Badge variant="outline">{item.type}</Badge>
                      {item.rating && (
                        <Badge variant="outline">Rating: {item.rating}/5</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2">{item.category}</CardTitle>
                  <CardDescription>{item.page}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{item.content}</p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {/* Same component logic as 'all' tab but filtered for reviewed status */}
          {filteredFeedback
            .filter((item: FeedbackItem) => item.status === 'reviewed')
            .map((item: FeedbackItem) => (
              <Card key={item.id} className="mb-4">
                {/* Same card content as in 'all' tab */}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                      <Badge variant="outline">{item.type}</Badge>
                      {item.rating && (
                        <Badge variant="outline">Rating: {item.rating}/5</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2">{item.category}</CardTitle>
                  <CardDescription>{item.page}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{item.content}</p>
                  
                  {item.adminResponse && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Admin Response:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.adminResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {/* Same component logic as 'all' tab but filtered for resolved status */}
          {filteredFeedback
            .filter((item: FeedbackItem) => item.status === 'resolved')
            .map((item: FeedbackItem) => (
              <Card key={item.id} className="mb-4">
                {/* Same card content as in 'all' tab */}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                      <Badge variant="outline">{item.type}</Badge>
                      {item.rating && (
                        <Badge variant="outline">Rating: {item.rating}/5</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2">{item.category}</CardTitle>
                  <CardDescription>{item.page}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{item.content}</p>
                  
                  {item.adminResponse && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Admin Response:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.adminResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}