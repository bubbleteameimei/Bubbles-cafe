import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Post, User } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Eye, 
  Clock, 
  Flag, 
  AlertTriangle,
  Heart,
  Calendar,
  Copy,
  Check
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Extended interface for post with UI-specific properties
interface ExtendedPost extends Post {
  author?: User;
  likes: number;
  dislikes: number;
  commentCount: number;
  views: number;
  readingTime: number;
  hasLiked?: boolean;
  hasDisliked?: boolean;
  isBookmarked?: boolean;
  isFlagged?: boolean;
}

// Props for enhanced reader component
interface EnhancedReaderProps {
  post: ExtendedPost;
  className?: string;
}

export function EnhancedReader({ post, className = '' }: EnhancedReaderProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Check local state to avoid refetching when toggling likes/bookmarks
  const [likeState, setLikeState] = useState<boolean | undefined>(post.hasLiked);
  const [dislikeState, setDislikeState] = useState<boolean | undefined>(post.hasDisliked);
  const [bookmarkState, setBookmarkState] = useState<boolean | undefined>(post.isBookmarked);
  
  // Reset UI state when post changes
  useEffect(() => {
    setLikeState(post.hasLiked);
    setDislikeState(post.hasDisliked);
    setBookmarkState(post.isBookmarked);
  }, [post]);
  
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
  
  // Format published date
  const publishedDate = post.updatedAt || post.createdAt;
  const formattedDate = formatDistanceToNow(new Date(publishedDate), { addSuffix: true });
  
  // Get theme category badge
  const getThemeBadge = () => {
    if (!post.metadata?.themeCategory) return null;
    
    const category = post.metadata.themeCategory;
    const getColorClass = () => {
      switch (category) {
        case 'PSYCHOLOGICAL': return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'SUPERNATURAL': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'TECHNOLOGICAL': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'BODY_HORROR': return 'bg-red-100 text-red-800 border-red-300';
        case 'GOTHIC': return 'bg-slate-100 text-slate-800 border-slate-300';
        case 'APOCALYPTIC': return 'bg-amber-100 text-amber-800 border-amber-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };
    
    return (
      <Badge variant="outline" className={getColorClass()}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };
  
  // Get trigger warnings display
  const getTriggerWarnings = () => {
    if (!post.metadata?.triggerWarnings || post.metadata.triggerWarnings.length === 0) {
      return null;
    }
    
    return (
      <div className="flex items-center mt-2">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
        <span className="text-xs text-muted-foreground">
          Content warning: {post.metadata.triggerWarnings.join(', ')}
        </span>
      </div>
    );
  };
  
  // Like post mutation
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
      setLikeState(true);
      setDislikeState(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.slug}`] });
    },
    onError: (error: Error) => {
      // Reset to previous state on error
      setLikeState(post.hasLiked);
      setDislikeState(post.hasDisliked);
      
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Dislike post mutation
  const dislikeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/dislike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to dislike post');
      return response.json();
    },
    onMutate: () => {
      // Optimistic update
      setLikeState(false);
      setDislikeState(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.slug}`] });
    },
    onError: (error: Error) => {
      // Reset to previous state on error
      setLikeState(post.hasLiked);
      setDislikeState(post.hasDisliked);
      
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Bookmark post mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const method = bookmarkState ? 'DELETE' : 'POST';
      const response = await fetch(`/api/bookmarks/${post.id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to update bookmark');
      return response.json();
    },
    onMutate: () => {
      // Optimistic update
      setBookmarkState(!bookmarkState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.slug}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      
      toast({
        title: bookmarkState ? 'Bookmark Removed' : 'Bookmark Added',
        description: bookmarkState 
          ? 'This story has been removed from your bookmarks.' 
          : 'This story has been added to your bookmarks.',
      });
    },
    onError: (error: Error) => {
      // Reset to previous state on error
      setBookmarkState(post.isBookmarked);
      
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Flag post mutation
  const flagMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await fetch(`/api/posts/${post.id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) throw new Error('Failed to flag post');
      return response.json();
    },
    onSuccess: () => {
      setShowFlagDialog(false);
      setFlagReason('');
      
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.slug}`] });
      
      toast({
        title: 'Content Reported',
        description: 'Thank you for helping keep our community safe. Our team will review this content.',
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
  
  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to like posts',
        variant: 'default',
      });
      return;
    }
    
    if (likeState) {
      // If already liked, unlike it (remove the like)
      likeMutation.mutate();
    } else {
      // Otherwise like it
      likeMutation.mutate();
    }
  };
  
  const handleDislike = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to dislike posts',
        variant: 'default',
      });
      return;
    }
    
    if (dislikeState) {
      // If already disliked, remove the dislike
      dislikeMutation.mutate();
    } else {
      // Otherwise dislike it
      dislikeMutation.mutate();
    }
  };
  
  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to bookmark posts',
        variant: 'default',
      });
      return;
    }
    
    bookmarkMutation.mutate();
  };
  
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
  
  const submitFlag = () => {
    if (!flagReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for reporting this content.',
        variant: 'default',
      });
      return;
    }
    
    flagMutation.mutate(flagReason);
  };
  
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        
        toast({
          title: 'Link Copied',
          description: 'Link has been copied to clipboard.',
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
  
  const openShareDialog = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt || 'Check out this horror story!',
        url: window.location.href,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      handleCopyLink();
    }
  };
  
  // Estimated count of likes
  const displayLikes = post.likes + (likeState && !post.hasLiked ? 1 : 0) - (!likeState && post.hasLiked ? 1 : 0);
  
  return (
    <article className={`mx-auto max-w-4xl ${className}`}>
      {/* Story Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={post.author?.avatar || ''} alt={post.author?.username || 'Author'} />
              <AvatarFallback>{getAuthorInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.author?.username || 'Anonymous'}</div>
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="inline-block h-3.5 w-3.5 mr-1" />
                {formattedDate}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {getThemeBadge()}
            
            {post.metadata?.isCommunityPost && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                Community Story
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-4">
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {post.views} views
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {post.readingTime} min read
          </div>
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            {post.commentCount} comments
          </div>
        </div>
        
        {getTriggerWarnings()}
      </header>
      
      {/* Story Content */}
      <div 
        className="prose prose-invert max-w-none mb-10"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      {/* Engagement Bar */}
      <Card className="mt-8 p-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={likeState ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    disabled={likeMutation.isPending}
                    className="gap-2"
                  >
                    {likeState ? (
                      <Heart className="h-4 w-4 fill-current" />
                    ) : (
                      <ThumbsUp className="h-4 w-4" />
                    )}
                    {displayLikes}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{likeState ? 'Unlike' : 'Like'} this story</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={dislikeState ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleDislike}
                    disabled={dislikeMutation.isPending}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{dislikeState ? 'Remove dislike' : 'Dislike'} this story</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comment
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Leave a comment</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={bookmarkState ? "default" : "outline"}
                    size="sm"
                    onClick={handleBookmark}
                    disabled={bookmarkMutation.isPending}
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarkState ? 'fill-current' : ''}`} />
                    <span className="ml-1 hidden sm:inline">
                      {bookmarkState ? 'Bookmarked' : 'Bookmark'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{bookmarkState ? 'Remove from' : 'Add to'} bookmarks</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={openShareDialog}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Story
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  {isCopied ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {post.isFlagged ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="destructive"
                      size="sm"
                      disabled
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You've reported this content</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleFlag}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Report inappropriate content</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </Card>
      
      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent aria-labelledby="report-content-title-reader" aria-describedby="report-content-description-reader">
          <DialogHeader>
            <DialogTitle id="report-content-title-reader">Report Content</DialogTitle>
            <DialogDescription id="report-content-description-reader">
              Please let us know why you're reporting this content. This will help our moderators review it appropriately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Please explain why you're reporting this content..."
              className="min-h-[100px]"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFlagDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitFlag}
              disabled={flagMutation.isPending || !flagReason.trim()}
            >
              {flagMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}