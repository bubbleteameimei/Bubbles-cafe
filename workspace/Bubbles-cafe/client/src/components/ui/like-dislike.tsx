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

// Generate consistent random numbers based on postId
const generateBaseStats = (postId: number) => {
  // Use postId as seed for consistent random generation across all components
  const seed = postId * 12345;
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const likesBase = Math.floor(seededRandom(seed) * (150 - 80 + 1)) + 80;
  const dislikesBase = Math.floor(seededRandom(seed + 999) * (20 - 8 + 1)) + 8;
  
  console.log(`Generated base stats for post ${postId}: likes=${likesBase}, dislikes=${dislikesBase}`);
  return { likes: likesBase, dislikes: dislikesBase };
};

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

    // Generate consistent base stats for this postId
    const baseStats = generateBaseStats(postId);

    const newStats: Stats = {
      likes: baseStats.likes,
      dislikes: baseStats.dislikes,
      baseStats: {
        likes: baseStats.likes,
        dislikes: baseStats.dislikes
      },
      userInteracted: false
    };

    localStorage.setItem(storageKey, JSON.stringify(newStats));
    return newStats;
  } catch (error) {
    console.error(`[LikeDislike] Error managing stats for post ${postId}:`, error);
    const fallbackBase = generateBaseStats(postId);
    return {
      likes: fallbackBase.likes,
      dislikes: fallbackBase.dislikes,
      baseStats: {
        likes: fallbackBase.likes,
        dislikes: fallbackBase.dislikes
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
  const [inlineToast, setInlineToast] = useState<{ message: string; type: 'like' | 'dislike' | 'error' | null } | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Listen for stats updates from other components and reset events
  useEffect(() => {
    const handleStatsUpdate = (event: CustomEvent<{ postId: number; stats: Stats }>) => {
      if (event.detail.postId === postId) {
        const newStats = event.detail.stats;
        setStats(newStats);
        
        // Update UI states based on current stats vs base stats
        const userLiked = newStats.likes > newStats.baseStats.likes;
        const userDisliked = newStats.dislikes > newStats.baseStats.dislikes;
        
        setLiked(userLiked);
        setDisliked(userDisliked);
        
        onUpdate?.(newStats.likes, newStats.dislikes);
      }
    };

    const handleStatsReset = () => {
      // Clear all post stats and regenerate
      const keys = Object.keys(localStorage).filter(key => key.startsWith('post-stats-'));
      keys.forEach(key => localStorage.removeItem(key));
      
      // Regenerate stats for this component
      const freshStats = getOrCreateStats(postId);
      setStats(freshStats);
      setLiked(false);
      setDisliked(false);
      onUpdate?.(freshStats.likes, freshStats.dislikes);
    };

    window.addEventListener('statsUpdated', handleStatsUpdate as EventListener);
    window.addEventListener('resetAllStats', handleStatsReset as EventListener);
    
    return () => {
      window.removeEventListener('statsUpdated', handleStatsUpdate as EventListener);
      window.removeEventListener('resetAllStats', handleStatsReset as EventListener);
    };
  }, [postId, onUpdate]);

  // Load existing stats or create new ones consistently
  useEffect(() => {
    const currentStats = getOrCreateStats(postId);
    console.log(`Loading stats for post ${postId}:`, currentStats);
    setStats(currentStats);
    
    // Determine user state from current stats vs base stats
    const userLiked = currentStats.likes > currentStats.baseStats.likes;
    const userDisliked = currentStats.dislikes > currentStats.baseStats.dislikes;
    
    setLiked(userLiked);
    setDisliked(userDisliked);
    onUpdate?.(currentStats.likes, currentStats.dislikes);
  }, [postId, onUpdate]);

  const showInlineToast = (message: string, type: 'like' | 'dislike' | 'error' = 'like') => {
    setInlineToast({ message, type });
    // Small delay for smooth entrance animation
    requestAnimationFrame(() => {
      setIsToastVisible(true);
    });
    
    // Start fade out after 4 seconds
    setTimeout(() => {
      setIsToastVisible(false);
      // Remove from DOM after fade out completes
      setTimeout(() => setInlineToast(null), 300);
    }, 4000);
  };

  const updateStats = (newStats: Stats) => {
    try {
      localStorage.setItem(getStorageKey(postId), JSON.stringify(newStats));
      setStats(newStats);
      onUpdate?.(newStats.likes, newStats.dislikes);
      
      // Dispatch custom event to sync across all components
      window.dispatchEvent(new CustomEvent('statsUpdated', {
        detail: { postId, stats: newStats }
      }));
      
      console.log('Stats updated:', newStats);
    } catch (error) {
      console.error(`[LikeDislike] Error updating stats for post ${postId}:`, error);
      showInlineToast("Error updating reaction - please try again later", 'error');
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
        showInlineToast("Thanks for liking! 🥰", 'like');
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
      showInlineToast("Error updating like - please try again", 'error');
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
        showInlineToast("Thanks for the feedback! 😔", 'dislike');
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
      showInlineToast("Error updating dislike - please try again", 'error');
    }
  };

  return (
    <div className={`relative ${className}`} data-toast-container>
      {variant === 'reader' && (
        <p className="text-center text-sm font-medium mb-4 text-white/80 uppercase tracking-wide font-sans">
          Loved this story? Let me know with a like🥹—or a dislike if you must 😔
        </p>
      )}
      <div className={`flex items-center gap-3 ${variant === 'reader' ? 'justify-center' : 'justify-start'}`}>
        <button
          type="button"
          onClick={handleLike}
          className={`
            inline-flex items-center gap-2 font-sans font-medium text-sm
            px-4 py-2 rounded-lg border transition-all duration-200
            hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1
            ${variant === 'reader' 
              ? 'min-w-[100px] justify-center' 
              : 'h-8 px-3 py-1 text-xs min-w-[70px]'
            }
            ${liked 
              ? 'bg-green-100 border-green-300 text-green-700 shadow-sm focus:ring-green-300 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400 dark:focus:ring-green-600' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm focus:ring-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-500'
            }
          `}
        >
          <ThumbsUp className={`${variant === 'reader' ? 'h-4 w-4' : 'h-3 w-3'}`} />
          <span className="font-sans tabular-nums">{stats.likes}</span>
        </button>

        <button
          type="button"
          onClick={handleDislike}
          className={`
            inline-flex items-center gap-2 font-sans font-medium text-sm
            px-4 py-2 rounded-lg border transition-all duration-200
            hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1
            ${variant === 'reader' 
              ? 'min-w-[100px] justify-center' 
              : 'h-8 px-3 py-1 text-xs min-w-[70px]'
            }
            ${disliked 
              ? 'bg-red-100 border-red-300 text-red-700 shadow-sm focus:ring-red-300 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400 dark:focus:ring-red-600' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm focus:ring-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-500'
            }
          `}
        >
          <ThumbsDown className={`${variant === 'reader' ? 'h-4 w-4' : 'h-3 w-3'}`} />
          <span className="font-sans tabular-nums">{stats.dislikes}</span>
        </button>
      </div>
      
      {/* Inline Toast Notification */}
      {inlineToast && (
        <div className={`
          mt-4 px-4 py-2.5 rounded-lg text-center font-sans text-sm font-medium 
          transform transition-all duration-300 ease-out shadow-sm
          ${isToastVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-2 opacity-0 scale-95'
          }
          ${inlineToast.type === 'like' 
            ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' 
            : inlineToast.type === 'dislike'
            ? 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
            : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
          }
        `}>
          {inlineToast.message}
        </div>
      )}
    </div>
  );
}