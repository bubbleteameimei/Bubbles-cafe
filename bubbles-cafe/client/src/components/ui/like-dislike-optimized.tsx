import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface LikeDislikeProps {
  postId: number;
  variant?: 'index' | 'reader';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface ReactionData {
  likesCount: number;
  dislikesCount: number;
  userReaction: 'like' | 'dislike' | null;
}

export function LikeDislike({ 
  postId, 
  variant = 'index', 
  size = 'sm', 
  className 
}: LikeDislikeProps) {
  const { toast } = useToast();
  
  // Single state object for all reaction data
  const [data, setData] = useState<ReactionData>({
    likesCount: 0,
    dislikesCount: 0,
    userReaction: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch reaction data once on mount
  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/reactions`, {
          credentials: 'include'
        });
        
        if (!mounted) return;
        
        if (response.ok) {
          const result = await response.json();
          setData({
            likesCount: result.likesCount || 0,
            dislikesCount: result.dislikesCount || 0,
            userReaction: result.userReaction || null
          });
        } else {
          // Post might not exist, use defaults
          setData({
            likesCount: 0,
            dislikesCount: 0,
            userReaction: null
          });
        }
      } catch (error) {
        console.warn('[LikeDislike] Failed to fetch data:', error);
        if (mounted) {
          setData({
            likesCount: 0,
            dislikesCount: 0,
            userReaction: null
          });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();
    
    return () => {
      mounted = false;
    };
  }, [postId]);

  // Handle reaction updates with optimistic UI
  const updateReaction = useCallback(async (newReaction: 'like' | 'dislike' | null) => {
    if (isUpdating) return;
    
    // Don't update if clicking the same reaction
    if (data.userReaction === newReaction) return;
    
    setIsUpdating(true);
    
    // Optimistic update
    const oldData = data;
    const optimisticData = { ...data };
    
    // Remove old reaction
    if (data.userReaction === 'like') {
      optimisticData.likesCount = Math.max(0, optimisticData.likesCount - 1);
    } else if (data.userReaction === 'dislike') {
      optimisticData.dislikesCount = Math.max(0, optimisticData.dislikesCount - 1);
    }
    
    // Add new reaction
    if (newReaction === 'like') {
      optimisticData.likesCount += 1;
    } else if (newReaction === 'dislike') {
      optimisticData.dislikesCount += 1;
    }
    
    optimisticData.userReaction = newReaction;
    setData(optimisticData);
    
    try {
      const response = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reaction: newReaction })
      });
      
      if (response.ok) {
        const result = await response.json();
        setData({
          likesCount: result.likesCount || 0,
          dislikesCount: result.dislikesCount || 0,
          userReaction: result.userReaction || null
        });
        
        if (newReaction === 'like') {
          toast({
            description: "Thanks for liking!"
          });
        } else if (newReaction === 'dislike') {
          toast({
            description: "Thanks for the feedback!"
          });
        }
      } else {
        // Revert on error
        setData(oldData);
        toast({
          title: "Error",
          description: "Failed to update reaction. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Revert on error
      setData(oldData);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [data, isUpdating, postId, toast]);

  const handleLike = useCallback(() => {
    const newReaction = data.userReaction === 'like' ? null : 'like';
    updateReaction(newReaction);
  }, [data.userReaction, updateReaction]);

  const handleDislike = useCallback(() => {
    const newReaction = data.userReaction === 'dislike' ? null : 'dislike';
    updateReaction(newReaction);
  }, [data.userReaction, updateReaction]);

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center gap-2 animate-pulse",
        variant === 'reader' ? "justify-center" : "",
        className
      )}>
        <div className="h-8 w-16 bg-muted rounded"></div>
        <div className="h-8 w-16 bg-muted rounded"></div>
      </div>
    );
  }

  const buttonClass = cn(
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all duration-200",
    "border border-border bg-background hover:bg-muted/50",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    size === 'lg' && "px-4 py-2 text-base",
    size === 'md' && "px-3 py-1.5 text-sm",
    size === 'sm' && "px-2 py-1 text-xs"
  );

  return (
    <div className={cn(
      variant === 'reader' ? "flex flex-col items-center gap-3" : "flex items-center gap-2",
      className
    )}>
      {variant === 'reader' && (
        <p className="text-muted-foreground text-center">
          How did you like this story?
        </p>
      )}
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleLike}
          disabled={isUpdating}
          className={cn(
            buttonClass,
            data.userReaction === 'like' && "bg-green-100 border-green-300 text-green-700",
            data.userReaction === 'like' && "dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
          )}
        >
          <ThumbsUp className={cn(
            "w-4 h-4",
            size === 'lg' && "w-5 h-5",
            size === 'sm' && "w-3 h-3"
          )} />
          <span>{data.likesCount}</span>
        </button>
        
        <button
          onClick={handleDislike}
          disabled={isUpdating}
          className={cn(
            buttonClass,
            data.userReaction === 'dislike' && "bg-red-100 border-red-300 text-red-700",
            data.userReaction === 'dislike' && "dark:bg-red-900/30 dark:border-red-600 dark:text-red-400"
          )}
        >
          <ThumbsDown className={cn(
            "w-4 h-4",
            size === 'lg' && "w-5 h-5", 
            size === 'sm' && "w-3 h-3"
          )} />
          <span>{data.dislikesCount}</span>
        </button>
      </div>
    </div>
  );
}