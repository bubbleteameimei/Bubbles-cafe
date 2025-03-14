import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { Post, User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { ThemeProvider } from '@/components/theme-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/alert-dialog';
import { 
  ArrowUpDown, 
  Check, 
  Eye, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Filter,
  Search,
  AlertTriangle,
  Flag,
  ExternalLink,
  Ban,
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  ThumbsUp,
  BarChart,
  AlertCircle
} from 'lucide-react';

// Extended Post type with admin-specific properties
interface ExtendedPost extends Post {
  author?: User;
  published: boolean;
  featured?: boolean;
  flagCount?: number;
  flagged?: boolean;
  views?: number;
  likes?: number;
  commentCount?: number;
  lastModifiedBy?: string;
}

export default function ManagePostsPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Page state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ExtendedPost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedPostData, setEditedPostData] = useState<{
    title: string;
    status: string;
    featured: boolean;
    triggerWarnings: string;
    themeCategory: string;
  }>({
    title: '',
    status: 'published',
    featured: false,
    triggerWarnings: '',
    themeCategory: '',
  });
  
  // Fetch posts with filters
  const { 
    data: postsData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['admin/posts', currentTab, statusFilter, categoryFilter, searchQuery],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      // Different endpoint based on tab
      let endpoint = '/api/admin/posts';
      if (currentTab === 'flagged') {
        endpoint = '/api/admin/posts/flagged';
      } else if (currentTab === 'pending') {
        endpoint = '/api/admin/posts/pending';
      } else if (currentTab === 'featured') {
        params.append('featured', 'true');
      }
      
      const response = await fetch(`${endpoint}?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });
  
  // Mutations
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin/posts'] });
      toast({
        title: 'Post Deleted',
        description: 'The post has been successfully deleted.',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete post',
        variant: 'destructive',
      });
    }
  });
  
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin/posts'] });
      toast({
        title: 'Post Updated',
        description: 'The post has been successfully updated.',
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update post',
        variant: 'destructive',
      });
    }
  });
  
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, postIds }: { action: string, postIds: number[] }) => {
      const response = await fetch('/api/admin/posts/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, postIds }),
      });
      
      if (!response.ok) throw new Error(`Failed to ${action} posts`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin/posts'] });
      
      let actionText = '';
      switch (variables.action) {
        case 'publish':
          actionText = 'published';
          break;
        case 'unpublish':
          actionText = 'unpublished';
          break;
        case 'delete':
          actionText = 'deleted';
          break;
        case 'feature':
          actionText = 'featured';
          break;
        case 'unfeature':
          actionText = 'unfeatured';
          break;
        default:
          actionText = 'processed';
      }
      
      toast({
        title: 'Bulk Action Complete',
        description: `${variables.postIds.length} posts have been ${actionText}.`,
      });
      
      setSelectedPosts([]);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process bulk action',
        variant: 'destructive',
      });
    }
  });
  
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: number, publish: boolean }) => {
      const response = await fetch(`/api/admin/posts/${id}/${publish ? 'publish' : 'unpublish'}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) throw new Error(`Failed to ${publish ? 'publish' : 'unpublish'} post`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin/posts'] });
      
      toast({
        title: variables.publish ? 'Post Published' : 'Post Unpublished',
        description: variables.publish 
          ? 'The post is now visible to users.'
          : 'The post has been unpublished and is no longer visible to users.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change post status',
        variant: 'destructive',
      });
    }
  });
  
  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ id, feature }: { id: number, feature: boolean }) => {
      const response = await fetch(`/api/admin/posts/${id}/${feature ? 'feature' : 'unfeature'}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) throw new Error(`Failed to ${feature ? 'feature' : 'unfeature'} post`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin/posts'] });
      
      toast({
        title: variables.feature ? 'Post Featured' : 'Post Unfeatured',
        description: variables.feature 
          ? 'The post is now featured on the homepage.'
          : 'The post has been removed from featured content.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change feature status',
        variant: 'destructive',
      });
    }
  });
  
  // Helper functions
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will be triggered by the onChange of the query param
  };
  
  const handleTogglePublish = (post: ExtendedPost) => {
    togglePublishMutation.mutate({ id: post.id, publish: !post.published });
  };
  
  const handleToggleFeature = (post: ExtendedPost) => {
    toggleFeatureMutation.mutate({ id: post.id, feature: !post.featured });
  };
  
  const handleDeletePost = (post: ExtendedPost) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeletePost = () => {
    if (selectedPost) {
      deletePostMutation.mutate(selectedPost.id);
    }
  };
  
  const handleEditPost = (post: ExtendedPost) => {
    setSelectedPost(post);
    setEditedPostData({
      title: post.title,
      status: post.published ? 'published' : 'draft',
      featured: post.featured || false,
      themeCategory: post.metadata?.themeCategory || '',
      triggerWarnings: post.metadata?.triggerWarnings?.join(', ') || '',
    });
    setIsEditDialogOpen(true);
  };
  
  const handleUpdatePost = () => {
    if (!selectedPost) return;
    
    const triggerWarnings = editedPostData.triggerWarnings
      ? editedPostData.triggerWarnings.split(',').map(tw => tw.trim()).filter(Boolean)
      : [];
    
    const data = {
      title: editedPostData.title,
      published: editedPostData.status === 'published',
      featured: editedPostData.featured,
      metadata: {
        ...selectedPost.metadata,
        themeCategory: editedPostData.themeCategory,
        triggerWarnings,
      }
    };
    
    updatePostMutation.mutate({ id: selectedPost.id, data });
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && postsData?.posts) {
      setSelectedPosts(postsData.posts.map(post => post.id));
    } else {
      setSelectedPosts([]);
    }
  };
  
  const handleSelectPost = (postId: number) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };
  
  const handleBulkAction = (action: string) => {
    if (selectedPosts.length === 0) {
      toast({
        title: 'No Posts Selected',
        description: 'Please select at least one post to perform this action.',
        variant: 'default',
      });
      return;
    }
    
    bulkActionMutation.mutate({ action, postIds: selectedPosts });
  };
  
  // Computed values
  const posts = postsData?.posts || [];
  const totalPosts = postsData?.total || 0;
  const isAllSelected = posts.length > 0 && selectedPosts.length === posts.length;
  const isIndeterminate = selectedPosts.length > 0 && selectedPosts.length < posts.length;
  
  // Stats
  const pendingCount = postsData?.stats?.pending || 0;
  const flaggedCount = postsData?.stats?.flagged || 0;
  
  // Get appropriate badge for post status
  const getStatusBadge = (post: ExtendedPost) => {
    if (post.flagged) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Flag className="h-3 w-3" />
          Flagged
        </Badge>
      );
    }
    
    if (!post.published) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Draft
        </Badge>
      );
    }
    
    if (post.featured) {
      return (
        <Badge className="bg-amber-600 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Featured
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="gap-1">
        <Check className="h-3 w-3" />
        Published
      </Badge>
    );
  };
  
  // Get theme category badge
  const getThemeBadge = (post: ExtendedPost) => {
    if (!post.metadata?.themeCategory) return null;
    
    const category = post.metadata.themeCategory;
    let colorClass = 'bg-gray-100 text-gray-800 border-gray-300';
    
    switch (category) {
      case 'PSYCHOLOGICAL': 
        colorClass = 'bg-purple-100 text-purple-800 border-purple-300';
        break;
      case 'SUPERNATURAL':
        colorClass = 'bg-indigo-100 text-indigo-800 border-indigo-300';
        break;
      case 'TECHNOLOGICAL':
        colorClass = 'bg-blue-100 text-blue-800 border-blue-300';
        break;
      case 'BODY_HORROR':
        colorClass = 'bg-red-100 text-red-800 border-red-300';
        break;
      case 'GOTHIC':
        colorClass = 'bg-slate-100 text-slate-800 border-slate-300';
        break;
      case 'APOCALYPTIC':
        colorClass = 'bg-amber-100 text-amber-800 border-amber-300';
        break;
    }
    
    return (
      <Badge variant="outline" className={colorClass}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };
  
  // Format date
  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Posts</h2>
          <p className="text-muted-foreground">
            View, edit, and manage all posts across the platform.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => navigate('/admin/content-moderation')}
            variant="outline"
            size="sm"
          >
            <Flag className="h-4 w-4 mr-2" />
            Content Moderation
          </Button>
          <Button 
            onClick={() => navigate('/submit-story')}
            size="sm"
          >
            <Pencil className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Posts
            </CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {postsData?.stats?.published || 0} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting moderation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Flagged Content
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedCount}</div>
            <p className="text-xs text-muted-foreground">
              Reported by users
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="featured">
              Featured
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="flagged" className="relative">
              Flagged
              {flaggedCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {flaggedCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts..."
                className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="PSYCHOLOGICAL">Psychological</SelectItem>
                  <SelectItem value="SUPERNATURAL">Supernatural</SelectItem>
                  <SelectItem value="TECHNOLOGICAL">Technological</SelectItem>
                  <SelectItem value="BODY_HORROR">Body Horror</SelectItem>
                  <SelectItem value="GOTHIC">Gothic</SelectItem>
                  <SelectItem value="APOCALYPTIC">Apocalyptic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Batch Actions */}
        {selectedPosts.length > 0 && (
          <div className="bg-muted p-3 rounded-md mb-4 flex items-center justify-between">
            <span className="text-sm">
              {selectedPosts.length} {selectedPosts.length === 1 ? 'post' : 'posts'} selected
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction('publish')}
              >
                <Check className="h-4 w-4 mr-1" />
                Publish
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction('unpublish')}
              >
                <Ban className="h-4 w-4 mr-1" />
                Unpublish
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction('feature')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Feature
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              ) : isError ? (
                <div className="flex justify-center items-center h-60 flex-col gap-2">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="text-destructive">
                    {error instanceof Error ? error.message : 'Failed to load posts'}
                  </p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex justify-center items-center h-60 flex-col gap-2">
                  <p className="text-muted-foreground">No posts found matching your criteria.</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]">
                          <Checkbox 
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all posts"
                          />
                        </TableHead>
                        <TableHead className="w-[40%]">
                          <div className="flex items-center space-x-1">
                            <span>Title</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Analytics</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedPosts.includes(post.id)}
                              onCheckedChange={() => handleSelectPost(post.id)}
                              aria-label={`Select post ${post.title}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium truncate max-w-[300px]">{post.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {post.slug}
                            </div>
                          </TableCell>
                          <TableCell>
                            {post.author?.username || 'System'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(post)}
                          </TableCell>
                          <TableCell>
                            {getThemeBadge(post)}
                          </TableCell>
                          <TableCell>
                            {formatDate(post.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2 text-muted-foreground text-sm">
                              <div className="flex items-center">
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                <span>{post.views || 0}</span>
                              </div>
                              <div className="flex items-center">
                                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                <span>{post.likes || 0}</span>
                              </div>
                              <div className="flex items-center">
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                <span>{post.commentCount || 0}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => navigate(`/reader/${post.slug}`)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/admin/analytics?postId=${post.id}`)}>
                                      <BarChart className="h-4 w-4 mr-2" />
                                      Analytics
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => handleTogglePublish(post)}>
                                      {post.published ? (
                                        <>
                                          <Ban className="h-4 w-4 mr-2" />
                                          Unpublish
                                        </>
                                      ) : (
                                        <>
                                          <Check className="h-4 w-4 mr-2" />
                                          Publish
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleFeature(post)}>
                                      {post.featured ? (
                                        <>
                                          <Ban className="h-4 w-4 mr-2" />
                                          Unfeature
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                          Feature
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeletePost(post)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="featured" className="space-y-4">
          {/* Featured content tab - same structure as "all" tab but with featured posts */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <p className="text-muted-foreground">Loading featured posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex justify-center items-center h-60 flex-col gap-2">
                  <p className="text-muted-foreground">No featured posts found.</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  {/* Same table structure as "all" tab */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]">
                          <Checkbox 
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all posts"
                          />
                        </TableHead>
                        <TableHead className="w-[40%]">
                          <div className="flex items-center space-x-1">
                            <span>Title</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Analytics</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedPosts.includes(post.id)}
                              onCheckedChange={() => handleSelectPost(post.id)}
                              aria-label={`Select post ${post.title}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium truncate max-w-[300px]">{post.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {post.slug}
                            </div>
                          </TableCell>
                          <TableCell>
                            {post.author?.username || 'System'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(post)}
                          </TableCell>
                          <TableCell>
                            {getThemeBadge(post)}
                          </TableCell>
                          <TableCell>
                            {formatDate(post.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-2 text-muted-foreground text-sm">
                              <div className="flex items-center">
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                <span>{post.views || 0}</span>
                              </div>
                              <div className="flex items-center">
                                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                <span>{post.likes || 0}</span>
                              </div>
                              <div className="flex items-center">
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                <span>{post.commentCount || 0}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => navigate(`/reader/${post.slug}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleToggleFeature(post)}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Unfeature
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {/* Pending moderation tab - similar structure */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <p className="text-muted-foreground">Loading pending posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex justify-center items-center h-60 flex-col gap-2">
                  <p className="text-muted-foreground">No pending posts found.</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]">
                          <Checkbox 
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all posts"
                          />
                        </TableHead>
                        <TableHead className="w-[40%]">Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedPosts.includes(post.id)}
                              onCheckedChange={() => handleSelectPost(post.id)}
                              aria-label={`Select post ${post.title}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium truncate max-w-[300px]">{post.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {post.slug}
                            </div>
                          </TableCell>
                          <TableCell>
                            {post.author?.username || 'Anonymous'}
                          </TableCell>
                          <TableCell>
                            {getThemeBadge(post)}
                          </TableCell>
                          <TableCell>
                            {formatDate(post.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/reader/${post.slug}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm"
                                variant="default"
                                onClick={() => handleTogglePublish(post)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePost(post)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="flagged" className="space-y-4">
          {/* Flagged content tab - similar structure with flags info */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <p className="text-muted-foreground">Loading flagged posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex justify-center items-center h-60 flex-col gap-2">
                  <p className="text-muted-foreground">No flagged posts found.</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]">
                          <Checkbox 
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all posts"
                          />
                        </TableHead>
                        <TableHead className="w-[35%]">Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Flag Count</TableHead>
                        <TableHead>Last Flagged</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedPosts.includes(post.id)}
                              onCheckedChange={() => handleSelectPost(post.id)}
                              aria-label={`Select post ${post.title}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium truncate max-w-[300px]">{post.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {post.slug}
                            </div>
                          </TableCell>
                          <TableCell>
                            {post.author?.username || 'Anonymous'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {post.flagCount || 1} {post.flagCount === 1 ? 'flag' : 'flags'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(post.updatedAt || post.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/reader/${post.slug}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm"
                                variant="default"
                                onClick={() => handleTogglePublish(post)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Mark Safe
                              </Button>
                              <Button 
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePost(post)}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to the post. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                className="col-span-3"
                value={editedPostData.title}
                onChange={(e) => setEditedPostData({...editedPostData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={editedPostData.status} 
                onValueChange={(value) => setEditedPostData({...editedPostData, status: value})}
              >
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select 
                value={editedPostData.themeCategory} 
                onValueChange={(value) => setEditedPostData({...editedPostData, themeCategory: value})}
              >
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="PSYCHOLOGICAL">Psychological</SelectItem>
                  <SelectItem value="SUPERNATURAL">Supernatural</SelectItem>
                  <SelectItem value="TECHNOLOGICAL">Technological</SelectItem>
                  <SelectItem value="BODY_HORROR">Body Horror</SelectItem>
                  <SelectItem value="GOTHIC">Gothic</SelectItem>
                  <SelectItem value="APOCALYPTIC">Apocalyptic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="featured" className="text-right">
                Featured
              </Label>
              <div className="flex items-center col-span-3">
                <Checkbox
                  id="featured"
                  checked={editedPostData.featured}
                  onCheckedChange={(checked) => 
                    setEditedPostData({...editedPostData, featured: checked === true})
                  }
                />
                <Label htmlFor="featured" className="ml-2">
                  Display as featured post
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="warnings" className="text-right">
                Content Warnings
              </Label>
              <Textarea
                id="warnings"
                className="col-span-3"
                placeholder="Enter comma-separated warnings"
                value={editedPostData.triggerWarnings}
                onChange={(e) => setEditedPostData({...editedPostData, triggerWarnings: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePost}
              disabled={!editedPostData.title.trim() || updatePostMutation.isPending}
            >
              {updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Post Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post "{selectedPost?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}