import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, MessageSquare, CheckCircle, XCircle, RefreshCw, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
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

// Type badge component
const TypeBadge = ({ type }: { type: string }) => {
  const typeColors = {
    bug: 'bg-red-100 text-red-800 border-red-200',
    feature: 'bg-purple-100 text-purple-800 border-purple-200',
    general: 'bg-blue-100 text-blue-800 border-blue-200',
    content: 'bg-green-100 text-green-800 border-green-200',
  };

  const color = typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';

  return <Badge variant="outline" className={color}>{type}</Badge>;
};

// Feedback detail component
const FeedbackDetail = ({ feedback, onStatusChange }: any) => {
  if (!feedback) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Feedback #{feedback.id}</CardTitle>
          <div className="flex gap-2">
            <TypeBadge type={feedback.type} />
            <StatusBadge status={feedback.status} />
          </div>
        </div>
        <CardDescription>
          Submitted {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
          {feedback.userId && <span> by User #{feedback.userId}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Content:</h3>
          <p className="text-sm bg-gray-50 p-3 rounded">{feedback.content}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Page:</h3>
            <p className="text-sm">{feedback.page}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Category:</h3>
            <p className="text-sm">{feedback.category}</p>
          </div>
        </div>
        
        <div className="border rounded p-3 bg-gray-50">
          <h3 className="text-sm font-medium mb-2">System Information:</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Browser:</span> {feedback.browser}
            </div>
            <div>
              <span className="font-medium">OS:</span> {feedback.operatingSystem}
            </div>
            <div>
              <span className="font-medium">Resolution:</span> {feedback.screenResolution}
            </div>
          </div>
        </div>
        
        {feedback.metadata && Object.keys(feedback.metadata).length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-1">Additional Information:</h3>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(feedback.metadata, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="flex items-center">
          <Label htmlFor="status" className="mr-2">
            Update Status:
          </Label>
          <Select
            value={feedback.status}
            onValueChange={(value) => onStatusChange(feedback.id, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    </Card>
  );
};

export function AdminFeedbackDashboard() {
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all feedback
  const { data: feedbackData, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/feedback'],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/feedback${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      return response.json();
    },
  });

  // Mutation for updating feedback status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/feedback/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the feedback query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      toast({
        title: "Status Updated",
        description: "Feedback status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update feedback status.",
        variant: "destructive",
      });
    },
  });

  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Filter feedback by status
  const filteredFeedback = statusFilter === 'all' 
    ? feedbackData?.feedback 
    : feedbackData?.feedback?.filter((item: any) => item.status === statusFilter);

  // Set first feedback as selected when data loads
  useEffect(() => {
    if (filteredFeedback && filteredFeedback.length > 0 && !selectedFeedback) {
      setSelectedFeedback(filteredFeedback[0]);
    }
  }, [filteredFeedback]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-700 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p>There was a problem loading the feedback data. Please try again.</p>
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
    );
  }

  // Empty state
  if (!filteredFeedback || filteredFeedback.length === 0) {
    return (
      <div>
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Feedback Dashboard</h2>
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              No Feedback Found
            </CardTitle>
            <CardDescription>
              {statusFilter === 'all' 
                ? "There is no feedback submitted yet." 
                : `There is no feedback with status "${statusFilter}".`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-gray-500">
              When users submit feedback, it will appear here. You can filter feedback by status using the dropdown above.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: feedbackData?.feedback?.length || 0,
    pending: feedbackData?.feedback?.filter((item: any) => item.status === 'pending').length || 0,
    reviewed: feedbackData?.feedback?.filter((item: any) => item.status === 'reviewed').length || 0,
    resolved: feedbackData?.feedback?.filter((item: any) => item.status === 'resolved').length || 0,
    rejected: feedbackData?.feedback?.filter((item: any) => item.status === 'rejected').length || 0,
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Feedback Dashboard</h2>
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 overflow-auto">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Feedback List</CardTitle>
              <CardDescription>
                {filteredFeedback.length} {filteredFeedback.length === 1 ? 'item' : 'items'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedback.map((feedback: any) => (
                      <TableRow 
                        key={feedback.id}
                        className={`cursor-pointer ${selectedFeedback?.id === feedback.id ? 'bg-gray-100' : ''}`}
                        onClick={() => setSelectedFeedback(feedback)}
                      >
                        <TableCell>{feedback.id}</TableCell>
                        <TableCell>
                          <TypeBadge type={feedback.type} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={feedback.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {selectedFeedback ? (
            <FeedbackDetail 
              feedback={selectedFeedback} 
              onStatusChange={handleStatusChange}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Feedback Selected</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Select feedback from the list to view details.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}