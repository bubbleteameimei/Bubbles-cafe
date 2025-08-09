import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Share2, Heart, Flag, Copy, MoreHorizontal, Eye, MessageCircle, Bookmark, Check, Share, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types/user';
import type { ExtendedPost as Post, AuthorSummary } from '@shared/public';

// Extended Post type with UI-specific properties
interface UIExtendedPost extends Post {
  author?: AuthorSummary;
  likes?: number;
  commentCount?: number;
  views?: number;
  hasLiked?: boolean;
  isBookmarked?: boolean;
  isFlagged?: boolean;
}

interface CommunityPostCardProps {
  post: UIExtendedPost;
  isAuthenticated: boolean;
  currentUser?: User | null;
}

export function CommunityPostCard({ post, isAuthenticated, currentUser }: CommunityPostCardProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local UI states
  const [isLiked, setIsLiked] = useState(post.hasLiked || false);
  const [isCopied, setIsCopied] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  
  // Format date
  const formattedDate = post.createdAt || new Date().toISOString();
  const timeAgo = formatDistanceToNow(new Date(formattedDate), { addSuffix: true });
  
  // Get theme category for badge
  const getThemeBadge = () => {
    const metadata: any = post.metadata;
    if (!metadata?.themeCategory) return null;
    
    const category = metadata.themeCategory as string;
    let colorClass = 'bg-gray-100 text-gray-800 border-gray-300';
    let displayName = category.replace('_', ' ');
    
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
        displayName = 'Body Horror';
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
  
  // Create excerpt from content
  const createExcerpt = (content: string, maxLength = 150) => {
    // Strip HTML tags
    const strippedContent = content.replace(/<[^>]*>/g, '');
    
    // Shorten text and add ellipsis if needed
    if (strippedContent.length <= maxLength) return strippedContent;
    
    return strippedContent.slice(0, maxLength - 3) + '...';
  };
  
  // Check for trigger warnings
  const metadata: any = post.metadata;
  const hasTriggerWarnings = 
    metadata?.triggerWarnings && 
    (metadata.triggerWarnings as any[]).length > 0;
  
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
    onError: () => {
      setIsLiked(false);
      toast({
        title: 'Error',
        description: 'Could not like the post. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
  
  const handleLikeClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to like content',
        variant: 'default',
      });
      return;
    }
    likeMutation.mutate();
  };
  
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
      toast({
        title: 'Reported',
        description: 'Thank you for your report. Our moderators will review it.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Could not report the post. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
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
  
  // Submit flag reason
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
  
  const safeSlug = post.slug || `${post.id}`;
  
  // Copy post link to clipboard
  const copyLink = () => {
    const url = `${window.location.origin}/reader/${safeSlug}`;
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
        url: `${window.location.origin}/reader/${safeSlug}`,
      }).catch(() => {
        
      });
    } else {
      copyLink();
    }
  };
  
  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author?.avatar || ''} alt={post.author?.username || 'Author'} />
              <AvatarFallback>{getAuthorInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.author?.username || 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/reader/${safeSlug}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Read Story
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                {isCopied ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={sharePost}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              {isAuthenticated && (
                <DropdownMenuItem onClick={handleFlag} disabled={post.isFlagged}>
                  <Flag className="h-4 w-4 mr-2" />
                  {post.isFlagged ? 'Reported' : 'Report Story'}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 flex-grow">
        <CardTitle 
          className="text-lg mb-2 line-clamp-2 hover:text-primary cursor-pointer"
          onClick={() => navigate(`/reader/${safeSlug}`)}
        >
          {post.title}
        </CardTitle>
        
        <CardDescription className="line-clamp-3 mb-3">
          {post.excerpt || createExcerpt(post.content)}
        </CardDescription>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {getThemeBadge()}
          
          {hasTriggerWarnings && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              Content Warning
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 border-t">
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
              <span>{post.likes ?? 0}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 px-2"
              onClick={() => navigate(`/reader/${safeSlug}#comments`)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentCount ?? 0}</span>
            </Button>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs">{post.readingTimeMinutes || 5} min read</span>
          </div>
        </div>
      </CardFooter>
      
      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent aria-labelledby="report-content-title" aria-describedby="report-content-description">
          <DialogHeader>
            <DialogTitle id="report-content-title">Report Content</DialogTitle>
            <DialogDescription id="report-content-description">
              Please provide a reason for reporting this content.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            placeholder="Describe the issue..."
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowFlagDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={submitFlag}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}