import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Post, Comment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Trash2, ThumbsUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const queryClient = useQueryClient();

  // Fetch posts
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/admin/posts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/posts");
      return res.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Fetch pending comments
  const { data: pendingComments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/admin/comments/pending"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/comments/pending");
      return res.json();
    },
    enabled: !!user?.isAdmin,
  });

  const handleDeletePost = async (postId: number) => {
    try {
      await apiRequest("DELETE", `/api/admin/posts/${postId}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({
        title: "Success",
        description: "The post has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await apiRequest("DELETE", `/api/admin/comments/${commentId}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/comments/pending"] });
      toast({
        title: "Success",
        description: "The comment has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveComment = async (commentId: number) => {
    try {
      await apiRequest("PATCH", `/api/admin/comments/${commentId}`, { approved: true });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/comments/pending"] });
      toast({
        title: "Success",
        description: "The comment has been approved and is now visible.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-semibold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="posts">Manage Posts</TabsTrigger>
          <TabsTrigger value="comments">Pending Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {postsLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6">
              {posts?.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{post.excerpt}</p>
                    <div className="mt-2 flex gap-2 text-sm text-muted-foreground">
                      <span>👍 {post.likesCount}</span>
                      <span>👎 {post.dislikesCount}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Post
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {posts?.length === 0 && (
                <p className="text-center text-muted-foreground">No posts found.</p>
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
              {pendingComments?.map((comment) => (
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
                      onClick={() => handleApproveComment(comment.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {pendingComments?.length === 0 && (
                <p className="text-center text-muted-foreground">No pending comments.</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}