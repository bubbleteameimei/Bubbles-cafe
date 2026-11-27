import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Eye, Edit, Trash2, X, Loader2, BookOpen, ExternalLink, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import PostEditor from "@/components/admin/post-editor";
import { apiRequest } from "@/lib/queryClient";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "published" | "draft" | "pending" | "hidden";
  createdAt: string;
  updatedAt: string;
  categories: string[];
  featuredImage?: string;
  authorId?: string;
  authorName?: string;
  views: number;
  sourceType: "wordpress" | "manual" | "community";
  featured?: boolean;
}

/** Shape a raw posts row from /api/admin/posts into what this page and the editor use. */
function toAdminPost(p: any): Post {
  const meta = p.metadata ?? {};
  const raw = String(meta.status || "publish").toLowerCase();
  const status = raw === "publish" ? "published" : raw === "draft" || raw === "pending" || raw === "hidden" ? raw : "published";
  return {
    id: String(p.id),
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? "",
    content: p.content ?? "",
    status,
    createdAt: p.createdAt,
    updatedAt: meta.syncedAt || p.createdAt,
    categories: Array.isArray(meta.categories) && typeof meta.categories[0] === "string"
      ? meta.categories
      : p.themeCategory ? [p.themeCategory] : [],
    featuredImage: meta.featuredImage || undefined,
    authorId: p.authorId != null ? String(p.authorId) : undefined,
    views: Number(meta.pageViews || 0),
    sourceType: meta.wordpressId ? "wordpress" : p.isAdminPost ? "manual" : "community",
    featured: meta.featured === true,
  };
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery<{ posts: Post[] }>({
    queryKey: ['/api/admin/posts', 'content-page'],
    queryFn: async () => {
      const res = await apiRequest<{ posts: any[] }>('/api/admin/posts');
      return { posts: (res.posts ?? []).map(toAdminPost) };
    },
  });

  // Handle editing a post
  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditDialogOpen(true);
  };

  // Handle viewing a post
  const handleView = (post: Post) => {
    window.open(`/reader/${post.slug}`, '_blank', 'noopener,noreferrer');
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
      // WordPress stories are remembered as deleted, so the next sync won't bring them back.
      await apiRequest(`/api/admin/posts/${selectedPost.id}`, { method: 'DELETE' });
      toast({ title: "Story deleted", description: `"${selectedPost.title}" has been deleted.` });
      
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
    const posts = data?.posts || [];
    if (!posts) return [];
    
    return posts.filter(post => {
      // Hide posts explicitly marked hidden in metadata (e.g., hidden WP posts)
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
          (post.excerpt?.toLowerCase?.().includes(query) ?? false) ||
          post.slug.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [data?.posts, searchQuery, statusFilter, sourceFilter]);

  // Handle successfully saving a post
  const handleSaveSuccess = () => {
    setIsEditDialogOpen(false);
    setIsCreateOpen(false);
    refetch();
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
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              New story
            </Button>
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
              <option value="hidden">Hidden</option>
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
                          {post.status && typeof post.status === 'string' 
                            ? post.status.charAt(0).toUpperCase() + post.status.slice(1)
                            : 'Unknown'}
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
                          {post.sourceType && typeof post.sourceType === 'string'
                            ? post.sourceType.charAt(0).toUpperCase() + post.sourceType.slice(1)
                            : 'Unknown'}
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
        <DialogContent 
          className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
          aria-labelledby="edit-story-title"
          aria-describedby="edit-story-description"
        >
          <DialogHeader>
            <DialogTitle id="edit-story-title">Edit Story</DialogTitle>
            <DialogDescription id="edit-story-description">
              Make changes to the story content, metadata, and settings.
            </DialogDescription>
          </DialogHeader>
          
                      {selectedPost && (
              <PostEditor 
                post={selectedPost} 
                onClose={() => setIsEditDialogOpen(false)}
                onSaveSuccess={handleSaveSuccess}
              />
            )}
</DialogContent>
      </Dialog>

      {/* New story */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New story</DialogTitle>
            <DialogDescription>Write a story and publish it, or save it as a draft.</DialogDescription>
          </DialogHeader>
          {isCreateOpen && <PostEditor onClose={() => setIsCreateOpen(false)} onSaveSuccess={handleSaveSuccess} />}
        </DialogContent>
      </Dialog>

      {/* Delete Post Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent 
          aria-labelledby="delete-story-title"
          aria-describedby="delete-story-description"
        >
          <DialogHeader>
            <DialogTitle id="delete-story-title">Confirm Deletion</DialogTitle>
            <DialogDescription id="delete-story-description">
              {selectedPost?.sourceType === 'wordpress'
                ? "This story came from WordPress. It's deleted here and won't be re-imported by the sync. Its likes and comments are removed too."
                : "This can't be undone. The story, its likes and its comments are permanently deleted."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium">
              Are you sure you want to delete "{selectedPost?.title}"?
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
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}