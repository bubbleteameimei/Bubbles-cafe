import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Post, Comment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Trash2, ThumbsUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalUsers: number;
  totalStories: number;
  totalComments: number;
  pendingStories: number;
  pendingComments: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/stats");
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Fetch pending posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts/pending"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/posts/pending");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    enabled: !!user?.isAdmin,
    retry: false,
  });

  // Fetch pending comments
  const { data: pendingComments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/comments/pending"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/comments/pending");
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: !!user?.isAdmin,
    retry: false,
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("DELETE", `/api/posts/${postId}`);
      if (!res.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/pending"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("DELETE", `/api/comments/${commentId}`);
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  // Approve comment mutation
  const approveCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("PATCH", `/api/comments/${commentId}`, { approved: true });
      if (!res.ok) throw new Error("Failed to approve comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Success",
        description: "Comment approved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve comment",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !user?.isAdmin) {
      navigate("/admin/login");
    }
  }, [user?.isAdmin, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Moderation</TabsTrigger>
          <TabsTrigger value="comments">Comment Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-sm font-medium">Total Users</h3>
              <div className="mt-2 text-2xl font-bold">
                {stats ? stats.totalUsers.toLocaleString() : <Skeleton className="h-8 w-20" />}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Total Stories</h3>
              <div className="mt-2 text-2xl font-bold">
                {stats ? stats.totalStories.toLocaleString() : <Skeleton className="h-8 w-20" />}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Pending Reviews</h3>
              <div className="mt-2 text-2xl font-bold">
                {stats ? (
                  <>
                    <span className="text-orange-500">{stats.pendingStories}</span>
                    <span className="text-sm text-muted-foreground ml-2">stories</span>
                    <span className="text-orange-500 ml-4">{stats.pendingComments}</span>
                    <span className="text-sm text-muted-foreground ml-2">comments</span>
                  </>
                ) : (
                  <Skeleton className="h-8 w-20" />
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
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

        <TabsContent value="comments" className="space-y-4">
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