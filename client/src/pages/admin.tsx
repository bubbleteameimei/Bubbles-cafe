import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { insertPostSchema, type Post, type InsertPost } from "@shared/schema";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pencil, Trash2, LogOut, Loader2, Plus, X } from "lucide-react";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function AdminPage() {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Enhanced authentication check with proper error handling
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/posts");
        if (!response.ok) {
          toast({
            title: "Authentication Error",
            description: "Please log in to access the admin dashboard",
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

  const postForm = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema.extend({
      slug: insertPostSchema.shape.slug.optional(),
      title: insertPostSchema.shape.title.min(3, "Title must be at least 3 characters"),
      content: insertPostSchema.shape.content.min(10, "Content must be at least 10 characters"),
      excerpt: insertPostSchema.shape.excerpt.min(5, "Excerpt must be at least 5 characters"),
    })),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      isSecret: false,
      authorId: 1,
    },
  });

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

  const createPostMutation = useMutation({
    mutationFn: async (data: Omit<InsertPost, "slug">) => {
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const response = await apiRequest(
        editingPost ? "PATCH" : "POST",
        editingPost ? `/api/posts/${editingPost.id}` : "/api/posts",
        { ...data, slug }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      postForm.reset();
      setEditingPost(null);
      toast({
        title: "Success",
        description: editingPost ? "Post updated successfully" : "Post created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save post",
        variant: "destructive",
      });
      // Log the error for debugging
      console.error('Post mutation error:', error);
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
      console.error('Delete mutation error:', error);
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
      // Clear any cached data
      queryClient.clear();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
      console.error('Logout error:', error);
    },
  });

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post);
    postForm.reset({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      isSecret: post.isSecret,
      authorId: post.authorId,
    });
  }, [postForm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    console.error('Posts fetch error:', error);
    setLocation("/admin/login");
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">
                {editingPost ? (
                  <div className="flex items-center justify-between">
                    <span>Edit Post</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingPost(null);
                        postForm.reset();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span>New Post</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...postForm}>
                <form 
                  onSubmit={postForm.handleSubmit((data) => {
                    if (postForm.formState.isValid) {
                      createPostMutation.mutate(data);
                    }
                  })} 
                  className="space-y-6"
                >
                  <FormField
                    control={postForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={postForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={12} className="resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={postForm.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} className="resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={postForm.control}
                    name="isSecret"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded border-gray-300"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Secret Post</FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={createPostMutation.isPending || !postForm.formState.isValid}
                    className="w-full"
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {editingPost ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <span className="flex items-center gap-2">
                        {editingPost ? (
                          <>
                            <Pencil className="h-4 w-4" />
                            Update Post
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Create Post
                          </>
                        )}
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

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
                          {post.isSecret && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
                              Secret
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPost(post)}
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