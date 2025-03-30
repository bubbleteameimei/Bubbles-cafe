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
  
  // Check if the current user is the author
  const isAuthor = currentUser?.id === post.authorId;
  
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
        description: 'Your story has been deleted successfully.',
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
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) throw new Error('Failed to flag post');
      return response.json();
    },
    onSuccess: () => {
      setShowFlagDialog(false);
      setFlagReason('');
      
      queryClient.invalidateQueries({ queryKey: ['/api/posts/community'] });
      
      toast({
        title: 'Content Reported',
        description: 'Thank you for reporting this content. Our moderators will review it.',
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
  
  // Copy post link to clipboard
  const copyLink = () => {
    const url = `${window.location.origin}/reader/${post.slug}`;
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
        url: `${window.location.origin}/reader/${post.slug}`,
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      copyLink();
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md mb-6 reader-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/reader/${post.slug}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Read Story
              </DropdownMenuItem>
              
              {isAuthor && (
                <>
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Story
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Story
                  </DropdownMenuItem>
                </>
              )}
              
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
              {isAuthenticated && !isAuthor && (
                <DropdownMenuItem onClick={handleFlag} disabled={post.isFlagged}>
                  <Flag className="h-4 w-4 mr-2" />
                  {post.isFlagged ? 'Reported' : 'Report Story'}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <CardTitle 
          className="text-2xl mb-3 hover:text-primary cursor-pointer font-serif"
          onClick={() => navigate(`/reader/${post.slug}`)}
        >
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
              onClick={() => navigate(`/reader/${post.slug}#comments`)}
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
            <DialogTitle>Delete Story</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this story? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between border p-3 rounded-md bg-muted/50 mt-2">
            <div className="font-medium truncate pr-2">{post.title}</div>
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
      
      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
            <DialogDescription>
              Please let us know why you're reporting this content. This will help our moderators review it appropriately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <textarea
              className="w-full min-h-[100px] p-3 border rounded-md"
              placeholder="Please explain why you're reporting this content..."
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
    </Card>
  );
}