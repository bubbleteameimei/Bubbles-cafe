import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./button";

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
      console.log(`[LikeDislike] Invalid stats found for post ${postId}, recreating...`);
    }

    // Calculate deterministic likes and dislikes based on post ID
    const likesBase = 80;
    const likesRange = 40; // To get max of 120
    const dislikesBase = 5;
    const dislikesRange = 15; // To get max of 20

    // Use post ID to generate deterministic but varying values
    const likes = likesBase + (postId * 7) % likesRange;
    const dislikes = dislikesBase + (postId * 3) % dislikesRange;

    const newStats: Stats = {
      likes,
      dislikes,
      baseStats: {
        likes,
        dislikes
      },
      userInteracted: false
    };

    localStorage.setItem(storageKey, JSON.stringify(newStats));
    console.log(`[LikeDislike] Created new stats for post ${postId}:`, newStats);
    return newStats;
  } catch (error) {
    console.error(`[LikeDislike] Error managing stats for post ${postId}:`, error);
    // Fallback to ensure we always return valid stats
    return {
      likes: 80,
      dislikes: 5,
      baseStats: {
        likes: 80,
        dislikes: 5
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

  useEffect(() => {
    const savedStats = getOrCreateStats(postId);
    console.log(`[LikeDislike] Loaded stats for post ${postId}:`, savedStats);
    setStats(savedStats);
  }, [postId]);

  const updateStats = (newStats: Stats) => {
    try {
      localStorage.setItem(`post-stats-${postId}`, JSON.stringify(newStats));
      setStats(newStats);
      onUpdate?.(newStats.likes, newStats.dislikes);
      console.log(`[LikeDislike] Updated stats for post ${postId}:`, newStats);
    } catch (error) {
      console.error(`[LikeDislike] Error updating stats for post ${postId}:`, error);
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
          likes: !stats.userInteracted ? stats.likes + 1 : stats.likes + 1,
          dislikes: disliked ? stats.baseStats.dislikes : stats.dislikes,
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
          dislikes: !stats.userInteracted ? stats.dislikes + 1 : stats.dislikes + 1,
          likes: liked ? stats.baseStats.likes : stats.likes,
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
    <div className="w-full flex items-center gap-6 z-10 relative bg-transparent pointer-events-auto">
      <Button
        variant={liked ? "default" : "ghost"}
        size="sm"
        onClick={handleLike}
        className={`relative group flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 ${
          liked ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-primary/5'
        } pointer-events-auto`}
      >
        <ThumbsUp className={`h-4 w-4 transition-transform group-hover:scale-110 ${
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
        className={`relative group flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 ${
          disliked ? 'bg-destructive/10 hover:bg-destructive/20' : 'hover:bg-destructive/5'
        } pointer-events-auto`}
      >
        <ThumbsDown className={`h-4 w-4 transition-transform group-hover:scale-110 ${
          disliked ? 'text-destructive' : 'text-muted-foreground'
        }`} />
        <span className={`text-sm ${
          disliked ? 'text-destructive' : 'text-muted-foreground'
        }`}>{stats.dislikes}</span>
      </Button>
    </div>
  );
}