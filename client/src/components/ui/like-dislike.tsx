import { useEffect, useRef, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
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

interface Stats extends ReactionTotals {
  hasServerData: boolean;
}

const ACTION_THROTTLE_MS = 250;

const getStorageKey = (postId: number, slug?: string, source: 'local' | 'wp' = 'local') =>
  slug && slug.trim() ? `reaction-${source}:${slug.trim()}` : `reaction-${source}:post-${postId}`;

function normalizeTotals(postId: number, totals: ReactionTotals | null, hasServerData: boolean): Stats {
  const base: ReactionTotals =
    totals && typeof totals === 'object'
      ? totals
      : {
          postId,
          baselineLikes: 0,
          baselineDislikes: 0,
          likesCount: 0,
          dislikesCount: 0,
          totals: { likes: 0, dislikes: 0 },
        };

  const baselineLikes = Number(base.baselineLikes ?? 0);
  const baselineDislikes = Number(base.baselineDislikes ?? 0);
  const likesCount = Number(base.likesCount ?? 0);
  const dislikesCount = Number(base.dislikesCount ?? 0);
  const totalsLikes =
    base.totals && typeof base.totals.likes === 'number'
      ? base.totals.likes
      : baselineLikes + likesCount;
  const totalsDislikes =
    base.totals && typeof base.totals.dislikes === 'number'
      ? base.totals.dislikes
      : baselineDislikes + dislikesCount;

  return {
    postId,
    baselineLikes,
    baselineDislikes,
    likesCount: Math.max(0, likesCount),
    dislikesCount: Math.max(0, dislikesCount),
    totals: {
      likes: Math.max(0, totalsLikes),
      dislikes: Math.max(0, totalsDislikes),
    },
    hasServerData,
  };
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

function readLocalReaction(storageKey: string): { state: ReactionState; stats: ReactionTotals | null } {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { state: 'none', stats: null };
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    const stats = parsed?.stats;
    const safeState: ReactionState = state === 'like' || state === 'dislike' ? state : 'none';
    return { state: safeState, stats: stats && typeof stats === 'object' ? stats : null };
  } catch {
    return { state: 'none', stats: null };
  }
}

function writeLocalReaction(storageKey: string, state: ReactionState, stats: ReactionTotals | null) {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ state, stats }));
  } catch {
    // ignore storage errors
  }
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
  const storageKey = getStorageKey(postId, slug, source);

  const initialLocal = (() => {
    try {
      return readLocalReaction(storageKey);
    } catch {
      return { state: 'none' as ReactionState, stats: null as ReactionTotals | null };
    }
  })();

  const initialStateFromProp: ReactionState =
    userLikeStatus === 'like' ? 'like' : userLikeStatus === 'dislike' ? 'dislike' : 'none';

  const initialReaction: ReactionState =
    initialStateFromProp !== 'none' ? initialStateFromProp : initialLocal.state;

  const [reaction, setReaction] = useState<ReactionState>(initialReaction);
  const [stats, setStats] = useState<Stats | null>(() =>
    initialTotals
      ? normalizeTotals(postId, initialTotals, true)
      : initialLocal.stats
        ? normalizeTotals(postId, initialLocal.stats, false)
        : null,
  );
  const [isLoadingTotals, setIsLoadingTotals] = useState<boolean>(!initialTotals);
  const [isPending, setIsPending] = useState(false);

  const [inlineToast, setInlineToast] = useState<{
    message: string;
    type: 'like' | 'dislike' | 'error';
  } | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const hideTimerRef = useRef<number | null>(null);
  const removeTimerRef = useRef<number | null>(null);
  const isPendingRef = useRef(false);
  const lastActionTsRef = useRef<number>(0);
  const reactionRef = useRef<ReactionState>(initialReaction);
  const statsRef = useRef<Stats | null>(stats);

  useEffect(() => {
    reactionRef.current = reaction;
  }, [reaction]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Keep stats in sync if initialTotals prop changes (e.g. list prefetch / SSE).
  useEffect(() => {
    if (!initialTotals) return;
    const next = normalizeTotals(postId, initialTotals, true);
    setStats(next);
    setIsLoadingTotals(false);
    onUpdate?.(next.totals.likes, next.totals.dislikes);
    writeLocalReaction(storageKey, reactionRef.current, {
      postId: next.postId,
      baselineLikes: next.baselineLikes,
      baselineDislikes: next.baselineDislikes,
      likesCount: next.likesCount,
      dislikesCount: next.dislikesCount,
      totals: next.totals,
    });
    try {
      window.dispatchEvent(
        new CustomEvent('reaction:updated', {
          detail: {
            postId: next.postId,
            baselineLikes: next.baselineLikes,
            baselineDislikes: next.baselineDislikes,
            likesCount: next.likesCount,
            dislikesCount: next.dislikesCount,
            totals: { ...next.totals },
          } satisfies ReactionTotals,
        }),
      );
    } catch {
      // ignore event errors
    }
  }, [initialTotals, onUpdate, postId, storageKey]);

  // Initial load from server when we don't have initialTotals.
  useEffect(() => {
    if (initialTotals) {
      setIsLoadingTotals(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoadingTotals(true);
      try {
        const data = await fetchReactions(postId);
        if (cancelled || !data) return;
        const next = normalizeTotals(postId, data, true);
        setStats(next);
        setIsLoadingTotals(false);
        onUpdate?.(next.totals.likes, next.totals.dislikes);
        writeLocalReaction(storageKey, reactionRef.current, {
          postId: next.postId,
          baselineLikes: next.baselineLikes,
          baselineDislikes: next.baselineDislikes,
          likesCount: next.likesCount,
          dislikesCount: next.dislikesCount,
          totals: next.totals,
        });
        try {
          window.dispatchEvent(
            new CustomEvent('reaction:updated', {
              detail: {
                postId: next.postId,
                baselineLikes: next.baselineLikes,
                baselineDislikes: next.baselineDislikes,
                likesCount: next.likesCount,
                dislikesCount: next.dislikesCount,
                totals: { ...next.totals },
              } satisfies ReactionTotals,
            }),
          );
        } catch {
          // ignore
        }
      } catch (error) {
        // Backend unavailable: fall back to local-only counts (0/0 by default).
        console.error('[LikeDislike] Failed to load reactions:', error);
        if (cancelled) return;
        setIsLoadingTotals(false);
        setStats((prev) =>
          prev ??
          normalizeTotals(
            postId,
            {
              postId,
              baselineLikes: 0,
              baselineDislikes: 0,
              likesCount: 0,
              dislikesCount: 0,
              totals: { likes: 0, dislikes: 0 },
            },
            false,
          ),
        );
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [postId, storageKey, onUpdate, initialTotals]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (removeTimerRef.current) {
        window.clearTimeout(removeTimerRef.current);
        removeTimerRef.current = null;
      }
    };
  }, []);

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

  const applyServerTotals = (data: ReactionTotals) => {
    const next = normalizeTotals(postId, data, true);
    setStats(next);
    onUpdate?.(next.totals.likes, next.totals.dislikes);
    writeLocalReaction(storageKey, reactionRef.current, {
      postId: next.postId,
      baselineLikes: next.baselineLikes,
      baselineDislikes: next.baselineDislikes,
      likesCount: next.likesCount,
      dislikesCount: next.dislikesCount,
      totals: next.totals,
    });
    try {
      window.dispatchEvent(
        new CustomEvent('reaction:updated', {
          detail: {
            postId: next.postId,
            baselineLikes: next.baselineLikes,
            baselineDislikes: next.baselineDislikes,
            likesCount: next.likesCount,
            dislikesCount: next.dislikesCount,
            totals: { ...next.totals },
          } satisfies ReactionTotals,
        }),
      );
    } catch {
      // ignore
    }
  };

  const commitOptimisticUpdate = (
    prevState: ReactionState,
    nextState: ReactionState,
    targetIsLike: boolean,
  ) => {
    const current = statsRef.current;
    const base = current ?? normalizeTotals(postId, null, false);
    const { deltaLikes, deltaDislikes } = computeReactionDelta(prevState, nextState);

    const likesCount = Math.max(0, (base.likesCount || 0) + deltaLikes);
    const dislikesCount = Math.max(0, (base.dislikesCount || 0) + deltaDislikes);

    const nextStats: Stats = {
      postId,
      baselineLikes: base.baselineLikes,
      baselineDislikes: base.baselineDislikes,
      likesCount,
      dislikesCount,
      totals: {
        likes: base.baselineLikes + likesCount,
        dislikes: base.baselineDislikes + dislikesCount,
      },
      hasServerData: base.hasServerData,
    };

    setStats(nextStats);
    statsRef.current = nextStats;
    setReaction(nextState);
    reactionRef.current = nextState;

    writeLocalReaction(storageKey, nextState, {
      postId: nextStats.postId,
      baselineLikes: nextStats.baselineLikes,
      baselineDislikes: nextStats.baselineDislikes,
      likesCount: nextStats.likesCount,
      dislikesCount: nextStats.dislikesCount,
      totals: nextStats.totals,
    });

    onLike?.(nextState === 'like');
    onDislike?.(nextState === 'dislike');
    onUpdate?.(nextStats.totals.likes, nextStats.totals.dislikes);

    try {
      window.dispatchEvent(
        new CustomEvent('reaction:updated', {
          detail: {
            postId: nextStats.postId,
            baselineLikes: nextStats.baselineLikes,
            baselineDislikes: nextStats.baselineDislikes,
            likesCount: nextStats.likesCount,
            dislikesCount: nextStats.dislikesCount,
            totals: { ...nextStats.totals },
          } satisfies ReactionTotals,
        }),
      );
    } catch {
      // ignore
    }

    if (nextState === 'like' && targetIsLike) {
      showInlineToast('Thanks for liking! 😘', 'like');
    } else if (nextState === 'dislike' && !targetIsLike) {
      showInlineToast('Thanks for the feedback! 😔', 'dislike');
    }
  };

  const handleToggle = async (target: 'like' | 'dislike') => {
    const now = Date.now();
    if (isPendingRef.current || now - lastActionTsRef.current < ACTION_THROTTLE_MS) return;
    isPendingRef.current = true;
    setIsPending(true);
    lastActionTsRef.current = now;

    const prevState: ReactionState = reactionRef.current;
    let nextState: ReactionState;
    if (target === 'like') {
      nextState = prevState === 'like' ? 'none' : 'like';
    } else {
      nextState = prevState === 'dislike' ? 'none' : 'dislike';
    }

    const isLike = target === 'like';

    commitOptimisticUpdate(prevState, nextState, isLike);

    try {
      const data = await submitReaction(postId, isLike, {
        prevState,
        nextState,
      });
      applyServerTotals(data);
    } catch (error) {
      console.error(
        `[LikeDislike] Error handling ${isLike ? 'like' : 'dislike'} for post ${postId}:`,
        error,
      );
      showInlineToast(
        isLike ? 'Failed to sync like. Saved locally.' : 'Failed to sync dislike. Saved locally.',
        'error',
      );
      // Keep optimistic UI; a future refresh or navigation can resync.
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  };

  const liked = reaction === 'like';
  const disliked = reaction === 'dislike';
  const totalLikes = stats?.totals?.likes ?? 0;
  const totalDislikes = stats?.totals?.dislikes ?? 0;

  return (
    <div className={`relative ${className || ''}`} data-toast-container>
      {variant === 'reader' && (
        <p className="text-center text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide font-sans">
          Loved this story? Let me know with a like—or a dislike if you must
        </p>
      )}
      <div
        className={`flex items-center gap-3 ${
          variant === 'reader' ? 'justify-center' : 'justify-start'
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void handleToggle('like');
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
          <ThumbsUp className={variant === 'reader' ? 'h-4 w-4' : 'h-3 w-3'} />
          <span className="font-sans tabular-nums">
            {isLoadingTotals ? '—' : totalLikes}
          </span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void handleToggle('dislike');
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
          <ThumbsDown className={variant === 'reader' ? 'h-4 w-4' : 'h-3 w-3'} />
          <span className="font-sans tabular-nums">
            {isLoadingTotals ? '—' : totalDislikes}
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
