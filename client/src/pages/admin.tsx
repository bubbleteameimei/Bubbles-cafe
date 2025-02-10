import { useQuery, useMutation } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LogOut, Loader2, Plus, X, Pencil, Trash2, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import PostEditor from "@/components/admin/post-editor";
import { format } from "date-fns";

export default function AdminPage() {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Enhanced authentication check with proper error handling
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/user");
        if (!response.ok) {
          toast({
            title: "Authentication Error",
            description: "Please log in to access the admin dashboard",
            variant: "destructive",
          });
          setLocation("/admin/login");
          return;
        }
        const data = await response.json();
        if (!data.isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges",
            variant: "destructive",
          });
          setLocation("/admin/login");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to verify authentication. Please try logging in again.",
          variant: "destructive",
        });
        setLocation("/admin/login");
      }
    };
    checkAuth();
  }, [setLocation, toast]);

  const { data: posts = [], isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false; // Don't retry auth failures
      }
      return failureCount < 2;
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("DELETE", `/api/posts/${postId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete post");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/logout");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to logout");
      }
    },
    onSuccess: () => {
      setLocation("/admin/login");
      toast({
        title: "Logged out",
        description: "Successfully logged out"
      });
      queryClient.clear();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const viewPost = (slug: string) => {
    window.open(`/story/${slug}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    setLocation("/admin/login");
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto space-y-8 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            {logoutMutation.isPending ? "Logging out..." : "Logout"}

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/comments"],
  });

  const moderateComment = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved })
      });
      if (!response.ok) throw new Error("Failed to moderate comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({
        title: "Comment moderated",
        description: "The comment status has been updated"
      });
    }
  });

  const deleteComment = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({
        title: "Comment deleted",
        description: "The comment has been removed"
      });
    }
  });

          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {(showEditor || editingPost) ? (
            <Card className="lg:sticky lg:top-8 h-fit">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">
                  <div className="flex items-center justify-between">
                    <span>{editingPost ? "Edit Post" : "New Post"}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowEditor(false);
                        setEditingPost(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PostEditor
                  post={editingPost}
                  onClose={() => {
                    setShowEditor(false);
                    setEditingPost(null);
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  <Button
                    onClick={() => setShowEditor(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Post
                  </Button>
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                <div className="space-y-4">
                  {posts?.map((post: Post) => (
                    <div
                      key={post.id}
                      className={`p-4 border rounded-lg transition-colors ${

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Comment Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{comment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={comment.approved ? "default" : "outline"}
                      size="sm"
                      onClick={() => moderateComment.mutate({ id: comment.id, approved: !comment.approved })}
                    >
                      {comment.approved ? "Approved" : "Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteComment.mutate(comment.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

                        editingPost?.id === post.id
                          ? "bg-primary/5 border-primary"
                          : "hover:bg-accent/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <time>{format(new Date(post.createdAt), 'MMM d, yyyy')}</time>
                            {post.isSecret && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                Secret
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewPost(post.slug)}
                            className="hover:bg-secondary/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPost(post)}
                            disabled={editingPost?.id === post.id}
                            className="hover:bg-primary/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-destructive/10"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this post?')) {
                                deletePostMutation.mutate(post.id);
                              }
                            }}
                            disabled={deletePostMutation.isPending}
                          >
                            {deletePostMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}