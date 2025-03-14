import React, { useState } from 'react';
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

  // Status update mutation
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'The feedback status has been updated successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
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

  // Fetch feedback data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/feedback'],
    queryFn: async () => {
      const response = await fetch('/api/feedback');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load feedback');
      }
      
      const data = await response.json();
      return data.feedback;
    },
  });

  // Filter feedback based on the active tab
  const filteredFeedback = data
    ? data.filter((item: FeedbackItem) => (activeTab === 'all' ? true : item.status === activeTab))
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading feedback...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <h3 className="mt-2 text-xl font-bold">Error Loading Feedback</h3>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Feedback Management</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
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