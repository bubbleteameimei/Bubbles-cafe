import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileEdit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  authorId: number;
  createdAt: string;
  metadata: {
    isApproved?: boolean;
    isCommunityPost?: boolean;
    status?: string;
    [key: string]: any;
  };
}

export default function AdminPostsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isAdmin = !!user?.isAdmin;

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    enabled: isAdmin,
  });

  const deletePost = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest('DELETE', `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
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

  const updatePost = useMutation({
    mutationFn: async (data: { id: number; title: string; content: string }) => {
      await apiRequest('PUT', `/api/posts/${data.id}`, {
        title: data.title,
        content: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    },
  });

  const approvePost = useMutation({
    mutationFn: async (post: Post) => {
      await apiRequest('PUT', `/api/posts/${post.id}`, {
        // send only the fields expected by server update schema
        title: post.title,
        content: post.content,
        metadata: {
          ...(post.metadata || {}),
          isApproved: true,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve post",
        variant: "destructive",
      });
    },
  });

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin mb-4" aria-hidden="true" />
        <p className="text-muted-foreground">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            Failed to load posts. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleEditClick = (post: Post) => {
    setSelectedPost(post);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    updatePost.mutate({
      id: selectedPost.id,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Posts Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts?.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.authorId}</TableCell>
                    <TableCell>
                      {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {post.metadata.isApproved ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approved
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600">
                          <XCircle className="w-4 h-4 mr-1" />
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(post)}
                          title="Edit post"
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        {!post.metadata.isApproved && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => approvePost.mutate(post)}
                            title="Approve post"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Delete post"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the post.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePost.mutate(post.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to the post content below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={selectedPost?.title}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={selectedPost?.content}
                  required
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePost.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}