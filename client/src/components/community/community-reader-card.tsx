import { useState } from 'react';
import { format } from 'date-fns';
import { useLocation } from 'wouter';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Post, User } from '@shared/schema';
import { extractHorrorExcerpt } from '@/lib/content-analysis';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  MessageSquare,
  MoreVertical,
  Copy,
  Share,
  Clock,
  Eye,
  Edit,
  Trash,
  Flag,
  Check
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Extend the User type to include avatar
export interface ExtendedUser extends User {
  avatar?: string;
}

export interface ExtendedPost extends Post {
  author?: ExtendedUser;
  likes: number;
  commentCount: number;
  views: number;
  hasLiked?: boolean;
  isBookmarked?: boolean;
  isFlagged?: boolean;
  updatedAt?: string; // Add for typesafety
  metadata: {
    themeCategory?: string;
    triggerWarnings?: string[];
    [key: string]: any;
  };
}

interface CommunityReaderCardProps {
  post: ExtendedPost;
  isAuthenticated: boolean;
  currentUser?: User | null | undefined;
  onEdit?: (post: ExtendedPost) => void;
}

export function CommunityReaderCard({ post, isAuthenticated, currentUser, onEdit }: CommunityReaderCardProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local UI states
  const [isLiked, setIsLiked] = useState(post.hasLiked || false);
  const [isCopied, setIsCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  
  // Format date
  const formattedDate = post.updatedAt || post.createdAt;
  const timeAgo = format(new Date(formattedDate), 'MMM dd, yyyy');
  
  // Check if the current user is the author or admin
  const isAuthor = currentUser?.id === post.authorId;
  const isAdmin = currentUser?.isAdmin === true;
  
  // Create excerpt from content using horror-intensive paragraph finder
  const createExcerpt = (content: string, maxLength = 150) => {
    // Use the extractHorrorExcerpt function to find the most horror-intensive paragraph
    return extractHorrorExcerpt(content, maxLength);
  };
  
  // Get category badge
  const getThemeBadge = () => {
    if (!post.metadata?.themeCategory) return null;
    
    const category = post.metadata.themeCategory;
    let colorClass = 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200';
    let displayName = category.replace('_', ' ');
    
    switch (category) {
      case 'PSYCHOLOGICAL': 
        colorClass = 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200';
        break;
      case 'SUPERNATURAL':
        colorClass = 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200';
        break;
      case 'TECHNOLOGICAL':
        colorClass = 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
        break;
      case 'BODY_HORROR':
        colorClass = 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
        displayName = 'Body Horror';
        break;
      case 'GOTHIC':
        colorClass = 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';
        break;
      case 'APOCALYPTIC':
        colorClass = 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';
        break;
    }
    
    return (
      <Badge variant="outline" className={colorClass}>
        {displayName}
      </Badge>
    );
  };
  
  // Get author initials for avatar fallback
  const getAuthorInitials = () => {
    if (!post.author || !post.author.username) return 'U';
    
    return post.author.username
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Check for trigger warnings
  const hasTriggerWarnings = 
    post.metadata?.triggerWarnings && 
    post.metadata.triggerWarnings.length > 0;
  
  // Like Post Mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to like post');
      return response.json();
    },
    onMutate: () => {
      // Optimistic update
      setIsLiked(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/community'] });
      toast({
        title: 'Story Liked',
        description: 'You have liked this story.',
      });
    },
    onError: (error: Error) => {
      // Reset to previous state
      setIsLiked(post.hasLiked || false);
      
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete Post Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to delete post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/community'] });
      setShowDeleteDialog(false);
      
      toast({
        title: 'Story Deleted',
        description: isAdmin && !isAuthor
          ? 'Community story has been deleted by admin.'
          : 'Your story has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Flag Post Mutation
  const flagMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await fetch(`/api/posts/${post.id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason,
          postId: post.id,
          postTitle: post.title,
          reportedAt: new Date().toISOString(),
          reportType: 'inappropriate_content',
          reporterName: currentUser?.username || 'Anonymous'
        }),
      });
      
      if (!response.ok) throw new Error('Failed to flag post');
      return response.json();
    },
    onSuccess: () => {
      setShowFlagDialog(false);
      setFlagReason('');
      
      // Update local state optimistically to show the post as flagged
      queryClient.setQueryData(['/api/posts/community'], (oldData: any) => {
        if (!oldData || !oldData.posts) return oldData;
        
        return {
          ...oldData,
          posts: oldData.posts.map((p: any) => 
            p.id === post.id ? { ...p, isFlagged: true } : p
          )
        };
      });
      
      toast({
        title: 'Report Submitted Successfully',
        description: 'Thank you for keeping our community safe. Our moderation team will review this content shortly.',
        duration: 5000,
      });
      
      // Refresh the data from the server
      queryClient.invalidateQueries({ queryKey: ['/api/posts/community'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Report Submission Failed',
        description: error.message || 'There was an issue submitting your report. Please try again later.',
        variant: 'destructive',
        duration: 5000,
      });
    },
  });
  
  // Handle like click
  const handleLikeClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to like stories',
        variant: 'default',
      });
      return;
    }
    
    likeMutation.mutate();
  };
  
  // Handle edit click
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(post);
    } else {
      navigate(`/edit-story/${post.id}`);
    }
  };
  
  // Handle delete click
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    deleteMutation.mutate();
  };
  
  // Handle flag dialog
  const handleFlag = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to report content',
        variant: 'default',
      });
      return;
    }
    
    setShowFlagDialog(true);
  };
  
  // Submit flag reason with enhanced validation
  const submitFlag = () => {
    // Check if reason is provided and meets minimum length
    if (!flagReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for reporting this content.',
        variant: 'default',
      });
      return;
    }
    
    if (flagReason.trim().length < 10) {
      toast({
        title: 'More Details Needed',
        description: 'Please provide more specific details about the issue (minimum 10 characters).',
        variant: 'default',
      });
      return;
    }
    
    // All validation passed, submit the report
    flagMutation.mutate(flagReason);
    
    // Log reporting activity for moderation purposes (no personal info)
    console.log(`Report submitted for post ID: ${post.id}, Title: "${post.title.substring(0, 20)}..."`);
  };
  
  // Copy post link to clipboard
  const copyLink = () => {
    const url = `${window.location.origin}/community-story/${post.slug}`;
    navigator.clipboard.writeText(url).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        
        toast({
          title: 'Link Copied',
          description: 'Story link has been copied to clipboard.',
        });
      },
      () => {
        toast({
          title: 'Failed to Copy',
          description: 'Could not copy the link to clipboard.',
          variant: 'destructive',
        });
      }
    );
  };
  
  // Share post
  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt || createExcerpt(post.content),
        url: `${window.location.origin}/community-story/${post.slug}`,
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      copyLink();
    }
  };
  
  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md mb-6 reader-card relative cursor-pointer"
      onClick={() => navigate(`/community-story/${post.slug}`)}
    >
      {/* Add a wrapper div to prevent the card click when interacting with menu */}
      <div onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end"
            sideOffset={8}
            className="w-[200px] bg-card p-1 shadow-lg rounded-md border border-border"
          >
            <DropdownMenuItem 
              onClick={() => navigate(`/community-story/${post.slug}`)}
              className="flex items-center rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2 text-primary/70" />
              Read Story
            </DropdownMenuItem>
            
            {isAuthor && (
              <>
                <DropdownMenuItem 
                  onClick={handleEditClick}
                  className="flex items-center rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2 text-blue-500/70" />
                  Edit Story
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteClick} 
                  className="flex items-center rounded-sm px-3 py-2 text-sm hover:bg-destructive/10 text-destructive hover:text-destructive cursor-pointer"
                >
                  <Trash className="h-4 w-4 mr-2 text-destructive/70" />
                  Delete Story
                </DropdownMenuItem>
              </>
            )}
            
            {/* Admin Delete Option - only show for admins */}
            {isAdmin && !isAuthor && (
              <DropdownMenuItem 
                onClick={handleDeleteClick} 
                className="flex items-center rounded-sm px-3 py-2 text-sm hover:bg-destructive/10 text-destructive hover:text-destructive cursor-pointer border-t border-t-muted"
              >
                <Trash className="h-4 w-4 mr-2 text-destructive/70" />
                Admin: Delete Story
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem 
              onClick={copyLink}
              className="flex items-center rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              {isCopied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2 text-teal-500/70" />
              )}
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={sharePost}
              className="flex items-center rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <Share className="h-4 w-4 mr-2 text-indigo-500/70" />
              Share
            </DropdownMenuItem>
            
            {/* Always show Report Story option, but disable for author or if already reported */}
            <DropdownMenuItem 
              onClick={handleFlag} 
              disabled={isAuthor || post.isFlagged}
              className={`flex items-center rounded-sm px-3 py-2 text-sm ${
                isAuthor ? 
                "text-muted-foreground cursor-not-allowed" : 
                post.isFlagged ? 
                "text-amber-600 cursor-not-allowed" : 
                "hover:bg-amber-50 hover:text-amber-800 text-amber-700 cursor-pointer"
              }`}
            >
              <Flag className={`h-4 w-4 mr-2 ${
                post.isFlagged ? "text-amber-600" : "text-amber-500/70"
              }`} />
              {post.isFlagged ? 'Reported' : 'Report Story'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={post.author?.avatar || ''} alt={post.author?.username || 'Author'} />
              <AvatarFallback>{getAuthorInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author?.username || 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <CardTitle className="text-2xl mb-3 font-serif">
          {post.title}
        </CardTitle>
        
        <CardDescription className="mb-4 text-base">
          {post.excerpt || createExcerpt(post.content, 300)}
        </CardDescription>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {getThemeBadge()}
          
          {hasTriggerWarnings && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200">
              Content Warning
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-sm">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-1 px-2 ${isLiked ? 'text-primary' : ''}`}
              onClick={handleLikeClick}
              disabled={likeMutation.isPending}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 px-2"
              onClick={() => navigate(`/community-story/${post.slug}#comments`)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount}</span>
            </Button>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs">{post.readingTimeMinutes || 5} min read</span>
          </div>
        </div>
      </CardFooter>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAdmin && !isAuthor ? 'Admin: Delete Community Story' : 'Delete Story'}</DialogTitle>
            <DialogDescription>
              {isAdmin && !isAuthor 
                ? 'As an admin, you are about to delete a user-submitted community story. This action cannot be undone.'
                : 'Are you sure you want to delete this story? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between border p-3 rounded-md bg-muted/50 mt-2">
            <div className="font-medium truncate pr-2">{post.title}</div>
            {isAdmin && !isAuthor && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                By {post.author?.username || 'Anonymous'}
              </Badge>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Story'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Enhanced Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Flag className="h-5 w-5 mr-2 text-amber-500" />
              Report Inappropriate Content
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              Please help us maintain community standards by providing details about why this content is being reported.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            <div className="bg-muted/40 p-3 rounded-md mb-4 border border-muted">
              <h4 className="font-medium text-sm mb-1 text-primary/90">Reporting Content:</h4>
              <p className="text-sm font-medium truncate">{post.title}</p>
              <p className="text-xs text-muted-foreground mt-1">By {post.author?.username || 'Anonymous'}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="flag-reason" className="text-sm font-medium">
                Reason for Reporting
              </label>
              <textarea
                id="flag-reason"
                className="w-full min-h-[120px] p-3 border rounded-md text-sm focus:ring-1 focus:ring-primary/30 focus:border-primary/70 transition-colors"
                placeholder="Please provide specific details about why this content violates community guidelines..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
              />
              {flagReason.length < 10 && flagReason.length > 0 && (
                <p className="text-xs text-amber-600">Please provide more details (minimum 10 characters)</p>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                Your report will be reviewed by our moderation team. Thank you for helping maintain a positive community experience.
              </p>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowFlagDialog(false);
                setFlagReason(''); // Clear input on cancel
              }}
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitFlag}
              disabled={flagMutation.isPending || flagReason.length < 10}
              className="gap-2"
            >
              {flagMutation.isPending ? (
                <>
                  <span className="animate-pulse">Processing...</span>
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}