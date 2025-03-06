import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";

interface LikeDislikeProps {
  postId: number;
  userLikeStatus?: 'like' | 'dislike' | null;
  onLike?: (liked: boolean) => void;
  onDislike?: (disliked: boolean) => void;
  onUpdate?: (likes: number, dislikes: number) => void;
  className?: string;
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
    && !isNaN(obj.likes)
    && typeof obj.dislikes === 'number'
    && !isNaN(obj.dislikes)
    && obj.baseStats
    && typeof obj.baseStats.likes === 'number'
    && !isNaN(obj.baseStats.likes)
    && typeof obj.baseStats.dislikes === 'number'
    && !isNaN(obj.baseStats.dislikes)
    && typeof obj.userInteracted === 'boolean';
}

const getStorageKey = (postId: number) => `post-stats-${postId}`;

const getOrCreateStats = (postId: number): Stats => {
  try {
    const storageKey = getStorageKey(postId);
    const existingStats = localStorage.getItem(storageKey);

    if (existingStats) {
      const parsed = JSON.parse(existingStats);
      if (isValidStats(parsed)) {
        return parsed;
      }
    }

    const likesBase = Math.floor(Math.random() * (150 - 80 + 1)) + 80;
    const dislikesBase = Math.floor(Math.random() * (20 - 8 + 1)) + 8;

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
      likes: 100,
      dislikes: 10,
      baseStats: {
        likes: 100,
        dislikes: 10
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
  onUpdate,
  className
}: LikeDislikeProps) {
  const { toast } = useToast();
  const [liked, setLiked] = useState(userLikeStatus === 'like');
  const [disliked, setDisliked] = useState(userLikeStatus === 'dislike');
  const [stats, setStats] = useState<Stats>(() => getOrCreateStats(postId));

  const updateStats = (newStats: Stats) => {
    try {
      localStorage.setItem(getStorageKey(postId), JSON.stringify(newStats));
      setStats(newStats);
      onUpdate?.(newStats.likes, newStats.dislikes);
    } catch (error) {
      console.error(`[LikeDislike] Error updating stats for post ${postId}:`, error);
      toast({
        title: "Error updating reaction",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleLike = () => {
    const newLiked = !liked;
    try {
      if (newLiked) {
        setLiked(true);
        setDisliked(false);
        updateStats({
          ...stats,
          likes: stats.likes + 1,
          dislikes: disliked ? stats.dislikes - 1 : stats.dislikes,
          baseStats: stats.baseStats,
          userInteracted: true
        });
        toast({
          description: "Thanks for liking! 🥰",
        });
      } else {
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
      toast({
        title: "Error updating like",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDislike = () => {
    const newDisliked = !disliked;
    try {
      if (newDisliked) {
        setDisliked(true);
        setLiked(false);
        updateStats({
          ...stats,
          dislikes: stats.dislikes + 1,
          likes: liked ? stats.likes - 1 : stats.likes,
          baseStats: stats.baseStats,
          userInteracted: true
        });
        toast({
          description: "Thanks for the feedback! 😔",
        });
      } else {
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
      toast({
        title: "Error updating dislike",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={className}>
      <p className="text-center text-sm font-medium mb-3 text-muted-foreground">
        Loved this story? Let me know with a like🥹—or a dislike if you must 😔
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center gap-2 ${
            liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          <ThumbsUp className="h-5 w-5" />
          <span>{stats.likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDislike}
          className={`flex items-center gap-2 ${
            disliked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
          }`}
        >
          <ThumbsDown className="h-5 w-5" />
          <span>{stats.dislikes}</span>
        </Button>
      </div>
    </div>
  );
}