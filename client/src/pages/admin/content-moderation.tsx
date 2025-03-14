import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportedContent } from "@shared/schema";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ArrowUpRight, 
  Calendar, 
  Filter,
  Search,
  RefreshCcw,
  Shield,
  MessageSquare,
  Flag,
  UserX,
  Ban,
  MoreHorizontal,
  Clock,
  FileText,
  Loader2,
  User,
  Activity,
  History
} from "lucide-react";

// Extended interface to include additional properties needed for the UI
interface ExtendedReportedContent extends ReportedContent {
  details?: string;
  contentPreview?: string;
  updatedAt?: string;
}
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Generate different UI and badge colors based on content types
const getContentTypeDetails = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'post':
    case 'story':
      return { 
        icon: <FileText className="h-5 w-5" />, 
        color: 'bg-blue-500/10 text-blue-500',
        label: 'Story Content'
      };
    case 'comment':
      return { 
        icon: <MessageSquare className="h-5 w-5" />, 
        color: 'bg-green-500/10 text-green-500',
        label: 'Comment'
      };
    case 'user':
      return { 
        icon: <UserX className="h-5 w-5" />, 
        color: 'bg-red-500/10 text-red-500',
        label: 'User Report'
      };
    default:
      return { 
        icon: <Flag className="h-5 w-5" />, 
        color: 'bg-yellow-500/10 text-yellow-500',
        label: type || 'Other Content'
      };
  }
};

// Generate different UI based on reason
const getReasonDetails = (reason: string) => {
  switch (reason?.toLowerCase()) {
    case 'spam':
      return { 
        color: 'bg-amber-500/10 text-amber-500',
        label: 'Spam'
      };
    case 'harassment':
    case 'bullying':
      return { 
        color: 'bg-red-500/10 text-red-500',
        label: reason
      };
    case 'inappropriate':
    case 'explicit':
      return { 
        color: 'bg-purple-500/10 text-purple-500',
        label: 'Inappropriate'
      };
    case 'violence':
      return { 
        color: 'bg-red-700/10 text-red-700',
        label: 'Violence'
      };
    case 'hate speech':
      return { 
        color: 'bg-red-800/10 text-red-800',
        label: 'Hate Speech'
      };
    case 'misinformation':
      return { 
        color: 'bg-orange-500/10 text-orange-500',
        label: 'Misinformation'
      };
    default:
      return { 
        color: 'bg-slate-500/10 text-slate-500',
        label: reason || 'Other'
      };
  }
};

// Track moderation activity statistics
const activityStats = {
  pendingReports: 0,
  approvedReports: 0,
  rejectedReports: 0,
  moderatedToday: 0,
  averageResponseTime: "4.2h"
};

interface ContentDetailProps {
  content: ExtendedReportedContent;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

function ContentDetailView({ content, onClose, onApprove, onReject }: ContentDetailProps) {
  const contentType = getContentTypeDetails(content.contentType);
  const reason = getReasonDetails(content.reason);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {contentType.icon}
        <h3 className="text-lg font-semibold">Reported {contentType.label}</h3>
        <Badge variant="outline" className={reason.color}>
          {reason.label}
        </Badge>
      </div>

      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Report Details</h4>
          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Report ID</p>
              <p className="font-medium">{content.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Content ID</p>
              <p className="font-medium">{content.contentId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reported By</p>
              <p className="font-medium">User #{content.reporterId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reported On</p>
              <p className="font-medium">{new Date(content.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Description</h4>
          <div className="rounded-lg border p-4">
            <p className="text-sm">{content.details || "No additional details provided."}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Content Preview</h4>
          <div className="rounded-lg border p-4 max-h-[200px] overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">{content.contentPreview || "Content preview not available."}</p>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onReject} 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 dark:hover:text-red-300"
          >
            <Ban className="mr-2 h-4 w-4" />
            Reject Content
          </Button>
          <Button 
            onClick={onApprove}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Content
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
}

export default function ContentModerationPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByType, setFilterByType] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedContent, setSelectedContent] = useState<ExtendedReportedContent | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: reportedContent, isLoading, refetch } = useQuery<ExtendedReportedContent[]>({
    queryKey: ['/api/moderation/reported-content'],
    queryFn: async () => {
      const response = await fetch('/api/moderation/reported-content');
      if (!response.ok) throw new Error('Failed to fetch reported content');
      return response.json();
    }
  });
  
