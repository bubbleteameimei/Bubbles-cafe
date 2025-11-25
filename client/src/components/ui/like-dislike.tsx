import { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { fetchReactions, submitReaction } from '@/api/reactions';

import type { ReactionTotals } from '@/api/reactions';

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
  initialTotals?: ReactionTotals | null;
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

const ACTION_THROTTLE_MS = 250;

const getStorageKey = (postId: number, slug?: string, source: 'local' | 'wp' = 'local') =>
  slug && slug.trim() ? `reaction-${source}:${slug.trim()}` : `reaction-${source}:post-${postId}`;

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
  variant = 'index',
  initialTotals = null,
}: LikeDislikeProps) {
  const initialLocalState = (() => {
    try {
      return readLocalReaction(getStorageKey(postId, slug, source));
    } catch {
      return 'none';
    }
  })();

  const [liked, setLiked] = useState(
    userLikeStatus ? userLikeStatus === 'like' : initialLocalState === 'like',
  );
  const [disliked, setDisliked] = useState(
    userLikeStatus ? userLikeStatus === 'dislike' : initialLocalState === 'dislike',
  );

  const [stats, setStats] = useState<Stats>({
    likes: 0,
    dislikes: 0,
    baseStats: { likes: 0, dislikes: 0 },
    userInteracted: false,
  });
  const [reactionError, setReactionError] = useState(false);
  const [isLoadingTotals, setIsLoadingTotals] = useState(true);
  const [inlineToast, setInlineToast] = useState<{
    message: string;
    type: 'like' | 'dislike' | 'error' | null;
  } | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const storageKey = getStorageKey(postId, slug, source);
  const hideTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);
  const isPendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const lastActionTsRef = useRef<number>(0);
  const lastTotalsUpdateTsRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let data: ReactionTotals;
        if (initialTotals && typeof initialTotals === 'object') {
          const now = Date.now();
          if (now - (lastTotalsUpdateTsRef.current || 0) < 200) {
            return;
          }
          lastTotalsUpdateTsRef.current = now;
          data = initialTotals;
        } else {
          data = await fetchReactions(postId);
          if (!mounted) return;
        }

        let likes = Number(data?.totals?.likes ?? 0);
        let dislikes = Number(data?.totals?.dislikes ?? 0);
        let baseLikes = Number(data?.baselineLikes ?? 0);
        let baseDislikes = Number(data?.baselineDislikes ?? 0);

        const computedStats: Stats = {
          likes,
          dislikes,
          baseStats: {
            likes: baseLikes,
            dislikes: baseDislikes,
          },
          userInteracted: false,
        };
        setStats(computedStats);
        setReactionError(false);
        setIsLoadingTotals(false);

        const localState = readLocalReaction(storageKey);
        setLiked(localState === 'like');
        setDisliked(localState === 'dislike');

        onUpdate?.(computedStats.likes, computedStats.dislikes);
        try {
          const detail = {
            postId,
            baselineLikes: Number(computedStats.baseStats.likes || 0),
            baselineDislikes: Number(computedStats.baseStats.dislikes || 0),
            likesCount: Math.max(
              0,
              Number(computedStats.likes) - Number(computedStats.baseStats.likes || 0),
            ),
            dislikesCount: Math.max(
              0,
              Number(computedStats.dislikes) - Number(computedStats.baseStats.dislikes || 0),
            ),
            totals: {
              likes: Number(computedStats.likes),
              dislikes: Number(computedStats.dislikes),
            },
          };
          window.dispatchEvent(new CustomEvent('reaction:updated', { detail }));
        } catch {}
      } catch (error) {
        console.error('[LikeDislike] Failed to load reactions:', error);
        setReactionError(true);
        setIsLoadingTotals(false);

        const localState = readLocalReaction(storageKey);
        setLiked(localState === 'like');
        setDisliked(localState === 'dislike');
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
  }, [postId, slug, source, onUpdate, initialTotals, storageKey]);

  const showInlineToast = (message: string, type: 'like' | 'dislike' | 'error' = 'like') => {
    setInlineToast({ message, type });
    requestAnimationFrame(() => {
      setIsToastVisible(true);
    });

    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current);

    hideTimerRef.current = window.setTimeout(() => {
      setIsToastVisible(false);
      removeTimerRef.current = window.setTimeout(() => setInlineToast(null), 150);
    }, 1200);
  };

  const applyServerTotals = (data: any) => {
    const likes = Number(data?.totals?.likes ?? 0);
    const dislikes = Number(data?.totals?.dislikes ?? 0);
    const baseLikes = Number(data?.baselineLikes ?? 0);
    const baseDislikes = Number(data?.baselineDislikes ?? 0);

    const newStats: Stats = {
      likes,
      dislikes,
      baseStats: {
        likes: baseLikes,
        dislikes: baseDislikes,
      },
      userInteracted: true,
    };
    setStats(newStats);
    setReactionError(false);
    setIsLoadingTotals(false);
    onUpdate?.(newStats.likes, newStats.dislikes);
    writeLocalReaction(storageKey, liked ? 'like' : disliked ? 'dislike' : 'none', newStats);

    try {
      window.dispatchEvent(
        new CustomEvent('reaction:updated', {
          detail: {
            postId,
            baselineLikes: baseLikes,
            baselineDislikes: baseDislikes,
            likesCount: Math.max(0, Number(likes) - Number(baseLikes)),
            dislikesCount: Math.max(0, Number(dislikes) - Number(baseDislikes)),
            totals: { likes: Number(likes), dislikes: Number(dislikes) },
          },
        }),
      );
    } catch {}
  };

  const composeTotals = (s: Stats): import('@/api/reactions').ReactionTotals => {
    const baseLikes = Number(s.baseStats.likes || 0);
    const baseDislikes = Number(s.baseStats.dislikes || 0);
    const totalsLikes = Number(s.likes);
    const totalsDislikes = Number(s.dislikes);
    return {
      postId,
      baselineLikes: baseLikes,
      baselineDislikes: baseDislikes,
      likesCount: Math.max(0, totalsLikes - baseLikes),
      dislikesCount: Math.max(0, totalsDislikes - baseDislikes),
      totals: {
        likes: totalsLikes,
        dislikes: totalsDislikes,
      },
    };
  };

  const handleLike = async () => {
    const now = Date.now();
    if (isPendingRef.current || now - lastActionTsRef.current < ACTION_THROTTLE_MS) return;
    isPendingRef.current = true;
    setIsPending(true);
    lastActionTsRef.current = now;

    const nextLiked = !liked;
    const nextDisliked = nextLiked ? false : disliked;

    const baseLikes = Number(stats.baseStats.likes || 0);
    const baseDislikes = Number(stats.baseStats.dislikes || 0);
    let likes = Number(stats.likes || baseLikes);
    let dislikes = Number(stats.dislikes || baseDislikes);

    if (!liked && !disliked && nextLiked) {
      likes += 1;
    } else if (disliked && nextLiked) {
      dislikes = Math.max(0, dislikes - 1);
      likes += 1;
    } else if (liked && !nextLiked) {
      likes = Math.max(0, likes - 1);
    }

    const optimistic: Stats = {
      likes,
      dislikes,
      baseStats: { likes: baseLikes, dislikes: baseDislikes },
      userInteracted: true,
    };

    setLiked(nextLiked);
    setDisliked(nextDisliked);
    setStats(optimistic);
    writeLocalReaction(
      storageKey,
      nextLiked ? 'like' : nextDisliked ? 'dislike' : 'none',
      optimistic,
    );
    onUpdate?.(optimistic.likes, optimistic.dislikes);
    try {
      window.dispatchEvent(
        new CustomEvent('reaction:updated', { detail: composeTotals(optimistic) }),
      );
    } catch {}

    if (nextLiked) {
      showInlineToast('Thanks for liking! 😘', 'like');
      onLike?.(true);
    } else {
      onLike?.(false);
    }

    try {
      const data = await submitReaction(postId, true);
      applyServerTotals(data);
    } catch (error) {
      console.error(`[LikeDislike] Error handling like for post ${postId}:`, error);
      showInlineToast('Failed to update like. Please try again.', 'error');
      const prevState = readLocalReaction(storageKey);
      const prevLiked = prevState === 'like';
      const prevDisliked = prevState === 'dislike';
      setLiked(prevLiked);
      setDisliked(prevDisliked);
      setReactionError(true);
      window.setTimeout(async () => {
        try {
          const data = await fetchReactions(postId);
          applyServerTotals(data);
        } catch {}
      }, 800);
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  };

  const handleDislike = async () => {
    const now = Date.now();
    if (isPendingRef.current || now - lastActionTsRef.current < ACTION_THROTTLE_MS) return;
    isPendingRef.current = true;
    setIsPending(true);
    lastActionTsRef.current = now;

    const nextDisliked = !disliked;
    const nextLiked = nextDisliked ? false : liked;

    const baseLikes = Number(stats.baseStats.likes || 0);
    const baseDislikes = Number(stats.baseStats.dislikes || 0);
    let likes = Number(stats.likes || baseLikes);
    let dislikes = Number(stats.dislikes || baseDislikes);

    if (!disliked && !liked && nextDisliked) {
      dislikes += 1;
    } else if (liked && nextDisliked) {
      likes = Math.max(0, likes - 1);
      dislikes += 1;
    } else if (disliked && !nextDisliked) {
      dislikes = Math.max(0, dislikes - 1);
    }

    const optimistic: Stats = {
      likes,
      dislikes,
      baseStats: { likes: baseLikes, dislikes: baseDislikes },
      userInteracted: true,
    };

    setDisliked(nextDisliked);
    setLiked(nextLiked);
    setStats(optimistic);
    writeLocalReaction(
      storageKey,
      nextDisliked ? 'dislike' : nextLiked ? 'like' : 'none',
      optimistic,
    );
    onUpdate?.(optimistic.likes, optimistic.dislikes);
    try {
      window.dispatchEvent(
        new CustomEvent('reaction:updated', { detail: composeTotals(optimistic) }),
      );
    } catch {}

    if (nextDisliked) {
      showInlineToast('Thanks for the feedback! 😔', 'dislike');
      onDislike?.(true);
    } else {
      onDislike?.(false);
    }

    try {
      const data = await submitReaction(postId, false);
      setDisliked(nextDisliked);
      setLiked(nextLiked);
      applyServerTotals(data);
    } catch (error) {
      console.error(`[LikeDislike] Error handling dislike for post ${postId}:`, error);
      showInlineToast('Failed to update dislike. Please try again.', 'error');
      const prevState = readLocalReaction(storageKey);
      const prevLiked = prevState === 'like';
      const prevDisliked = prevState === 'dislike';
      setLiked(prevLiked);
      setDisliked(prevDisliked);
      setReactionError(true);
      window.setTimeout(async () => {
        try {
          const data = await fetchReactions(postId);
          applyServerTotals(data);
        } catch {}
      }, 800);
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  };

  return (
    <div className={`relative ${className}`} data-toast-container>
      {variant === 'reader' && (
        <p className="text-center text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide font-sans">
          Loved this story? Let me know with a like—or a dislike if you must
        </p>
      )}
      <div
        className={`flex items-center gap-3 ${variant === 'reader' ? 'justify-center' : 'justify-start'}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          className={`
            inline-flex items-center gap-2 font-sans font-medium text-sm
            px-4 py-2 rounded-lg border transition-all duration-200
            hover:scale-105 hover:-translate-y-[1px] active:translate-y-0 active:scale-95 will-change-transform
            focus:outline-none focus:ring-0 focus:ring-offset-0
            ${
              variant === 'reader'
                ? 'min-w-[100px] justify-center'
                : 'h-8 px-3 py-1 text-xs min-w-[70px]'
            }
            ${
              liked
                ? 'bg-[hsl(var(--success)/0.15)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))] shadow-sm hover:bg-[hsl(var(--success)/0.2)]'
                : 'bg-card border-border text-foreground/80 hover:bg-muted hover:text-foreground shadow-sm'
            }
          `}
          aria-pressed={liked}
          aria-label="Like this story"
          disabled={isLoadingTotals || isPending}
        >
          <ThumbsUp className={`${variant === 'reader' ? 'h-4 w-4' : 'h-3 w-3'}`} />
          <span className="font-sans tabular-nums">
            {isLoadingTotals || reactionError ? '—' : stats.likes}
          </span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDislike();
          }}
          className={`
            inline-flex items-center gap-2 font-sans font-medium text-sm
            px-4 py-2 rounded-lg border transition-all duration-200
            hover:scale-105 hover:-translate-y-[1px] active:translate-y-0 active:scale-95 will-change-transform
            focus:outline-none focus:ring-0 focus:ring-offset-0
            ${
              variant === 'reader'
                ? 'min-w-[100px] justify-center'
                : 'h-8 px-3 py-1 text-xs min-w-[70px]'
            }
            ${
              disliked
                ? 'bg-[hsl(var(--destructive)/0.15)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] shadow-sm hover:bg-[hsl(var(--destructive)/0.2)]'
                : 'bg-card border-border text-foreground/80 hover:bg-muted hover:text-foreground shadow-sm'
            }
          `}
          aria-pressed={disliked}
          aria-label="Dislike this story"
          disabled={isLoadingTotals || isPending}
        >
          <ThumbsDown className={`${variant === 'reader' ? 'h-4 w-4' : 'h-3 w-3'}`} />
          <span className="font-sans tabular-nums">
            {isLoadingTotals || reactionError ? '—' : stats.dislikes}
          </span>
        </button>
      </div>

      {inlineToast && (
        <div
          className={`
          ${variant === 'index' ? 'mt-2 px-2' : 'mt-3 px-3'}
          py-2 rounded-md text-center font-sans text-xs font-medium 
          transform transition-all duration-300 ease-out shadow-sm
          ${
            isToastVisible
              ? 'translate-y-0 opacity-100 scale-100'
              : 'translate-y-2 opacity-0 scale-95'
          }
          ${
            inlineToast.type === 'like'
              ? 'bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] border border-[hsl(var(--success)/0.3)]'
              : inlineToast.type === 'dislike'
                ? 'bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))] border border-[hsl(var(--destructive)/0.3)]'
                : 'bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))] border border-[hsl(var(--destructive)/0.3)]'
          }
        `}
          role="status"
          aria-live="polite"
        >
          {inlineToast.message}
        </div>
      )}
    </div>
  );
}
