import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Post } from "@shared/schema";
import { Loader2, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface PostMetadata {
  isCommunityPost?: boolean;
  isSecret?: boolean;
  status?: 'pending' | 'approved';
  isApproved?: boolean;
}

interface PostWithMetadata extends Post {
  metadata: PostMetadata;
}

export default function AdminContentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletePostId, setDeletePostId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ posts: PostWithMetadata[], hasMore: boolean }>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
      setDeletePostId(null); // Reset deletePostId after successful deletion
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const handleDelete = async (postId: number) => {
    try {
      await deleteMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Content Management</h1>
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => window.location.href = '/submit-story'}
          className="flex items-center gap-2"
        >
          Create New Story
        </Button>
      </div>

      <div className="grid gap-6">
        {data?.posts.map((post) => (
          <Card key={post.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">{post.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    By {post.authorId} • Created {new Date(post.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {post.metadata && (
                    <>
                      {post.metadata.isCommunityPost && (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
                          Community Post
                        </Badge>
                      )}
                      {post.metadata.isSecret && (
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
                          Secret
                        </Badge>
                      )}
                      {post.metadata.status === 'pending' && (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                          Pending Review
                        </Badge>
                      )}
                      {post.metadata.status === 'approved' && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          Approved
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
              <div className="mt-4 flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => window.location.href = `/story/${post.id}`}
                >
                  <Eye className="h-4 w-4" /> View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => window.location.href = `/submit-story?edit=${post.id}`}
                >
                  <Edit className="h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deletePostId !== null} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (deletePostId) {
                  handleDelete(deletePostId);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}