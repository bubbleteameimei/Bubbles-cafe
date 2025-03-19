import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MessageCircle, 
  Calendar, 
  User, 
  Mail, 
  Clock, 
  Globe,
  Monitor, 
  Smartphone, 
  Tag, 
  CornerDownRight,
  Send,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { UserFeedback } from '@shared/schema';
import { ResponsePreview, ResponseSuggestion } from './ResponsePreview';
import { apiRequest } from '@/lib/queryClient';

// Additional interfaces
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

interface FeedbackWithMetadata extends UserFeedback {
  metadata: FeedbackMetadata;
  subject: string;
  email: string | null;
  contactRequested: boolean;
}

interface FeedbackDetailsProps {
  feedback: FeedbackWithMetadata;
  onStatusChange?: (id: number, status: string) => void;
  onSendResponse?: (id: number, response: string) => void;
  className?: string;
  responseSuggestion?: ResponseSuggestion;
  alternativeSuggestions?: ResponseSuggestion[];
}

export function FeedbackDetails({ 
  feedback, 
  onStatusChange, 
  onSendResponse,
  className = '',
  responseSuggestion,
  alternativeSuggestions = []
}: FeedbackDetailsProps) {
  const [response, setResponse] = useState(
    feedback.metadata?.adminResponse?.content || ''
  );
  const [status, setStatus] = useState(feedback.status);
  const [isSending, setIsSending] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ResponseSuggestion | null>(
    responseSuggestion || null
  );
  
  // Status color mapping
  const statusColorMap: Record<string, string> = {
    pending: 'bg-yellow-500 text-white',
    inProgress: 'bg-blue-500 text-white',
    resolved: 'bg-green-500 text-white',
    closed: 'bg-gray-500 text-white',
    rejected: 'bg-red-500 text-white',
    reviewed: 'bg-purple-500 text-white'
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatus(value);
    if (onStatusChange) {
      onStatusChange(feedback.id, value);
    }
  };

  // Handle response suggestion selection
  const handleSuggestionSelect = (suggestion: ResponseSuggestion) => {
    setSelectedSuggestion(suggestion);
    setResponse(suggestion.suggestion);
  };

  // Send response
  const handleSendResponse = async () => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setIsSending(true);
    try {
      // Call API to send response
      await apiRequest(`/api/feedback/${feedback.id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Response sent successfully');
      if (onSendResponse) {
        onSendResponse(feedback.id, response);
      }
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setIsSending(false);
    }
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

  // Handle device type icon
  const getDeviceIcon = () => {
    const deviceType = feedback.metadata?.device?.type?.toLowerCase() || '';
    if (deviceType.includes('mobile') || deviceType.includes('phone')) {
      return <Smartphone className="h-4 w-4 mr-1" />;
    }
    return <Monitor className="h-4 w-4 mr-1" />;
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{feedback.subject}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(feedback.createdAt)}
              {feedback.metadata?.location?.path && (
                <>
                  <Globe className="h-4 w-4 ml-3 mr-1" />
                  <span title={feedback.metadata.location.path} className="truncate max-w-[200px]">
                    {feedback.metadata.location.path}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
          <Badge className={statusColorMap[status] || 'bg-gray-500'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="user-info">User Info</TabsTrigger>
            <TabsTrigger value="tech-info">Technical Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
              {feedback.content}
            </div>
            
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="text-sm font-medium">Type:</span>
              <Badge variant="secondary">
                {feedback.type}
              </Badge>
            </div>
            
            {/* Admin Response Section (if exists) */}
            {feedback.metadata?.adminResponse && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <CornerDownRight className="h-4 w-4 mr-1" />
                  Response ({formatDate(feedback.metadata.adminResponse.respondedAt)})
                </h4>
                <div className="bg-primary/10 p-3 rounded-md text-sm">
                  {feedback.metadata.adminResponse.content}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="user-info" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">User ID:</span>
                  <span className="ml-2 text-sm">
                    {feedback.userId || 'Anonymous'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Email:</span>
                  <span className="ml-2 text-sm">
                    {feedback.email || 'Not provided'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Submitted:</span>
                  <span className="ml-2 text-sm">
                    {formatDate(feedback.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Contact Requested:</span>
                  <span className="ml-2 text-sm">
                    {feedback.contactRequested ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tech-info" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  {getDeviceIcon()}
                  <span className="text-sm font-medium">Device:</span>
                  <span className="ml-2 text-sm">
                    {feedback.metadata?.device?.type || 'Unknown'} 
                    {feedback.metadata?.device?.model ? ` (${feedback.metadata.device.model})` : ''}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm font-medium ml-6">OS:</span>
                  <span className="ml-2 text-sm">
                    {feedback.metadata?.os?.name || 'Unknown'} 
                    {feedback.metadata?.os?.version ? ` ${feedback.metadata.os.version}` : ''}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm font-medium ml-6">Browser:</span>
                  <span className="ml-2 text-sm">
                    {feedback.metadata?.browser?.name || 'Unknown'} 
                    {feedback.metadata?.browser?.version ? ` ${feedback.metadata.browser.version}` : ''}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Screen:</span>
                  <span className="ml-2 text-sm">
                    {feedback.metadata?.screen?.width && feedback.metadata?.screen?.height
                      ? `${feedback.metadata.screen.width} x ${feedback.metadata.screen.height}`
                      : 'Unknown'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm font-medium">Referrer:</span>
                  <span className="ml-2 text-sm truncate max-w-[200px]">
                    {feedback.metadata?.location?.referrer || 'Direct'}
                  </span>
                </div>
              </div>
            </div>
            
            {feedback.metadata?.browser?.userAgent && (
              <div className="mt-2">
                <span className="text-xs font-medium">User Agent:</span>
                <div className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                  {feedback.metadata.browser.userAgent}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Response Suggestions (only visible to admins) */}
        {(responseSuggestion || alternativeSuggestions.length > 0) && (
          <div className="mt-6">
            <ResponsePreview
              feedbackId={feedback.id}
              initialSuggestion={responseSuggestion || alternativeSuggestions[0]}
              alternativeSuggestions={alternativeSuggestions}
              onSelect={handleSuggestionSelect}
            />
          </div>
        )}
        
        {/* Response Form (only for admins) */}
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Update Status
            </label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inProgress">In Progress</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="response" className="block text-sm font-medium mb-1">
              Response
            </label>
            <Textarea
              id="response"
              value={response}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponse(e.target.value)}
              placeholder="Type your response here..."
              className="min-h-[120px]"
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => setResponse('')}
          disabled={!response || isSending}
        >
          Clear
        </Button>
        <Button 
          onClick={handleSendResponse}
          disabled={!response || isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Response
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}