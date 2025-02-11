import { useQuery, useMutation } from "@tanstack/react-query";
import { type Post, type Comment } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LogOut, Loader2, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import PostEditor from "@/components/admin/post-editor";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
}

const AdminPage = () => {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/user', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          setLocation("/admin/login");
          return;
        }

        const data = await response.json();
        if (!data.isAdmin) {
          toast({
            title: "Access Denied",
            description: "You need admin privileges to access this page",
            variant: "destructive",
          });
          setLocation("/admin/login");
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        setLocation("/admin/login");
      }
    };

    checkAuth();
  }, [setLocation, toast]);

  const { data: postsData, isLoading: postsLoading } = useQuery<PostsResponse>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const response = await fetch('/api/posts?page=1&limit=50', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      return {
        posts: Array.isArray(data.posts) ? data.posts : [],
        hasMore: !!data.hasMore
      };
    },
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  const { data: pendingComments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["/api/comments/pending"],
    queryFn: async () => {
      const response = await fetch('/api/comments/pending', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch pending comments');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    retry: 1,
    refetchInterval: 30000
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      try {
        console.log('[Admin] Starting delete mutation for post:', postId);
        const response = await apiRequest("DELETE", `/api/posts/${postId}`, {credentials: 'include'});

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Admin] Delete post error:', errorData);
          throw new Error(errorData.message || "Failed to delete post");
        }

        return postId;
      } catch (error) {
        console.error('[Admin] Delete post error:', error);
        throw error;
      }
    },
    onSuccess: (deletedPostId) => {
      console.log('[Admin] Post deleted successfully:', deletedPostId);
      // Update the posts query data to remove the deleted post
      queryClient.setQueriesData<PostsResponse>(["/api/posts"], (oldData) => {
        if (!oldData) return { posts: [], hasMore: false };
        return {
          ...oldData,
          posts: oldData.posts.filter(post => post.id !== deletedPostId)
        };
      });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error('[Admin] Post deletion error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
      if (error.message.includes("Unauthorized")) {
        setLocation("/admin/login");
      }
    },
  });

  const moderateCommentMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      const response = await apiRequest("PATCH", `/api/comments/${id}`, { approved, credentials: 'include' });
      if (!response.ok) {
        throw new Error("Failed to moderate comment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Success",
        description: "Comment moderated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to moderate comment",
        variant: "destructive"
      });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      try {
        console.log('[Admin] Starting delete mutation for comment:', commentId);
        const response = await apiRequest("DELETE", `/api/comments/${commentId}`, {credentials: 'include'});

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Admin] Delete comment error:', errorData);
          throw new Error(errorData.message || "Failed to delete comment");
        }

        return commentId;
      } catch (error) {
        console.error('[Admin] Delete comment error:', error);
        throw error;
      }
    },
    onSuccess: (deletedCommentId) => {
      console.log('[Admin] Comment deleted successfully:', deletedCommentId);
      // Update local state
      queryClient.setQueriesData<Comment[]>(["/api/comments/pending"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter(comment => comment.id !== deletedCommentId);
      });
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
    },
    onError: (error: Error) => {
      console.error('[Admin] Comment deletion error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive"
      });
      if (error.message.includes("Unauthorized")) {
        setLocation("/admin/login");
      }
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to logout" }));
        throw new Error(error.message || "Failed to logout");
      }
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/admin/login");
      toast({
        title: "Logged out",
        description: "Successfully logged out"
      });
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

  const closeEditor = () => {
    setShowEditor(false);
    setEditingPost(null);
  };

  if (postsLoading || commentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const posts = postsData?.posts || [];

  return (
    <ErrorBoundary>
      <div className="container mx-auto space-y-8 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button
              variant="default"
              onClick={() => setShowEditor(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Post
            </Button>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="gap-2"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        <Sheet open={showEditor || !!editingPost} onOpenChange={closeEditor}>
          <SheetContent side="right" className="w-[95vw] sm:w-[90vw] md:w-[800px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingPost ? "Edit Post" : "Create New Post"}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <PostEditor post={editingPost} onClose={closeEditor} />
            </div>
          </SheetContent>
        </Sheet>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="posts">Posts Management</TabsTrigger>
            <TabsTrigger value="comments">
              Comment Moderation
              {pendingComments.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {pendingComments.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                  <div className="space-y-4">
                    {Array.isArray(posts) && posts.map((post: Post) => (
                      <div
                        key={post.id}
                        className="p-6 border rounded-lg transition-colors hover:bg-accent/5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-medium mb-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {post.excerpt}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <time className="text-muted-foreground">
                                {format(new Date(post.createdAt), 'MMM d, yyyy')}
                              </time>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-primary">{post.themeCategory}</span>
                              <span className="text-muted-foreground">•</span>
                              <span>{post.readingTimeMinutes} min read</span>
                              {post.isSecret && (
                                <>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    Secret
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewPost(post.slug)}
                              className="hover:bg-secondary/10"
                              title="View Post"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingPost(post)}
                              disabled={editingPost?.id === post.id}
                              className="hover:bg-primary/10"
                              title="Edit Post"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-destructive/10"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this post?')) {
                                  console.log('[Admin] Attempting to delete post:', post.id);
                                  deletePostMutation.mutate(post.id);
                                }
                              }}
                              disabled={deletePostMutation.isPending}
                              title="Delete Post"
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
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Comment Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                  <div className="space-y-4">
                    {Array.isArray(pendingComments) && pendingComments.length > 0 ? (
                      pendingComments.map((comment) => (
                        <div key={comment.id} className="border p-6 rounded-lg">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-medium text-lg">{comment.author}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant={comment.approved ? "default" : "outline"}
                                size="sm"
                                onClick={() => moderateCommentMutation.mutate({
                                  id: comment.id,
                                  approved: !comment.approved
                                })}
                              >
                                {comment.approved ? "Approved" : "Approve"}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this comment?')) {
                                    console.log('[Admin] Attempting to delete comment:', comment.id);
                                    deleteCommentMutation.mutate(comment.id);
                                  }
                                }}
                                disabled={deleteCommentMutation.isPending}
                              >
                                {deleteCommentMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Delete
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8 text-muted-foreground">
                        No pending comments to moderate
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

export default AdminPage;