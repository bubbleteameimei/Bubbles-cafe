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

type ReactionState = 'like' | 'dislike' | 'none';

interface Stats {
  // Totals as displayed to the user (baseline + dynamic)
  likes: number;
  dislikes: number;

  // Dynamic counts excluding baseline
  likesCount: number;
  dislikesCount: number;

  baseStats: {
    baselineLikes: number;
    baselineDislikes: number;
    totalsLikes: number;
    totalsDislikes: number;
  };

  userInteracted: boolean;
}

function computeReactionDelta(prev: ReactionState, next: ReactionState) {
  if (prev === next) return { deltaLikes: 0, deltaDislikes: 0 };

  let deltaLikes = 0;
  let deltaDislikes = 0;

  if (prev === 'none') {
    if (next === 'like') deltaLikes = 1;
    else if (next === 'dislike') deltaDislikes = 1;
  } else if (prev === 'like') {
    if (next === 'none') {
      deltaLikes = -1;
    } else if (next === 'dislike') {
      deltaLikes = -1;
      deltaDislikes = 1;
    }
  } else if (prev === 'dislike') {
    if (next === 'none') {
      deltaDislikes = -1;
    } else if (next === 'like') {
      deltaLikes = 1;
      deltaDislikes = -1;
    }
  }

  return { deltaLikes, deltaDislikes };
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

function writeLocalReaction(
  storageKey: string,
  state: 'like' | 'dislike' | 'none',
  stats: Stats,
  _context?: { postId: number; slug?: string; source?: 'local' | 'wp' },
) {
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
  // Initialize from localStorage to avoid flicker and preserve user state across pages
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

  // No baseline seeding: start from zero and rely on server counts
  const initialBaseline = { baseLikes: 0, baseDislikes: 0 };

  const [stats, setStats] = useState<Stats>({
    likes: 0,
    dislikes: 0,
    likesCount: 0,
    dislikesCount: 0,
    baseStats: {
      baselineLikes: 0,
      baselineDislikes: 0,
      totalsLikes: 0,
      totalsDislikes: 0,
    },
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

  // Initial load: fetch baseline + live counts from server OR use provided initialTotals
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let data: ReactionTotals;
        if (initialTotals && typeof initialTotals === 'object') {
          const now = Date.now();
          if (now - (lastTotalsUpdateTsRef.current || 0) < 200) {
            // Skip overly frequent prop-driven updates to avoid flicker
            return;
          }
          lastTotalsUpdateTsRef.current = now;
          data = initialTotals;
        } else {
          data = await fetchReactions(postId);
          if (!mounted) return;
        }

        const likes = Number(data?.totals?.likes ?? 0);
        const dislikes = Number(data?.totals?.dislikes ?? 0);
        const baseLikes = Number(data?.baselineLikes ?? 0);
        const baseDislikes = Number(data?.baselineDislikes ?? 0);

        const likesCount = Math.max(0, likes - baseLikes);
        const dislikesCount = Math.max(0, dislikes - baseDislikes);

        const computedStats: Stats = {
          likes,
          dislikes,
          likesCount,
          dislikesCount,
          baseStats: {
            baselineLikes: baseLikes,
            baselineDislikes: baseDislikes,
            totalsLikes: likes,
            totalsDislikes: dislikes,
          },
          userInteracted: false,
        };
        setStats(computedStats);
        setReactionError(false);
        setIsLoadingTotals(false);

        // Restore local reaction UI state
        const localState = readLocalReaction(storageKey);
        setLiked(localState === 'like');
        setDisliked(localState === 'dislike');

        onUpdate?.(computedStats.likes, computedStats.dislikes);
        // Broadcast initial totals so index/most liked can sync immediately
        try {
          const detail = {
            postId,
            baselineLikes: Number(computedStats.baseStats.baselineLikes || 0),
            baselineDislikes: Number(computedStats.baseStats.baselineDislikes || 0),
            likesCount: Number(computedStats.likesCount || 0),
            dislikesCount: Number(computedStats.dislikesCount || 0),
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

        // Restore local reaction UI state without changing totals
        const localState = readLocalReaction(storageKey);
        setLiked(localState === 'like');
        setDisliked(localState === 'dislike');

        // Do not broadcast zero totals; keep UI showing placeholders
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

    const likesCount = Math.max(0, likes - baseLikes);
    const dislikesCount = Math.max(0, dislikes - baseDislikes);

    const newStats: Stats = {
      likes,
      dislikes,
      likesCount,
      dislikesCount,
      baseStats: {
        baselineLikes: baseLikes,
        baselineDislikes: baseDislikes,
        totalsLikes: likes,
        totalsDislikes: dislikes,
      },
      userInteracted: true,
    };
    setStats(newStats);
    setReactionError(false);
    setIsLoadingTotals(false);
    onUpdate?.(newStats.likes, newStats.dislikes);
    writeLocalReaction(storageKey, liked ? 'like' : disliked ? 'dislike' : 'none', newStats);

    // Broadcast update so lists can sync without waiting for refetch
    try {
      window.dispatchEvent(
        new CustomEvent('reaction:updated', {
          detail: {
            postId,
            baselineLikes: baseLikes,
            baselineDislikes: baseDislikes,
            likesCount,
            dislikesCount,
            totals: { likes: Number(likes), dislikes: Number(dislikes) },
          },
        }),
      );
    } catch {}
  };

  const deterministicBaseline = (): { baseLikes: number; baseDislikes: number } => {
    return { baseLikes: 0, baseDislikes: 0 };
  };

  const composeTotals = (s: Stats): import('@/api/reactions').ReactionTotals => {
    const baseLikes = Number(s.baseStats.baselineLikes || 0);
    const baseDislikes = Number(s.baseStats.baselineDislikes || 0);
    const totalsLikes = Number(s.baseStats.totalsLikes || s.likes);
    const totalsDislikes = Number(s.baseStats.totalsDislikes || s.dislikes);
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

    const prevState: ReactionState = liked ? 'like' : disliked ? 'dislike' : 'none';
    const nextLiked = !liked;
    const nextDisliked = nextLiked ? false : disliked;
    const nextState: ReactionState = nextLiked ? 'like' : nextDisliked ? 'dislike' : 'none';

    setLiked(nextLiked);
    setDisliked(nextDisliked);
    onLike?.(nextLiked);
    onDislike?.(nextDisliked);

    // Optimistic update
    setStats((prev) => {
      const current: Stats =
        prev ||
        ({
          likes: 0,
          dislikes: 0,
          likesCount: 0,
          dislikesCount: 0,
          baseStats: {
            baselineLikes: 0,
            baselineDislikes: 0,
            totalsLikes: 0,
            totalsDislikes: 0,
          },
          userInteracted: false,
        } as Stats);

      const baseLikes = Number(current.baseStats.baselineLikes ?? 0);
      const baseDislikes = Number(current.baseStats.baselineDislikes ?? 0);

      const currentLikesCount =
        current.likesCount ?? Math.max(0, current.likes - baseLikes);
      const currentDislikesCount =
        current.dislikesCount ?? Math.max(0, current.dislikes - baseDislikes);

      const { deltaLikes, deltaDislikes } = computeReactionDelta(prevState, nextState);

      const likesCount = Math.max(0, currentLikesCount + deltaLikes);
      const dislikesCount = Math.max(0, currentDislikesCount + deltaDislikes);

      const totalsLikes = baseLikes + likesCount;
      const totalsDislikes = baseDislikes + dislikesCount;

      const updated: Stats = {
        likes: totalsLikes,
        dislikes: totalsDislikes,
        likesCount,
        dislikesCount,
        baseStats: {
          baselineLikes: baseLikes,
          baselineDislikes: baseDislikes,
          totalsLikes,
          totalsDislikes,
        },
        userInteracted: true,
      };

      writeLocalReaction(storageKey, nextState, updated, { postId, slug, source });
      onUpdate?.(updated.likes, updated.dislikes);

      window.dispatchEvent(
        new CustomEvent('reaction:updated', {
          detail: {
            postId,
            slug,
            source,
            totals: {
              likes: totalsLikes,
              dislikes: totalsDislikes,
            },
          },
        }),
      );

      return updated;
    });

    try {
      const data = await submitReaction(postId, true, { prevState, nextState });
      const baseLikes = Number(data.baselineLikes ?? 0);
      const baseDislikes = Number(data.baselineDislikes ?? 0);
      const likesCount = Number(data.likesCount ?? 0);
      const dislikesCount = Number(data.dislikesCount ?? 0);
      const totalsLikes = Number(data.totals?.likes ?? baseLikes + likesCount);
      const totalsDislikes = Number(
        data.totals?.dislikes ?? baseDislikes + dislikesCount,
      );

      const synced: Stats = {
        likes: totalsLikes,
        dislikes: totalsDislikes,
        likesCount,
        dislikesCount,
        baseStats: {
          baselineLikes: baseLikes,
          baselineDislikes: baseDislikes,
          totalsLikes,
          totalsDislikes,
        },
        userInteracted: true,
      };

      setStats(synced);
      writeLocalReaction(storageKey, nextState, synced, { postId, slug, source });
      onUpdate?.(synced.likes, synced.dislikes);

      window.dispatchEvent(
        new CustomEvent('reaction:updated', {
          detail: {
            postId,
            slug,
            source,
            totals: {
              likes: totalsLikes,
              dislikes: totalsDislikes,
            },
          },
        }),
      );
    } catch (err) {
      console.error('Failed to submit like reaction:', err);
      showInlineToast('Failed to record your like. Please try again.', 'error');
      // Keep optimistic UI state; a later fetch will correct totals if needed
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

    const prevState: ReactionState = liked ? 'like' : disliked ? 'dislike' : 'none';
    const nextDisliked = !disliked;
    const nextLiked = nextDisliked ? false : liked;
    const nextState: ReactionState = nextLiked ? 'like' : nextDisliked ? 'dislike' : 'none';

    setLiked(nextLiked);
    setDisliked(nextDisliked);
    onLike?.(nextLiked);
    onDislike?.(nextDisliked);

    // Optimistic update
    setStats((prev) => {
      const current: Stats =
        prev ||
        ({
          likes: 0,
          dislikes: 0,
          likesCount: 0,
          dislikesCount: 0,
          baseStats: {
            baselineLikes: 0,
            baselineDislikes: 0,
            totalsLikes: 0,
            totalsDislikes: 0,
          },
          userInteracted: false,
        } as Stats);

      const baseLikes = Number(current.baseStats.baselineLikes ?? 0);
      const baseDislikes = Number(current.baseStats.baselineDislikes ?? 0);

      const currentLikesCount =
        current.likesCount ?? Math.max(0, current.likes - baseLikes);
      const currentDislikesCount =
        current.dislikesCount ?? Math.max(0, current.dislikes - baseDislikes);

      const { deltaLikes, deltaDislikes } = computeReactionDelta(prevState, nextState);

      const likesCount = Math.max(0, currentLikesCount + deltaLikes);
      const dislikesCount = Math.max(0, currentDislikesCount + deltaDislikes);

      const totalsLikes = baseLikes + likesCount;
      const totalsDislikes = baseDislikes + dislikesCount;

      const updated: Stats = {
        likes: totalsLikes,
        dislikes: totalsDislikes,
        likesCount,
        dislikesCount,
        baseStats: {
          baselineLikes: baseLikes,
          baselineDislikes: baseDislikes,
          totalsLikes,
          totalsDislikes,
        },
        userInteracted: true,
      };

      writeLocalReaction(storageKey, nextState, updated, { postId, slug, source });
      onUpdate?.(updated.likes, updated.dislikes);

      window.dispatchEvent(
        new CustomEvent('reaction:updated', {
          detail: {
            postId,
            slug,
            source,
            totals: {
              likes: totalsLikes,
              dislikes: totalsDislikes,
            },
          },
        }),
      );

      return updated;
    });

    try {
      const data = await submitReaction(postId, false, { prevState, nextState });
      const baseLikes = Number(data.baselineLikes ?? 0);
      const baseDislikes = Number(data.baselineDislikes ?? 0);
      const likesCount = Number(data.likesCount ?? 0);
      const dislikesCount = Number(data.dislikesCount ?? 0);
      const totalsLikes = Number(data.totals?.likes ?? baseLikes + likesCount);
      const totalsDislikes = Number(
        data.totals?.dislikes ?? baseDislikes + dislikesCount,
      );

      const synced: Stats = {
        likes: totalsLikes,
        dislikes: totalsDislikes,
        likesCount,
        dislikesCount,
        baseStats: {
          baselineLikes: baseLikes,
          baselineDislikes: baseDislikes,
          totalsLikes,
          totalsDislikes,
        },
        userInteracted: true,
      };

      setStats(synced);
      writeLocalReaction(storageKey, nextState, synced, { postId, slug, source });
      onUpdate?.(synced.likes, synced.dislikes);

      window.dispatchEvent(
        new CustomEvent('reaction:updated', {
          detail: {
            postId,
            slug,
            source,
            totals: {
              likes: totalsLikes,
              dislikes: totalsDislikes,
            },
          },
        }),
      );
    } catch (err) {
      console.error('Failed to submit dislike reaction:', err);
      showInlineToast('Failed to record your dislike. Please try again.', 'error');
      // Keep optimistic UI state; a later fetch will correct totals if needed
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
