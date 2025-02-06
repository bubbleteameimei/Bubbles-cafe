import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { insertPostSchema, type Post, type InsertPost } from "@shared/schema";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pencil, Trash2, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminPage() {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/posts");
        if (response.status === 401) {
          setLocation("/admin/login");
        }
      } catch (error) {
        setLocation("/admin/login");
      }
    };
    checkAuth();
  }, [setLocation]);

  const postForm = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema.omit({ slug: true })),
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
    throwOnError: true,
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: Omit<InsertPost, "slug">) => {
      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const response = await apiRequest("POST", "/api/posts", { ...data, slug });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      postForm.reset();
      setEditingPost(null);
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest("DELETE", `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      setLocation("/admin/login");
      toast({
        title: "Logged out",
        description: "Successfully logged out"
      });
    }
  });

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    postForm.reset({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      isSecret: post.isSecret,
      authorId: post.authorId,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    setLocation("/admin/login");
    return null;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingPost ? "Edit Post" : "Create New Post"}
        </h2>
        <Form {...postForm}>
          <form onSubmit={postForm.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
            <FormField
              control={postForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Textarea {...field} rows={10} />
                  </FormControl>
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
                    <Textarea {...field} rows={3} />
                  </FormControl>
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
                  <FormLabel>Is Secret Post</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? "Saving..." : (editingPost ? "Update Post" : "Create Post")}
              </Button>
              {editingPost && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingPost(null);
                  postForm.reset();
                }}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Posts</h2>
        <div className="space-y-4">
          {posts?.map((post: Post) => (
            <div key={post.id} className="p-4 border rounded flex items-center justify-between">
              <div>
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                {post.isSecret && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Secret
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditPost(post)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this post?')) {
                      deletePostMutation.mutate(post.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}