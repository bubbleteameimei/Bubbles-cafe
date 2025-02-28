import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";

interface LikeDislikeProps {
  postId: number;
  userLikeStatus?: 'like' | 'dislike' | null;
  onLike?: (liked: boolean) => void;
  onDislike?: (disliked: boolean) => void;
  onUpdate?: (likes: number, dislikes: number) => void;
}

interface Stats {
  likes: number;
  dislikes: number;
  baseStats: {
    likes: number;
    dislikes: number;
  };
  userInteracted: boolean;
}

function isValidStats(obj: any): obj is Stats {
  return obj 
    && typeof obj.likes === 'number'
    && typeof obj.dislikes === 'number'
    && obj.baseStats
    && typeof obj.baseStats.likes === 'number'
    && typeof obj.baseStats.dislikes === 'number'
    && typeof obj.userInteracted === 'boolean';
}

const getOrCreateStats = (postId: number): Stats => {
  try {
    const storageKey = `post-stats-${postId}`;
    const existingStats = localStorage.getItem(storageKey);

    if (existingStats) {
      const parsed = JSON.parse(existingStats);
      if (isValidStats(parsed)) {
        return parsed;
      }
    }

    // Calculate deterministic likes and dislikes based on post ID
    const likesBase = Math.max(5, postId % 20 + 10); // Between 5 and 30
    const dislikesBase = Math.max(1, postId % 5 + 2); // Between 1 and 7

    const newStats: Stats = {
      likes: likesBase,
      dislikes: dislikesBase,
      baseStats: {
        likes: likesBase,
        dislikes: dislikesBase
      },
      userInteracted: false
    };

    localStorage.setItem(storageKey, JSON.stringify(newStats));
    return newStats;
  } catch (error) {
    console.error(`[LikeDislike] Error managing stats for post ${postId}:`, error);
    return {
      likes: 10,
      dislikes: 2,
      baseStats: {
        likes: 10,
        dislikes: 2
      },
      userInteracted: false
    };
  }
};

export function LikeDislike({
  postId,
  userLikeStatus = null,
  onLike,
  onDislike,
  onUpdate
}: LikeDislikeProps) {
  const [liked, setLiked] = useState(userLikeStatus === 'like');
  const [disliked, setDisliked] = useState(userLikeStatus === 'dislike');
  const [stats, setStats] = useState<Stats>(() => getOrCreateStats(postId));
  const { toast } = useToast();

  useEffect(() => {
    const savedStats = getOrCreateStats(postId);
    setStats(savedStats);
  }, [postId]);

  const updateStats = (newStats: Stats) => {
    try {
      localStorage.setItem(`post-stats-${postId}`, JSON.stringify(newStats));
      setStats(newStats);
      onUpdate?.(newStats.likes, newStats.dislikes);
    } catch (error) {
      console.error(`[LikeDislike] Error updating stats for post ${postId}:`, error);
      toast({
        title: "Error updating reaction",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleLike = () => {
    const newLiked = !liked;
    const previousState = {
      liked,
      disliked,
      stats: { ...stats }
    };

    try {
      if (newLiked) {
        // When liking
        setLiked(true);
        setDisliked(false);
        updateStats({
          ...stats,
          likes: stats.likes + 1,
          dislikes: disliked ? stats.dislikes - 1 : stats.dislikes,
          baseStats: stats.baseStats,
          userInteracted: true
        });
      } else {
        // When unliking
        setLiked(false);
        updateStats({
          ...stats,
          likes: stats.likes - 1,
          baseStats: stats.baseStats,
          userInteracted: false
        });
      }

      onLike?.(newLiked);
    } catch (error) {
      console.error(`[LikeDislike] Error handling like for post ${postId}:`, error);
      setLiked(previousState.liked);
      setDisliked(previousState.disliked);
      updateStats(previousState.stats);
    }
  };

  const handleDislike = () => {
    const newDisliked = !disliked;
    const previousState = {
      liked,
      disliked,
      stats: { ...stats }
    };

    try {
      if (newDisliked) {
        // When disliking
        setDisliked(true);
        setLiked(false);
        updateStats({
          ...stats,
          dislikes: stats.dislikes + 1,
          likes: liked ? stats.likes - 1 : stats.likes,
          baseStats: stats.baseStats,
          userInteracted: true
        });
      } else {
        // When undisliking
        setDisliked(false);
        updateStats({
          ...stats,
          dislikes: stats.dislikes - 1,
          baseStats: stats.baseStats,
          userInteracted: false
        });
      }

      onDislike?.(newDisliked);
    } catch (error) {
      console.error(`[LikeDislike] Error handling dislike for post ${postId}:`, error);
      setLiked(previousState.liked);
      setDisliked(previousState.disliked);
      updateStats(previousState.stats);
    }
  };

  return (
    <div className="flex items-center gap-4 z-10 relative bg-transparent pointer-events-auto">
      <Button
        variant={liked ? "default" : "ghost"}
        size="sm"
        onClick={handleLike}
        className={`flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 ${
          liked ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-primary/5'
        }`}
      >
        <ThumbsUp className={`h-4 w-4 transition-transform ${
          liked ? 'text-primary' : 'text-muted-foreground'
        }`} />
        <span className={`text-sm ${
          liked ? 'text-primary' : 'text-muted-foreground'
        }`}>{stats.likes}</span>
      </Button>

      <Button
        variant={disliked ? "default" : "ghost"}
        size="sm"
        onClick={handleDislike}
        className={`flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 ${
          disliked ? 'bg-destructive/10 hover:bg-destructive/20' : 'hover:bg-destructive/5'
        }`}
      >
        <ThumbsDown className={`h-4 w-4 transition-transform ${
          disliked ? 'text-destructive' : 'text-muted-foreground'
        }`} />
        <span className={`text-sm ${
          disliked ? 'text-destructive' : 'text-muted-foreground'
        }`}>{stats.dislikes}</span>
      </Button>
    </div>
  );
}