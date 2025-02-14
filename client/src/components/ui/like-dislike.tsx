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
    likes: initialLikes,
    dislikes: initialDislikes
  });

  const likeMutation = useMutation({
    mutationFn: async (isLike: boolean) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLike })
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleLike = async () => {
    if (likeMutation.isPending) {
      return;
    }

    const newLiked = !liked;
    const previousState = {
      liked,
      disliked,
      counts: { ...counts }
    };

    // Optimistically update UI
    setLiked(newLiked);
    if (newLiked) {
      setCounts(prev => ({ ...prev, likes: prev.likes + 1 }));
      if (disliked) {
        setDisliked(false);
        setCounts(prev => ({ ...prev, dislikes: Math.max(0, prev.dislikes - 1) }));
      }
    } else {
      setCounts(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
    }

    try {
      await likeMutation.mutateAsync(true);
      onLike?.(newLiked);
    } catch (error) {
      // Revert on error
      setLiked(previousState.liked);
      setDisliked(previousState.disliked);
      setCounts(previousState.counts);
    }
  };

  const handleDislike = async () => {
    if (likeMutation.isPending) {
      return;
    }

    const newDisliked = !disliked;
    const previousState = {
      liked,
      disliked,
      counts: { ...counts }
    };

    // Optimistically update UI
    setDisliked(newDisliked);
    if (newDisliked) {
      setCounts(prev => ({ ...prev, dislikes: prev.dislikes + 1 }));
      if (liked) {
        setLiked(false);
        setCounts(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
      }
    } else {
      setCounts(prev => ({ ...prev, dislikes: Math.max(0, prev.dislikes - 1) }));
    }

    try {
      await likeMutation.mutateAsync(false);
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
        }`}>{counts.likes}</span>
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
        }`}>{counts.dislikes}</span>
      </Button>
    </div>
  );
}