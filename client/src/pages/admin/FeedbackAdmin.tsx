import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedbackDetails } from '@/components/feedback/FeedbackDetails';
import { ResponseSuggestion } from '@/components/feedback/ResponsePreview';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search, RefreshCw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Types for feedback data
interface FeedbackMetadata {
  browser?: {
    name: string;
    version: string;
    userAgent: string;
  };
  device?: {
    type: string;
    model?: string;
  };
  os?: {
    name: string;
    version: string;
  };
  screen?: {
    width: number;
    height: number;
  };
  location?: {
    path: string;
    referrer?: string;
  };
  adminResponse?: {
    content: string;
    respondedAt: string;
    respondedBy: string;
  };
}

interface FeedbackItem {
  id: number;
  userId: number | null;
  email: string | null;
  subject: string;
  content: string;
  type: string;
  status: string;
  priority: string;
  contactRequested: boolean;
  createdAt: string;
  metadata: FeedbackMetadata;
}

const FeedbackAdmin = () => {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all feedback
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/feedback', statusFilter, currentPage],
    queryFn: async () => {
      const status = statusFilter !== 'all' ? statusFilter : '';
      const response = await apiRequest<{ feedback: FeedbackItem[] }>(`/api/feedback?status=${status}&page=${currentPage}&limit=${itemsPerPage}`);
      return response;
    }
  });

  // Fetch specific feedback details with AI suggestions
  const { data: feedbackDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['/api/feedback/detail', selectedFeedback?.id],
    queryFn: async () => {
      if (!selectedFeedback) return null;
      const response = await apiRequest<{
        feedback: FeedbackItem;
        responseSuggestion: ResponseSuggestion;
        alternativeSuggestions: ResponseSuggestion[];
        responseHints: string[];
      }>(`/api/feedback/${selectedFeedback.id}`);
      return response;
    },
    enabled: !!selectedFeedback,
  });

  // Update feedback status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/feedback/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      toast.success('Feedback status updated');
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      if (selectedFeedback) {
        queryClient.invalidateQueries({ queryKey: ['/api/feedback/detail', selectedFeedback.id] });
      }
    },
    onError: (error) => {
      console.error('Error updating feedback status:', error);
      toast.error('Failed to update feedback status');
    }
  });

  // Send feedback response mutation
  const sendResponseMutation = useMutation({
    mutationFn: async ({ id, response }: { id: number; response: string }) => {
      return apiRequest(`/api/feedback/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      toast.success('Response sent successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      if (selectedFeedback) {
        queryClient.invalidateQueries({ queryKey: ['/api/feedback/detail', selectedFeedback.id] });
      }
    },
    onError: (error) => {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    }
  });

  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Handle send response
  const handleSendResponse = (id: number, response: string) => {
    sendResponseMutation.mutate({ id, response });
  };

  // Filter feedback based on search query and type
  const filteredFeedback = React.useMemo(() => {
    if (!data?.feedback) return [];
    
    return data.feedback.filter(item => {
      // Apply type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }
      
      // Apply search filter to subject, content, or email
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (item.subject && item.subject.toLowerCase().includes(query)) ||
          (item.content && item.content.toLowerCase().includes(query)) ||
          (item.email && item.email.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  }, [data?.feedback, typeFilter, searchQuery]);

  // Handle pagination
  const totalPages = Math.ceil((filteredFeedback?.length || 0) / itemsPerPage);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-500 text-white',
      inProgress: 'bg-blue-500 text-white',
      resolved: 'bg-green-500 text-white',
      closed: 'bg-gray-500 text-white',
      rejected: 'bg-red-500 text-white',
      reviewed: 'bg-purple-500 text-white',
    };
    return statusColors[status] || 'bg-gray-500';
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  // Simple pagination component
  const SimplePagination = () => (
    <div className="flex justify-center items-center gap-2 mt-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <div className="flex items-center">
        <span className="text-sm">
          Page {currentPage} of {Math.max(1, totalPages)}
        </span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
        disabled={currentPage === totalPages || totalPages === 0}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Feedback Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Feedback List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
              <CardDescription>Manage user feedback submissions</CardDescription>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center">
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="flex-1 sm:max-w-[250px]"
                />
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inProgress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="w-full mb-4 grid grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="contact">Contact Requested</TabsTrigger>
                </TabsList>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : isError ? (
                  <Alert variant="destructive" className="my-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Error loading feedback: {error instanceof Error ? error.message : 'Unknown error'}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {paginatedFeedback.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No feedback items found
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedFeedback.map((item) => (
                              <TableRow 
                                key={item.id} 
                                className={`cursor-pointer ${selectedFeedback?.id === item.id ? 'bg-muted' : ''}`}
                                onClick={() => setSelectedFeedback(item)}
                              >
                                <TableCell className="font-medium truncate max-w-[160px]">
                                  {item.subject}
                                  {item.contactRequested && (
                                    <Badge variant="outline" className="ml-2 text-xs">Contact</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(item.status)}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  {formatDate(item.createdAt)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    {totalPages > 1 && <SimplePagination />}
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Panel: Feedback Details */}
        <div className="lg:col-span-2">
          {!selectedFeedback ? (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No Feedback Selected</h3>
                <p className="text-muted-foreground mb-4">Select a feedback item from the list to view details</p>
              </div>
            </Card>
          ) : isLoadingDetail ? (
            <Card className="h-full flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Loading feedback details...</p>
            </Card>
          ) : (
            <FeedbackDetails
              feedback={{
                ...selectedFeedback,
                ...feedbackDetail?.feedback,
              }}
              onStatusChange={handleStatusChange}
              onSendResponse={handleSendResponse}
              responseSuggestion={feedbackDetail?.responseSuggestion}
              alternativeSuggestions={feedbackDetail?.alternativeSuggestions || []}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackAdmin;