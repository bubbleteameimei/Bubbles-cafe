import * as React from "react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Eye, Edit, Trash2, Check, X, Loader2, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import PostEditor from "@/components/admin/post-editor";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "published" | "draft" | "pending";
  createdAt: string;
  updatedAt: string;
  categories: string[];
  featuredImage?: string;
  authorId?: string;
  authorName?: string;
  views: number;
  sourceType: "wordpress" | "manual" | "community";
}

export default function ContentPage() {
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Fetch posts with react-query
  const { data, isLoading, isError, refetch } = useQuery<{posts: Post[], hasMore: boolean}>({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    }
  });
  
  // Extract posts from the response
  const posts = data?.posts || [];

  // Handle editing a post
  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditDialogOpen(true);
  };

  // Handle viewing a post
  const handleView = (post: Post) => {
    window.open(`/reader/${post.slug}`, '_blank');
  };

  // Handle deleting a post
  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  // Confirm post deletion
  const confirmDelete = async () => {
    if (!selectedPost) return;
    
    setIsDeleteLoading(true);
    try {
      // For WordPress posts, we'll just hide them from the UI
      if (selectedPost.sourceType === 'wordpress') {
        await fetch(`/api/posts/${selectedPost.id}/hide`, {
          method: 'PUT',
        });
        toast({
          title: "Hidden from listings",
          description: "The WordPress post has been hidden from listings. You can re-enable it in the WordPress Sync settings.",
        });
      } else {
        // For manual and community posts, we can delete them completely
        await fetch(`/api/posts/${selectedPost.id}`, {
          method: 'DELETE',
        });
        toast({
          title: "Post deleted",
          description: "The post has been permanently deleted.",
        });
      }
      
      // Close dialog and refresh posts
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Filter and search posts
  const filteredPosts = React.useMemo(() => {
    if (!posts) return [];
    
    return posts.filter(post => {
      // Filter by status
      if (statusFilter !== "all" && post.status !== statusFilter) {
        return false;
      }
      
      // Filter by source
      if (sourceFilter !== "all" && post.sourceType !== sourceFilter) {
        return false;
      }
      
      // Search by title, excerpt, or slug
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.slug.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [posts, searchQuery, statusFilter, sourceFilter]);

  // Handle successfully saving a post
  const handleSaveSuccess = () => {
    setIsEditDialogOpen(false);
    refetch();
    toast({
      title: "Post updated",
      description: "The post has been successfully updated.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800">
        <h3 className="text-lg font-medium mb-2">Error Loading Posts</h3>
        <p>Failed to load posts. Please try refreshing the page.</p>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle>Story Management</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search stories..."
                className="px-3 py-2 bg-background border rounded-md w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 bg-background border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
            </select>
            <select
              className="px-3 py-2 bg-background border rounded-md"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="all">All Sources</option>
              <option value="wordpress">WordPress</option>
              <option value="manual">Manual</option>
              <option value="community">Community</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No stories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant={
                          post.status === 'published' ? 'default' : 
                          post.status === 'draft' ? 'outline' : 
                          'secondary'
                        }>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          post.sourceType === 'wordpress' ? 'default' : 
                          post.sourceType === 'manual' ? 'outline' : 
                          'secondary'
                        }>
                          {post.sourceType === 'wordpress' && <ExternalLink className="h-3 w-3 mr-1 inline" />}
                          {post.sourceType === 'manual' && <BookOpen className="h-3 w-3 mr-1 inline" />}
                          {post.sourceType.charAt(0).toUpperCase() + post.sourceType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {post.updatedAt ? format(new Date(post.updatedAt), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(post)}
                            title="View Story"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(post)}
                            title="Edit Story"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(post)}
                            title="Delete Story"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]" aria-describedby="edit-story-description">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
            <DialogDescription id="edit-story-description">
              Make changes to the story content, metadata, and settings.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPost && (
            <PostEditor 
              // @ts-ignore - post is defined in PostEditorProps
              post={selectedPost} 
              onClose={() => setIsEditDialogOpen(false)}
              onSaveSuccess={handleSaveSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Post Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent aria-describedby="delete-story-description">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription id="delete-story-description">
              {selectedPost?.sourceType === 'wordpress' 
                ? "This story was imported from WordPress. It will be hidden from listings but can be re-synced later."
                : "This action cannot be undone. The story will be permanently deleted from the system."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium">
              Are you sure you want to {selectedPost?.sourceType === 'wordpress' ? 'hide' : 'delete'} "{selectedPost?.title}"?
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleteLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  {selectedPost?.sourceType === 'wordpress' ? 'Hide' : 'Delete'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}