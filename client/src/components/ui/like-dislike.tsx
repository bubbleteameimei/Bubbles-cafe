import { useState, useRef, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  const countRef = useRef({
    likes: initialLikes,
    dislikes: initialDislikes
  });

  useEffect(() => {
    countRef.current = {
      likes: initialLikes,
      dislikes: initialDislikes
    };
  }, [initialLikes, initialDislikes]);

  const likeMutation = useMutation({
    mutationFn: async (isLike: boolean) => {
      return apiRequest('POST', `/api/posts/${postId}/like`, { isLike });
    },
    onMutate: async (isLike) => {
      await queryClient.cancelQueries({ queryKey: ['/api/posts', postId] });
      const previousPost = queryClient.getQueryData(['/api/posts', postId]);

      // Optimistically update the UI
      queryClient.setQueryData(['/api/posts', postId], (old: any) => ({
        ...old,
        likesCount: isLike ? old.likesCount + 1 : old.likesCount,
        dislikesCount: !isLike ? old.dislikesCount + 1 : old.dislikesCount
      }));

      return { previousPost };
    },
    onError: (err, _, context) => {
      // Revert to previous state on error
      if (context?.previousPost) {
        queryClient.setQueryData(['/api/posts', postId], context.previousPost);
      }
      toast({
        title: "Error",
        description: "Failed to update. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
    }
  });

  const handleLike = async () => {
    if (disliked) {
      setDisliked(false);
    }
    const newLiked = !liked;
    setLiked(newLiked);
    try {
      await likeMutation.mutateAsync(true);
      onLike?.(newLiked);
    } catch (error) {
      setLiked(!newLiked); // Revert on error
    }
  };

  const handleDislike = async () => {
    if (liked) {
      setLiked(false);
    }
    const newDisliked = !disliked;
    setDisliked(newDisliked);
    try {
      await likeMutation.mutateAsync(false);
      onDislike?.(newDisliked);
    } catch (error) {
      setDisliked(!newDisliked); // Revert on error
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant={liked ? "default" : "ghost"}
        size="icon"
        onClick={handleLike}
        className="relative group hover:scale-110 active:scale-95 transition-all duration-200"
        disabled={likeMutation.isPending}
      >
        <ThumbsUp className={`h-5 w-5 transition-transform group-hover:scale-110 ${liked ? 'text-primary' : ''}`} />
        <span className="ml-2">{countRef.current.likes + (liked ? 1 : 0)}</span>
        {liked && (
          <div className="absolute -top-1 -right-1 w-2 h-2 animate-ping rounded-full bg-primary/50" />
        )}
      </Button>

      <Button
        variant={disliked ? "default" : "ghost"}
        size="icon"
        onClick={handleDislike}
        className="relative group hover:scale-110 active:scale-95 transition-all duration-200"
        disabled={likeMutation.isPending}
      >
        <ThumbsDown className={`h-5 w-5 transition-transform group-hover:scale-110 ${disliked ? 'text-destructive' : ''}`} />
        <span className="ml-2">{countRef.current.dislikes + (disliked ? 1 : 0)}</span>
        {disliked && (
          <div className="absolute -top-1 -right-1 w-2 h-2 animate-ping rounded-full bg-destructive/50" />
        )}
      </Button>
    </div>
  );
}