  const { data: pendingComments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ['/api/comments/pending'],
    queryFn: async () => {
      const response = await fetch('/api/comments/pending');
      if (!response.ok) throw new Error('Failed to fetch pending comments');
      return response.json();
    }
  });
  
  const { data: activityLogs, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/activity'],
    queryFn: async () => {
      const response = await fetch('/api/admin/activity');
      if (!response.ok) throw new Error('Failed to fetch activity data');
      return response.json();
    },
    enabled: activeTab === 'activity', // Only fetch when activity tab is active
  });

  const updateContentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/moderation/reported-content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update content status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/reported-content'] });
      setViewDialogOpen(false);
      toast({
        title: "Content Updated",
        description: "The content status has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter content based on search term, type and status
  const filteredContent = reportedContent?.filter(content => {
    const matchesSearch = searchTerm === "" || 
      content.contentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (content.details && content.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterByType === "all" || content.contentType === filterByType;
    const matchesStatus = content.status === activeTab;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle approval or rejection from detail view
  const handleApproveFromDetail = () => {
    if (selectedContent) {
      updateContentStatus.mutate({
        id: selectedContent.id,
        status: 'approved'
      });
    }
  };

  const handleRejectFromDetail = () => {
    if (selectedContent) {
      updateContentStatus.mutate({
        id: selectedContent.id,
        status: 'rejected'
      });
    }
  };

  // Calculate stats for display
  if (reportedContent) {
    activityStats.pendingReports = reportedContent.filter(c => c.status === 'pending').length;
    activityStats.approvedReports = reportedContent.filter(c => c.status === 'approved').length;
    activityStats.rejectedReports = reportedContent.filter(c => c.status === 'rejected').length;
    
    // Calculate how many were moderated today
    const today = new Date().setHours(0, 0, 0, 0);
    activityStats.moderatedToday = reportedContent.filter(c => 
      (c.status === 'approved' || c.status === 'rejected') && 
      new Date(c.updatedAt || c.createdAt).getTime() >= today
    ).length;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
          <p className="text-muted-foreground">
            Review and moderate reported content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="default" size="sm">
            <Shield className="mr-2 h-4 w-4" />
            Moderation Guidelines
          </Button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.pendingReports}</div>
            <div className="text-xs text-muted-foreground">
              Needs review
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Content</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.approvedReports}</div>
            <div className="text-xs text-muted-foreground">
              Reports dismissed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Content</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.rejectedReports}</div>
            <div className="text-xs text-muted-foreground">
              Content removed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderated Today</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.moderatedToday}</div>
            <div className="text-xs text-muted-foreground">
              Avg. response time: {activityStats.averageResponseTime}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation Queue</CardTitle>
          <CardDescription>Review reported content from the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by type, reason, or details..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex w-full items-center space-x-2 md:w-auto">
              <Select
                value={filterByType}
                onValueChange={setFilterByType}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="user">User Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs 
            defaultValue="pending" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-6"
          >
            <div className="overflow-x-auto pb-2">
              <TabsList className="w-auto inline-flex">
                <TabsTrigger value="pending" className="relative">
                  Pending Review
                  {activityStats.pendingReports > 0 && (
                    <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                      {activityStats.pendingReports}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="activity">
                  <History className="mr-1.5 h-3.5 w-3.5" />
                  Activity History
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tabs Content */}
            <TabsContent value={activeTab} className="mt-6">
              {activeTab === 'activity' ? (
                activityLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !activityLogs || activityLogs.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">No moderation activity found</p>
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Moderation Activity History</CardTitle>
                      <CardDescription>
                        Timeline of recent moderation actions and system activities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px] pr-4">
                        <ActivityTimeline 
                          activities={activityLogs} 
                          initialCollapsed={false}
                        />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )
              ) : filteredContent && filteredContent.length > 0 ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {filteredContent.map((content) => {
                      const contentType = getContentTypeDetails(content.contentType);
                      const reason = getReasonDetails(content.reason);
                      
                      return (
                        <Card key={content.id} className="p-4 hover:bg-muted/40 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className={`flex items-center justify-center rounded-full w-8 h-8 ${contentType.color.split(' ')[0]}`}>
                                  {contentType.icon}
                                </div>
                                <div>
                                  <h3 className="font-medium">
                                    {contentType.label} #{content.contentId}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    Reported on {new Date(content.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge className={reason.color}>
                                  {reason.label}
                                </Badge>
                              </div>
                              
                              <p className="text-sm line-clamp-2">
                                {content.details || "No additional details provided"}
                              </p>
                              
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3" />
                                Reported by User #{content.reporterId}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 self-end md:self-start">
                              <Dialog open={viewDialogOpen && selectedContent?.id === content.id} onOpenChange={(open) => {
                                if (!open) setViewDialogOpen(false);
                              }}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedContent(content);
                                      setViewDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Content Review</DialogTitle>
                                    <DialogDescription>
                                      Review reported content details and make a moderation decision.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {selectedContent && (
                                    <ContentDetailView 
                                      content={selectedContent}
                                      onClose={() => setViewDialogOpen(false)}
                                      onApprove={handleApproveFromDetail}
                                      onReject={handleRejectFromDetail}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              {content.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateContentStatus.mutate({
                                        id: content.id,
                                        status: 'approved'
                                      })
                                    }
                                    className="text-green-600 hidden md:flex"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateContentStatus.mutate({
                                        id: content.id,
                                        status: 'rejected'
                                      })
                                    }
                                    className="text-red-600 hidden md:flex"
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => window.open(`/content/${content.contentId}`, '_blank')}
                                    className="flex items-center"
                                  >
                                    <ArrowUpRight className="mr-2 h-4 w-4" />
                                    Open Content
                                  </DropdownMenuItem>
                                  
                                  {content.status === 'pending' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          updateContentStatus.mutate({
                                            id: content.id,
                                            status: 'approved'
                                          })
                                        }
                                        className="text-green-600 md:hidden"
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          updateContentStatus.mutate({
                                            id: content.id,
                                            status: 'rejected'
                                          })
                                        }
                                        className="text-red-600 md:hidden"
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">No {activeTab !== 'all' ? activeTab : ''} content found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {activeTab === 'activity' 
              ? `${activityLogs?.length || 0} activity entries found`
              : `${filteredContent?.length || 0} items found`}
          </p>
          <div className="flex items-center">
            {updateContentStatus.isPending && (
              <div className="flex items-center mr-2">
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Pending Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Comments Review</CardTitle>
          <CardDescription>User comments awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          {commentsLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : pendingComments && pendingComments.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {pendingComments.map((comment: any) => (
                  <Card key={comment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {comment.userId ? `User #${comment.userId}` : 'Anonymous'}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">
                            {comment.content}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            Posted {new Date(comment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Implement comment approval
                            toast({
                              title: "Comment Approved",
                              description: "The comment has been approved and is now visible.",
                            });
                          }}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Implement comment rejection
                            toast({
                              title: "Comment Rejected",
                              description: "The comment has been rejected and removed.",
                            });
                          }}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">No pending comments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}