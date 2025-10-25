import { useState, useEffect, useRef } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchReactions, submitReaction } from "@/api/reactions";

interface LikeDislikeProps {
  postId: number;
  slug?: string;
  source?: 'local' | 'wp';
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

const getStorageKey = (postId: number, slug?: string, source: 'local' | 'wp' = 'local') =>
  slug && slug.trim()
    ? `reaction-${source}:${slug.trim()}`
    : `reaction-${source}:post-${postId}`;

function readLocalReaction(storageKey: string): 'like' | 'dislike' | 'none' {
  try {
    const v = localStorage.getItem(storageKey);
    if (!v) return 'none';
    const parsed = JSON.parse(v);
    const state = parsed?.state;
    if (state === 'like' || state === 'dislike') return state;
    return 'none';
  } catch {
    return 'none';
  }
}

function writeLocalReaction(storageKey: string, state: 'like' | 'dislike' | 'none', stats: Stats) {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ state, stats }));
  } catch {}
}

export function LikeDislike({
  postId,
  slug,
  source = 'local',
  userLikeStatus = null,
  onLike,
  onDislike,
  onUpdate,
  className,
  variant = 'index'
}: LikeDislikeProps) {
  const { toast: _toast } = useToast();
  const [liked, setLiked] = useState(userLikeStatus === 'like');
  const [disliked, setDisliked] = useState(userLikeStatus === 'dislike');
  const [stats, setStats] = useState<Stats>({
    likes: 0,
    dislikes: 0,
    baseStats: { likes: 0, dislikes: 0 },
    userInteracted: false
  });
  const [inlineToast, setInlineToast] = useState<{ message: string; type: 'like' | 'dislike' | 'error' | null } | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const storageKey = getStorageKey(postId, slug, source);
  const hideTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);

  // Initial load: fetch baseline + live counts from server
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchReactions(postId);
        if (!mounted) return;
        const newStats: Stats = {
          likes: Number(data.totals?.likes ?? 0),
          dislikes: Number(data.totals?.dislikes ?? 0),
          baseStats: {
            likes: Number(data.baselineLikes ?? 0),
            dislikes: Number(data.baselineDislikes ?? 0)
          },
          userInteracted: false
        };
        setStats(newStats);

        // Restore local reaction UI state
        const localState = readLocalReaction(storageKey);
        setLiked(localState === 'like');
        setDisliked(localState === 'dislike');

        onUpdate?.(newStats.likes, newStats.dislikes);
      } catch (error) {
        // Keep silent UI; optionally we could show a small error toast
        console.warn('[LikeDislike] Failed to load reactions:', error);
      }
    })();

    return () => {
      mounted = false;
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (removeTimerRef.current) {
        window.clearTimeout(removeTimerRef.current);
        removeTimerRef.current = null;
      }
    };
  }, [postId, slug, source, onUpdate]);

  const showInlineToast = (message: string, type: 'like' | 'dislike' | 'error' = 'like') => {
    setInlineToast({ message, type });
    requestAnimationFrame(() => {
      setIsToastVisible(true);
    });

    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);

    hideTimerRef.current = window.setTimeout(() => {
      setIsToastVisible(false);
      removeTimerRef.current = window.setTimeout(() => setInlineToast(null), 300);
    }, 3500);
  };

  const applyServerTotals = (data: any) => {
    const newStats: Stats = {
      likes: Number(data?.totals?.likes ?? 0),
      dislikes: Number(data?.totals?.dislikes ?? 0),
      baseStats: {
        likes: Number(data?.baselineLikes ?? 0),
        dislikes: Number(data?.baselineDislikes ?? 0)
      },
      userInteracted: true
    };
    setStats(newStats);
    onUpdate?.(newStats.likes, newStats.dislikes);
    writeLocalReaction(storageKey, liked ? 'like' : (disliked ? 'dislike' : 'none'), newStats);
  };

  const handleLike = async () => {
    try {
      // Decide the next UI state
      const nextLiked = !liked;
      const nextDisliked = nextLiked ? false : disliked;

      // Submit to server (server toggles off if same state in this session)
      const data = await submitReaction(postId, true);

      setLiked(nextLiked);
      setDisliked(nextDisliked);
      applyServerTotals(data);

      if (nextLiked) {
        showInlineToast("Thanks for liking!", 'like');
        onLike?.(true);
      } else {
        onLike?.(false);
      }
    } catch (error) {
      console.error(`[LikeDislike] Error handling like for post ${postId}:`, error);
      showInlineToast("Error updating like - please try again", 'error');
    }
  };

  const handleDislike = async () => {
    try {
      const nextDisliked = !disliked;
      const nextLiked = nextDisliked ? false : liked;

      const data = await submitReaction(postId, false);

      setDisliked(nextDisliked);
      setLiked(nextLiked);
      applyServerTotals(data);

      if (nextDisliked) {
        showInlineToast("Thanks for the feedback!", 'dislike');
        onDislike?.(true);
      } else {
        onDislike?.(false);
      }
    } catch (error) {
      console.error(`[LikeDislike] Error handling dislike for post ${postId}:`, error);
      showInlineToast("Error updating dislike - please try again", 'error');
    }
  };

  return (
    <div className={`relative ${className}`} data-toast-container>
      {variant === 'reader' && (
        <p className="text-center text-sm font-medium mb-4 text-white/80 uppercase tracking-wide font-sans">
          Loved this story? Let me know with a like—or a dislike if you must
        </p>
      )}
      <div className={`flex items-center gap-3 ${variant === 'reader' ? 'justify-center' : 'justify-start'}`}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          className={`
            inline-flex items-center gap-2 font-sans font-medium text-sm
            px-4 py-2 rounded-lg border transition-all duration-200
            hover:scale-105 active:scale-95 focus:outline-none focus:ring-0 focus:ring-offset-0
            ${variant === 'reader' 
              ? 'min-w-[100px] justify-center' 
              : 'h-8 px-3 py-1 text-xs min-w-[70px]'
            }
            ${liked 
              ? 'bg-green-100 border-green-300 text-green-700 shadow-sm dark:bg-green-900/30 dark:border-green-600 dark:text-green-400' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            }
          `}
        >
          <ThumbsUp className={`${variant === 'reader' ? 'h-4 w-4' : 'h-3 w-3'}`} />
          <span className="font-sans tabular-nums">{stats.likes}</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleDislike(); }}
          className={`
            inline-flex items-center gap-2 font-sans font-medium text-sm
            px-4 py-2 rounded-lg border transition-all duration-200
            hover:scale-105 active:scale-95 focus:outline-none focus:ring-0 focus:ring-offset-0
            ${variant === 'reader' 
              ? 'min-w-[100px] justify-center' 
              : 'h-8 px-3 py-1 text-xs min-w-[70px]'
            }
            ${disliked 
              ? 'bg-red-100 border-red-300 text-red-700 shadow-sm dark:bg-red-900/30 dark:border-red-600 dark:text-red-400' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            }
          `}
        >
          <ThumbsDown className={`${variant === 'reader' ? 'h-4 w-4' : 'h-3 w-3'}`} />
          <span className="font-sans tabular-nums">{stats.dislikes}</span>
        </button>
      </div>
      
      {inlineToast && (
        <div className={`
          mt-3 px-3 py-2 rounded-md text-center font-sans text-xs font-medium 
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

