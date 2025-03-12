import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface LikeDislikeProps {
  postId: number;
  userLikeStatus?: 'like' | 'dislike' | null;
  onLike?: (liked: boolean) => void;
  onDislike?: (disliked: boolean) => void;
  onUpdate?: (likes: number, dislikes: number) => void;
  className?: string;
  variant?: 'index' | 'reader';
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
  className,
  variant = 'index'
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
        variant: "destructive"
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
          description: "Thanks for liking! 🥰"
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
        variant: "destructive"
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
          description: "Thanks for the feedback! 😔"
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
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn("mt-4 flex flex-col items-center gap-y-2", className)} data-toast-container>
      {variant === 'reader' && (
        <h3 className="text-gray-800 dark:text-white text-lg font-semibold">
          Loved this story? Let me know with a like 🥹—or a dislike if you must 😔
        </h3>
      )}
      <div className="flex justify-center items-center gap-x-4">
        {/* Like Button - Updated to match design */}
        <button 
          type="button" 
          onClick={handleLike}
          className={cn(
            "py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
            liked && "border-primary text-primary dark:border-primary-400 dark:text-primary-400"
          )}
        >
          <svg className="shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12"></path>
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
          </svg>
          {stats.likes}
        </button>

        {/* Dislike Button - Updated to match design */}
        <button 
          type="button" 
          onClick={handleDislike}
          className={cn(
            "py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
            disliked && "border-destructive text-destructive dark:border-destructive dark:text-destructive"
          )}
        >
          <svg className="shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 14V2"></path>
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
          </svg>
          {stats.dislikes}
        </button>
      </div>
    </div>
  );
}