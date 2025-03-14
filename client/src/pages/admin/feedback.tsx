import React, { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types for our feedback data
interface FeedbackItem {
  id: number;
  type: string;
  content: string;
  rating: number;
  status: string;
  page: string;
  createdAt: string;
  metadata: {
    name?: string;
    email?: string;
    browser?: string;
    operatingSystem?: string;
    screenResolution?: string;
  };
}

// Status badge component to visualize status
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case 'reviewed':
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          <CheckCircle className="mr-1 h-3 w-3" /> Reviewed
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle className="mr-1 h-3 w-3" /> Resolved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="mr-1 h-3 w-3" /> Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <AlertCircle className="mr-1 h-3 w-3" /> {status}
        </Badge>
      );
  }
}

// Type badge component to visualize feedback type
function TypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'bug':
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          Bug Report
        </Badge>
      );
    case 'feature':
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
          Feature Request
        </Badge>
      );
    case 'content':
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Content Suggestion
        </Badge>
      );
    case 'general':
      return (
        <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
          General Feedback
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
          {type}
        </Badge>
      );
  }
}

// Feedback detail card component
function FeedbackDetailCard({ feedback }: { feedback: FeedbackItem }) {
  const { toast } = useToast();
  const [status, setStatus] = useState(feedback.status);

  // Debug and performance tracking
  const logStatusUpdate = (id: number, newStatus: string) => {
    console.log('[Admin:Feedback] Status update attempt', {
      feedbackId: id,
      newStatus: newStatus,
      previousStatus: feedback.status,
      timestamp: new Date().toISOString()
    });
  };

  const trackUpdatePerformance = (id: number, duration: number) => {
    console.log('[Admin:Performance]', {
      operation: 'feedback-status-update',
      feedbackId: id,
      durationMs: duration,
      timestamp: new Date().toISOString()
    });
  };

  // Enhanced status update mutation with debugging
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const startTime = performance.now();
      logStatusUpdate(id, status);
      
      try {
        const response = await fetch(`/api/feedback/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });

        // Log response time
        const responseTime = performance.now() - startTime;
        console.log(`[Admin:Feedback] Status update response time: ${responseTime.toFixed(2)}ms`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Admin:Feedback] Status update failed', {
            feedbackId: id,
            status: response.status,
            statusText: response.statusText,
            error: errorData.error
          });
          throw new Error(errorData.error || 'Failed to update status');
        }

        // Track performance metrics
        trackUpdatePerformance(id, performance.now() - startTime);
        
        return response.json();
      } catch (error) {
        // Enhanced error logging
        console.error('[Admin:Feedback] Error updating status', {
          feedbackId: id,
          newStatus: status,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('[Admin:Feedback] Status update successful', {
        feedbackId: feedback.id,
        newStatus: status,
        previousStatus: feedback.status !== status ? feedback.status : 'same'
      });
      
      toast({
        title: 'Status Updated',
        description: 'The feedback status has been updated successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('[Admin:Feedback] Client error handler triggered', {
        feedbackId: feedback.id,
        error: error.message
      });
      
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update feedback status.',
        variant: 'destructive',
      });
      // Reset status to previous value on error
      setStatus(feedback.status);
    },
  });

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateStatusMutation.mutate({ id: feedback.id, status: newStatus });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Feedback #{feedback.id}</CardTitle>
            <CardDescription>
              Submitted on {new Date(feedback.createdAt).toLocaleDateString()} at{' '}
              {new Date(feedback.createdAt).toLocaleTimeString()}
            </CardDescription>
          </div>
          <TypeBadge type={feedback.type} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Feedback content */}
          <div>
            <h3 className="text-lg font-medium mb-2">Feedback</h3>
            <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap">{feedback.content}</div>
          </div>

          {/* Rating */}
          {feedback.rating > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Rating</h3>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-2xl ${
                      i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({feedback.rating} out of 5)
                </span>
              </div>
            </div>
          )}

          {/* Contact info */}
          {(feedback.metadata?.name || feedback.metadata?.email) && (
            <div>
              <h3 className="text-lg font-medium mb-2">Contact Information</h3>
              <div className="space-y-1">
                {feedback.metadata?.name && (
                  <p>
                    <span className="font-medium">Name:</span> {feedback.metadata.name}
                  </p>
                )}
                {feedback.metadata?.email && (
                  <p>
                    <span className="font-medium">Email:</span> {feedback.metadata.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Technical details */}
          <div>
            <h3 className="text-lg font-medium mb-2">Technical Details</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Page:</span> {feedback.page}
              </p>
              {feedback.metadata?.browser && (
                <p>
                  <span className="font-medium">Browser:</span> {feedback.metadata.browser}
                </p>
              )}
              {feedback.metadata?.operatingSystem && (
                <p>
                  <span className="font-medium">OS:</span> {feedback.metadata.operatingSystem}
                </p>
              )}
              {feedback.metadata?.screenResolution && (
                <p>
                  <span className="font-medium">Resolution:</span> {feedback.metadata.screenResolution}
                </p>
              )}
            </div>
          </div>

          {/* Status management */}
          <div>
            <h3 className="text-lg font-medium mb-2">Status</h3>
            <div className="flex items-center space-x-4">
              <StatusBadge status={status} />
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminFeedback() {
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Debug and performance tracking for list fetch
  const logFeedbackFetch = (status: string, details: any) => {
    console.log(`[Admin:Feedback] Fetching feedback list ${status}`, details);
  };

  // Fetch feedback data with enhanced debugging
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/feedback'],
    queryFn: async () => {
      const startTime = performance.now();
      logFeedbackFetch('started', { activeTab });
      
      try {
        const response = await fetch('/api/feedback');
        
        const responseTime = performance.now() - startTime;
        console.log(`[Admin:Feedback] List fetch response time: ${responseTime.toFixed(2)}ms`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Admin:Feedback] List fetch failed', {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error
          });
          throw new Error(errorData.error || 'Failed to load feedback');
        }
        
        const data = await response.json();
        
        // Log success with summary info
        logFeedbackFetch('completed', { 
          count: data.feedback?.length || 0,
          duration: `${(performance.now() - startTime).toFixed(2)}ms`,
          statuses: data.feedback?.reduce((acc: Record<string, number>, item: FeedbackItem) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
          }, {})
        });
        
        return data.feedback;
      } catch (error) {
        // Enhanced error logging
        console.error('[Admin:Feedback] Error fetching feedback list', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
  });

  // Track tab changes for debugging
  const handleTabChange = (newTab: string) => {
    console.log('[Admin:Feedback] Tab changed', { 
      from: activeTab, 
      to: newTab
    });
    setActiveTab(newTab);
  };
  
  // Filter feedback based on the active tab with performance tracking
  const filteredFeedback = useMemo(() => {
    if (!data) return [];
    
    const startTime = performance.now();
    const filtered = data.filter((item: FeedbackItem) => (activeTab === 'all' ? true : item.status === activeTab));
    
    // Log filtering performance
    console.log('[Admin:Feedback] Filtered feedback', {
      totalItems: data.length,
      filteredItems: filtered.length,
      activeTab,
      filterTime: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    return filtered;
  }, [data, activeTab]);

  if (isLoading) {
    console.log('[Admin:Feedback] Loading feedback data', {
      timestamp: new Date().toISOString(),
      activeTab
    });
    
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading feedback...</span>
        </div>
        <p className="text-sm text-muted-foreground">
          This may take a moment while we retrieve the data
        </p>
        <div id="feedback-loading-progress" className="w-64 h-1 bg-muted rounded overflow-hidden">
          <div 
            className="h-full bg-primary animate-pulse" 
            style={{width: '60%'}}
            ref={(el) => {
              if (el) {
                // Log loading animation for debugging
                console.log('[Admin:Feedback] Loading indicator rendered');
              }
            }}
          ></div>
        </div>
      </div>
    );
  }

  if (isError) {
    // Log detailed error information for debugging
    console.error('[Admin:Feedback] Failed to load feedback data', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      time: new Date().toISOString(),
      browser: navigator.userAgent
    });

    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <h3 className="mt-2 text-xl font-bold">Error Loading Feedback</h3>
        <p className="text-muted-foreground">{(error as Error).message}</p>
        <div className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('[Admin:Feedback] Manual retry attempt');
              window.location.reload();
            }}
          >
            <Loader2 className="mr-2 h-4 w-4" />
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Feedback Management</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No feedback found in this category.</p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-muted-foreground">
                Showing {filteredFeedback.length} {activeTab !== 'all' ? activeTab : ''} feedback
                entries
              </p>

              {filteredFeedback.map((feedback: FeedbackItem) => (
                <FeedbackDetailCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}