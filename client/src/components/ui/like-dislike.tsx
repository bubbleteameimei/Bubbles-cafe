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

  // Load persisted stats on mount
  useEffect(() => {
    const storageKey = `post-stats-${postId}`;
    const storedStats = localStorage.getItem(storageKey);
    if (storedStats) {
      const stats = JSON.parse(storedStats);
      setCounts(stats);
    }
  }, [postId]);

  const updateLocalStorage = (newCounts: { likes: number, dislikes: number }) => {
    const storageKey = `post-stats-${postId}`;
    localStorage.setItem(storageKey, JSON.stringify(newCounts));
  };

  const likeMutation = useMutation({
    mutationFn: async (isLike: boolean) => {
      const storageKey = `post-stats-${postId}`;
      const currentStats = JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(counts));

      let newStats = { ...currentStats };
      if (isLike) {
        if (liked) {
          newStats.likes = Math.max(0, newStats.likes - 1);
        } else {
          if (newStats.likes >= 150) {
            throw new Error("Maximum likes reached");
          }
          newStats.likes = Math.min(150, newStats.likes + 1);
          if (disliked) {
            newStats.dislikes = Math.max(0, newStats.dislikes - 1);
          }
        }
      } else {
        if (disliked) {
          newStats.dislikes = Math.max(0, newStats.dislikes - 1);
        } else {
          if (newStats.dislikes >= 15) {
            throw new Error("Maximum dislikes reached");
          }
          newStats.dislikes = Math.min(15, newStats.dislikes + 1);
          if (liked) {
            newStats.likes = Math.max(0, newStats.likes - 1);
          }
        }
      }

      updateLocalStorage(newStats);
      return newStats;
    },
    onSuccess: (newStats) => {
      setCounts(newStats);
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
    if (counts.likes >= 150 && !liked) {
      toast({
        title: "Maximum likes reached",
        description: "This post has reached its maximum number of likes.",
        variant: "default"
      });
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);
    if (disliked) setDisliked(false);

    try {
      await likeMutation.mutateAsync(true);
      onLike?.(newLiked);
    } catch (error) {
      setLiked(!newLiked);
      if (disliked) setDisliked(true);
    }
  };

  const handleDislike = async () => {
    if (counts.dislikes >= 15 && !disliked) {
      toast({
        title: "Maximum dislikes reached",
        description: "This post has reached its maximum number of dislikes.",
        variant: "destructive"
      });
      return;
    }

    const newDisliked = !disliked;
    setDisliked(newDisliked);
    if (liked) setLiked(false);

    try {
      await likeMutation.mutateAsync(false);
      onDislike?.(newDisliked);
    } catch (error) {
      setDisliked(!newDisliked);
      if (liked) setLiked(true);
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
        disabled={likeMutation.isPending || (counts.likes >= 150 && !liked)}
      >
        <ThumbsUp className={`h-4 w-4 transition-transform group-hover:scale-110 ${
          liked ? 'text-primary' : 'text-muted-foreground'
        }`} />
        <span className={`text-sm ${
          liked ? 'text-primary' : 'text-muted-foreground'
        }`}>{counts.likes}</span>
        {liked && (
          <div className="absolute -top-1 -right-1 w-2 h-2 animate-ping rounded-full bg-primary/50" />
        )}
      </Button>

      <Button
        variant={disliked ? "default" : "ghost"}
        size="sm"
        onClick={handleDislike}
        className={`relative group flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 ${
          disliked ? 'bg-destructive/10 hover:bg-destructive/20' : 'hover:bg-destructive/5'
        } pointer-events-auto`}
        disabled={likeMutation.isPending || (counts.dislikes >= 15 && !disliked)}
      >
        <ThumbsDown className={`h-4 w-4 transition-transform group-hover:scale-110 ${
          disliked ? 'text-destructive' : 'text-muted-foreground'
        }`} />
        <span className={`text-sm ${
          disliked ? 'text-destructive' : 'text-muted-foreground'
        }`}>{counts.dislikes}</span>
        {disliked && (
          <div className="absolute -top-1 -right-1 w-2 h-2 animate-ping rounded-full bg-destructive/50" />
        )}
      </Button>
    </div>
  );
}