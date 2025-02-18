import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportedContent } from "@shared/schema";
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function ContentModerationPage() {
  const { toast } = useToast();

  const { data: reportedContent, isLoading } = useQuery<ReportedContent[]>({
    queryKey: ['/api/moderation/reported-content'],
    queryFn: async () => {
      const response = await fetch('/api/moderation/reported-content');
      if (!response.ok) throw new Error('Failed to fetch reported content');
      return response.json();
    }
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
      toast({
        title: "Content Updated",
        description: "The content status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Content Moderation Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            {['pending', 'approved', 'rejected'].map((status) => (
              <TabsContent key={status} value={status}>
                <div className="space-y-4">
                  {reportedContent
                    ?.filter((content) => content.status === status)
                    .map((content) => (
                      <Card key={content.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                              <h3 className="font-semibold">
                                Reported {content.contentType}
                              </h3>
                              <Badge>{content.reason}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Reported by: User #{content.reporterId}
                            </p>
                            <p className="text-sm">
                              Content ID: {content.contentId}
                            </p>
                          </div>
                          {status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateContentStatus.mutate({
                                    id: content.id,
                                    status: 'approved'
                                  })
                                }
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
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
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  {reportedContent?.filter((content) => content.status === status)
                    .length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No {status} content found
                    </p>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
