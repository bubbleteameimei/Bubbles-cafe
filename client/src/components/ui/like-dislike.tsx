import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(userLikeStatus === 'like');
  const [disliked, setDisliked] = useState(userLikeStatus === 'dislike');
  const [counts, setCounts] = useState({
    likesCount: initialLikes,
    dislikesCount: initialDislikes
  });

  useEffect(() => {
    console.log(`[LikeDislike] Initialized for post ${postId}:`, {
      initialLikes,
      initialDislikes,
      userLikeStatus,
      currentState: { liked, disliked, counts }
    });
  }, []);

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
        if (response.status === 401) {
          throw new Error('Please log in to like or dislike posts');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update reaction');
      }

      const data = await response.json();
      console.log('[LikeDislike] Reaction response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('[LikeDislike] Mutation succeeded:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
      setCounts(data);
      if (data.message) {
        toast({
          title: "Success",
          description: data.message,
        });
      }
    },
    onError: (error: Error) => {
      console.error('[LikeDislike] Mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update. Please try again.",
        variant: "destructive"
      });
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

    console.log('[LikeDislike] Handling like click:', {
      postId,
      currentState: previousState,
      newLiked
    });

    // Optimistically update UI
    setLiked(newLiked);
    if (newLiked) {
      setCounts(prev => ({ ...prev, likesCount: prev.likesCount + 1 }));
      if (disliked) {
        setDisliked(false);
        setCounts(prev => ({ ...prev, dislikesCount: Math.max(0, prev.dislikesCount - 1) }));
      }
    } else {
      setCounts(prev => ({ ...prev, likesCount: Math.max(0, prev.likesCount - 1) }));
    }

    try {
      await likeMutation.mutateAsync({ isLike: true });
      console.log('[LikeDislike] Like mutation completed successfully');
      onLike?.(newLiked);
    } catch (error) {
      console.error('[LikeDislike] Error during like mutation:', error);
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

    console.log('[LikeDislike] Handling dislike click:', {
      postId,
      currentState: previousState,
      newDisliked
    });

    // Optimistically update UI
    setDisliked(newDisliked);
    if (newDisliked) {
      setCounts(prev => ({ ...prev, dislikesCount: prev.dislikesCount + 1 }));
      if (liked) {
        setLiked(false);
        setCounts(prev => ({ ...prev, likesCount: Math.max(0, prev.likesCount - 1) }));
      }
    } else {
      setCounts(prev => ({ ...prev, dislikesCount: Math.max(0, prev.dislikesCount - 1) }));
    }

    try {
      await likeMutation.mutateAsync({ isLike: false });
      console.log('[LikeDislike] Dislike mutation completed successfully');
      onDislike?.(newDisliked);
    } catch (error) {
      console.error('[LikeDislike] Error during dislike mutation:', error);
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