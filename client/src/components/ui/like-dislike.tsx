import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LikeDislikeProps {
  postId: number;
  initialLikes?: number;
  initialDislikes?: number;
  userLikeStatus?: 'like' | 'dislike' | null;
  onLike?: (liked: boolean) => void;
  onDislike?: (disliked: boolean) => void;
}

interface ReactionResponse {
  likesCount: number;
  dislikesCount: number;
  message?: string;
}

export function LikeDislike({
  postId,
  initialLikes = 0,
  initialDislikes = 0,
  userLikeStatus = null,
  onLike,
  onDislike
}: LikeDislikeProps) {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(userLikeStatus === 'like');
  const [disliked, setDisliked] = useState(userLikeStatus === 'dislike');
  const [counts, setCounts] = useState({
    likesCount: initialLikes,
    dislikesCount: initialDislikes
  });

  // Update counts when props change
  useEffect(() => {
    setCounts({
      likesCount: initialLikes,
      dislikesCount: initialDislikes
    });
  }, [initialLikes, initialDislikes]);

  const likeMutation = useMutation({
    mutationFn: async (action: { isLike: boolean }): Promise<ReactionResponse> => {
      console.log(`[LikeDislike] Sending ${action.isLike ? 'like' : 'dislike'} reaction for post ${postId}`);
      const response = await fetch(`/api/posts/${postId}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update reaction');
      }

      const data = await response.json();
      console.log('[LikeDislike] Reaction response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('[LikeDislike] Mutation succeeded:', data);
      // Update the cache with new counts
      queryClient.setQueryData(['/api/posts', postId], (oldData: any) => ({
        ...oldData,
        likesCount: data.likesCount,
        dislikesCount: data.dislikesCount
      }));
      setCounts(data);
    },
    onError: (error: Error) => {
      console.error('[LikeDislike] Mutation error:', error);
      // Silent error handling - just reset the state
      setLiked(false);
      setDisliked(false);
    }
  });

  const handleLike = async () => {
    if (likeMutation.isPending) return;

    const newLiked = !liked;
    const previousState = {
      liked,
      disliked,
      counts: { ...counts }
    };

    // Optimistically update UI
    setLiked(newLiked);
    if (newLiked) {
      setCounts(prev => ({ 
        ...prev, 
        likesCount: prev.likesCount + 1,
        dislikesCount: disliked ? prev.dislikesCount - 1 : prev.dislikesCount
      }));
      if (disliked) setDisliked(false);
    } else {
      setCounts(prev => ({ ...prev, likesCount: Math.max(0, prev.likesCount - 1) }));
    }

    try {
      await likeMutation.mutateAsync({ isLike: true });
      onLike?.(newLiked);
    } catch (error) {
      // Revert on error
      setLiked(previousState.liked);
      setDisliked(previousState.disliked);
      setCounts(previousState.counts);
    }
  };

  const handleDislike = async () => {
    if (likeMutation.isPending) return;

    const newDisliked = !disliked;
    const previousState = {
      liked,
      disliked,
      counts: { ...counts }
    };

    // Optimistically update UI
    setDisliked(newDisliked);
    if (newDisliked) {
      setCounts(prev => ({ 
        ...prev, 
        dislikesCount: prev.dislikesCount + 1,
        likesCount: liked ? prev.likesCount - 1 : prev.likesCount
      }));
      if (liked) setLiked(false);
    } else {
      setCounts(prev => ({ ...prev, dislikesCount: Math.max(0, prev.dislikesCount - 1) }));
    }

    try {
      await likeMutation.mutateAsync({ isLike: false });
      onDislike?.(newDisliked);
    } catch (error) {
      // Revert on error
      setLiked(previousState.liked);
      setDisliked(previousState.disliked);
      setCounts(previousState.counts);
    }
  };

  return (
    <div className="w-full flex items-center gap-6 z-10 relative bg-transparent pointer-events-auto">
      <Button
        variant={liked ? "default" : "ghost"}
        size="sm"
        onClick={handleLike}
        className={`relative group flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 ${
          liked ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-primary/5'
        } pointer-events-auto`}
        disabled={likeMutation.isPending}
      >
        <ThumbsUp className={`h-4 w-4 transition-transform group-hover:scale-110 ${
          liked ? 'text-primary' : 'text-muted-foreground'
        }`} />
        <span className={`text-sm ${
          liked ? 'text-primary' : 'text-muted-foreground'
        }`}>{counts.likesCount}</span>
      </Button>

      <Button
        variant={disliked ? "default" : "ghost"}
        size="sm"
        onClick={handleDislike}
        className={`relative group flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 ${
          disliked ? 'bg-destructive/10 hover:bg-destructive/20' : 'hover:bg-destructive/5'
        } pointer-events-auto`}
        disabled={likeMutation.isPending}
      >
        <ThumbsDown className={`h-4 w-4 transition-transform group-hover:scale-110 ${
          disliked ? 'text-destructive' : 'text-muted-foreground'
        }`} />
        <span className={`text-sm ${
          disliked ? 'text-destructive' : 'text-muted-foreground'
        }`}>{counts.dislikesCount}</span>
      </Button>
    </div>
  );
}