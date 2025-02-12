import { useMutation, useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function CommunityModeration() {
  const { toast } = useToast();

  const { data: pendingPosts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/pending"],
    queryFn: async () => {
      const response = await fetch("/api/posts/pending");
      if (!response.ok) throw new Error("Failed to fetch pending posts");
      return response.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("PATCH", `/api/posts/${postId}/approve`, { isApproved: true });
      if (!response.ok) throw new Error("Failed to approve post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/pending"] });
      toast({
        title: "Story approved",
        description: "The story has been approved and is now visible to the community."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve story",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("DELETE", `/api/posts/${postId}`);
      if (!response.ok) throw new Error("Failed to reject post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/pending"] });
      toast({
        title: "Story rejected",
        description: "The story has been removed from the pending queue."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject story",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Community Stories Moderation</h2>
      {(!pendingPosts || pendingPosts.length === 0) ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-muted-foreground">
              <p>No pending stories to moderate</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        pendingPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{post.title}</span>
                <span className="text-sm text-muted-foreground">
                  Submitted {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none mb-6">
                <p className="line-clamp-3">{post.excerpt}</p>
              </div>
              
              {post.triggerWarnings && post.triggerWarnings.length > 0 && (
                <div className="flex items-center gap-2 text-yellow-500 mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    Content warnings: {post.triggerWarnings.join(", ")}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => rejectMutation.mutate(post.id)}
                  disabled={rejectMutation.isPending || approveMutation.isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => approveMutation.mutate(post.id)}
                  disabled={rejectMutation.isPending || approveMutation.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
