import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  MessageSquare, 
  ChevronDown,
  ChevronUp,
  Calendar,
  Star,
  Mail,
  Link2,
  Smartphone,
  Laptop,
  User,
  Menu,
  Eye,
  FileText,
  HelpCircle,
  Bug
} from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

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

// Timeline item component for feedback
function FeedbackTimelineItem({ 
  feedback, 
  onStatusChange 
}: { 
  feedback: FeedbackItem; 
  onStatusChange: (id: number, status: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState(feedback.status);

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onStatusChange(feedback.id, newStatus);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'reviewed':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get icon for feedback type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <Bug className="h-4 w-4 text-red-500" />;
      case 'feature':
        return <Star className="h-4 w-4 text-purple-500" />;
      case 'content':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'general':
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex gap-x-3">
      <div className="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700">
        <div className="relative z-10 size-7 flex justify-center items-center">
          <span className={`size-7 flex justify-center items-center rounded-full ${
            status === 'pending' ? 'bg-yellow-500/10' :
            status === 'reviewed' ? 'bg-blue-500/10' :
            status === 'resolved' ? 'bg-green-500/10' : 
            status === 'rejected' ? 'bg-red-500/10' : 'bg-gray-500/10'
          }`}>
            {getStatusIcon(status)}
          </span>
        </div>
      </div>
      
      <div className="grow pt-0.5 pb-8">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center">
                  {getTypeIcon(feedback.type)}
                  <span className="ml-2">Feedback #{feedback.id}</span>
                </CardTitle>
                <CardDescription>
                  Submitted {format(new Date(feedback.createdAt), 'MMM d, yyyy')} at{' '}
                  {format(new Date(feedback.createdAt), 'h:mm a')}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <TypeBadge type={feedback.type} />
                <StatusBadge status={status} />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pb-3">
            <div>
              <div className="line-clamp-2 text-sm">
                {feedback.content}
              </div>
              {!isExpanded && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 h-8 text-xs" 
                  onClick={() => setIsExpanded(true)}
                >
                  Show more <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
            
            {isExpanded && (
              <div className="space-y-4 mt-4 border-t pt-4">
                {/* Full feedback content */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Details</h3>
                  <div className="p-3 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm">
                    {feedback.content}
                  </div>
                </div>
                
                {/* Rating */}
                {feedback.rating > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Rating</h3>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({feedback.rating} out of 5)
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Contact info */}
                {(feedback.metadata?.name || feedback.metadata?.email) && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                    <div className="space-y-1 text-sm">
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
                  <h3 className="text-sm font-medium mb-2">Technical Details</h3>
                  <div className="space-y-1 text-xs text-muted-foreground">
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
                  <h3 className="text-sm font-medium mb-2">Update Status</h3>
                  <div className="flex items-center space-x-2">
                    <Select value={status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="h-8 w-[140px] text-xs">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs" 
                      onClick={() => setIsExpanded(false)}
                    >
                      Collapse <ChevronUp className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Group feedback items by date for timeline display
function groupFeedbackByDate(feedback: FeedbackItem[]): Record<string, FeedbackItem[]> {
  const grouped: Record<string, FeedbackItem[]> = {};
  
  feedback.forEach(item => {
    try {
      const date = format(new Date(item.createdAt), 'MMM d, yyyy');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    } catch (error) {
      // Handle invalid dates
      const fallback = 'Undated';
      if (!grouped[fallback]) {
        grouped[fallback] = [];
      }
      grouped[fallback].push(item);
    }
  });
  
  return grouped;
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
function FeedbackDetailCard({ 
  feedback, 
  onStatusChange 
}: { 
  feedback: FeedbackItem;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [status, setStatus] = useState(feedback.status);

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onStatusChange(feedback.id, newStatus);
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

  // Debug and performance tracking
  const logStatusUpdate = (id: number, newStatus: string) => {
    console.log('[Admin:Feedback] Status update attempt', {
      feedbackId: id,
      newStatus: newStatus,
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

  // Status update mutation for timeline items
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
      toast({
        title: 'Status Updated',
        description: 'The feedback status has been updated successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('[Admin:Feedback] Client error handler triggered', {
        error: error.message
      });
      
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update feedback status.',
        variant: 'destructive',
      });
    },
  });

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
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">No {activeTab !== 'all' ? activeTab : ''} feedback found</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Showing {filteredFeedback.length} {activeTab !== 'all' ? activeTab : ''} feedback entries
                </h3>
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>
              
              {/* Timeline view */}
              {Object.entries(groupFeedbackByDate(filteredFeedback)).map(([date, items]) => (
                <div key={date} className="space-y-4">
                  {/* Date heading */}
                  <div className="ps-2 my-4 first:mt-0">
                    <h3 className="text-xs font-medium uppercase text-gray-500 dark:text-neutral-400 flex items-center">
                      <Calendar className="mr-2 h-3 w-3" />
                      {date}
                    </h3>
                  </div>
                  
                  {/* Feedback items for this date */}
                  {items.map(item => (
                    <FeedbackTimelineItem 
                      key={item.id} 
                      feedback={item} 
                      onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}