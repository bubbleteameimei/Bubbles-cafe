import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Post, Comment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Trash2, ThumbsUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !user?.isAdmin) {
      navigate("/admin/login");
    }
  }, [user, authLoading, navigate]);

  // If auth is still loading, show loading state
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not admin, don't render anything while redirecting
  if (!user?.isAdmin) {
    return null;
  }

  // Fetch pending posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts/pending"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/posts/pending");
      const data = await res.json();
      return data || [];
    },
    enabled: !!user?.isAdmin,
  });

  // Fetch pending comments
  const { data: pendingComments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/comments/pending"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/comments/pending");
      const data = await res.json();
      return data || [];
    },
    enabled: !!user?.isAdmin,
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("DELETE", `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/pending"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  // Approve comment mutation
  const approveCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("PATCH", `/api/comments/${commentId}`, { approved: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Success",
        description: "Comment approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve comment",
        variant: "destructive",
      });
    },
  });


  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-semibold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="posts">Pending Posts</TabsTrigger>
          <TabsTrigger value="comments">Pending Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {postsLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.length > 0 ? (
                posts.map((post: Post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <h3 className="text-xl font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{post.excerpt}</p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePostMutation.mutate(post.id)}
                        disabled={deletePostMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Post
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No pending posts.</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          {commentsLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6">
              {pendingComments.length > 0 ? (
                pendingComments.map((comment: Comment) => (
                  <Card key={comment.id}>
                    <CardHeader>
                      <h3 className="font-semibold">{comment.author}</h3>
                      <p className="text-sm text-muted-foreground">
                        Posted: {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{comment.content}</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => approveCommentMutation.mutate(comment.id)}
                        disabled={approveCommentMutation.isPending}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No pending comments.</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}