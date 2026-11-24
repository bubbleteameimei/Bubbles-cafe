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
  /** List pages pass totals in shortly; skip this card's own request until they give up. */
  deferFetch?: boolean;
  /** Show initialTotals immediately but still fetch fresh counts and the visitor's vote. */
  refreshOnMount?: boolean;
}

type ReactionState = 'like' | 'dislike' | 'none';

interface Stats extends ReactionTotals {
  hasServerData: boolean;
}

const getStorageKey = (postId: number, slug?: string, source: 'local' | 'wp' = 'local') =>
  slug && slug.trim() ? `reaction-${source}:${slug.trim()}` : `reaction-${source}:post-${postId}`;

function normalizeTotals(postId: number, totals: ReactionTotals | null, hasServerData: boolean): Stats {
  const base = totals ?? {
    postId,
    baselineLikes: 0,
    baselineDislikes: 0,
    likesCount: 0,
    dislikesCount: 0,
    totals: { likes: 0, dislikes: 0 },
  };
  const baselineLikes = Number(base.baselineLikes ?? 0);
  const baselineDislikes = Number(base.baselineDislikes ?? 0);
  const likesCount = Math.max(0, Number(base.likesCount ?? 0));
  const dislikesCount = Math.max(0, Number(base.dislikesCount ?? 0));
  return {
    postId,
    baselineLikes,
    baselineDislikes,
    likesCount,
    dislikesCount,
    totals: {
      likes: Math.max(0, Number(base.totals?.likes ?? baselineLikes + likesCount)),
      dislikes: Math.max(0, Number(base.totals?.dislikes ?? baselineDislikes + dislikesCount)),
    },
    hasServerData,
  };
}

/** Counts after moving this visitor's vote from `prev` to `next`. */
function applyVote(stats: Stats, prev: ReactionState, next: ReactionState): Stats {
  const likesCount = Math.max(0, stats.likesCount - (prev === 'like' ? 1 : 0) + (next === 'like' ? 1 : 0));
  const dislikesCount = Math.max(
    0,
    stats.dislikesCount - (prev === 'dislike' ? 1 : 0) + (next === 'dislike' ? 1 : 0),
  );
  return {
    ...stats,
    likesCount,
    dislikesCount,
    totals: { likes: stats.baselineLikes + likesCount, dislikes: stats.baselineDislikes + dislikesCount },
  };
}

function asState(value: unknown): ReactionState | null {
  return value === 'like' || value === 'dislike' || value === 'none' ? value : null;
}

function readLocalReaction(storageKey: string): { state: ReactionState; stats: ReactionTotals | null } {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || 'null');
    const state = asState(parsed?.state) ?? 'none';
    const stats = parsed?.stats && typeof parsed.stats === 'object' ? parsed.stats : null;
    return { state, stats };
  } catch {
    return { state: 'none', stats: null };
  }
}

function writeLocalReaction(storageKey: string, state: ReactionState, stats: Stats | null) {
  try {
    const { hasServerData: _ignored, ...plain } = stats ?? ({} as Stats);
    localStorage.setItem(storageKey, JSON.stringify({ state, stats: stats ? plain : null }));
  } catch {
    // storage unavailable (private mode etc.)
  }
}

function broadcast(stats: Stats) {
  try {
    const { hasServerData: _ignored, ...detail } = stats;
    window.dispatchEvent(new CustomEvent('reaction:updated', { detail: detail satisfies ReactionTotals }));
  } catch {
    // ignore
  }
}

/**
 * Like / dislike buttons.
 *
 * Behaviour:
 * - Every tap responds instantly (optimistic). Buttons are never disabled and taps are
 *   never dropped; rapid taps are coalesced and only the final choice is sent.
 * - The server is the source of truth: its reply (and the visitor's stored vote, when it
 *   reports one) replaces the optimistic numbers. If saving fails, the buttons roll back
 *   to the last saved state and a short message appears without moving the layout.
 * - No success toasts. Selection is shown by a filled button and a small icon "pop"
 *   (skipped for people who prefer reduced motion).
 */
function LikeDislikeInner({
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
  deferFetch = false,
  refreshOnMount = false,
}: LikeDislikeProps) {
  const storageKey = getStorageKey(postId, slug, source);

  const [initial] = useState(() => {
    const local = readLocalReaction(storageKey);
    const fromProp = asState(userLikeStatus);
    const reaction: ReactionState = fromProp && fromProp !== 'none' ? fromProp : local.state;
    const stats = initialTotals
      ? normalizeTotals(postId, initialTotals, true)
      : local.stats
        ? normalizeTotals(postId, local.stats, false)
        : null;
    return { reaction, stats };
  });

  const [reaction, setReaction] = useState<ReactionState>(initial.reaction);
  const [stats, setStats] = useState<Stats | null>(initial.stats);
  const [error, setError] = useState<string | null>(null);
  // Bumped when a button becomes selected, to replay the icon pop animation.
  const [pop, setPop] = useState<{ target: 'like' | 'dislike'; n: number } | null>(null);

  // What the server last confirmed (for rollback) vs. what the visitor last chose.
  const confirmedRef = useRef<{ reaction: ReactionState; stats: Stats | null }>(initial);
  const desiredRef = useRef<ReactionState>(initial.reaction);
  const statsRef = useRef<Stats | null>(initial.stats);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  const errorTimerRef = useRef<number | null>(null);

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const isPending = () => desiredRef.current !== confirmedRef.current.reaction || inFlightRef.current;

  const show = (nextReaction: ReactionState, nextStats: Stats | null) => {
    setReaction(nextReaction);
    setStats(nextStats);
    statsRef.current = nextStats;
    writeLocalReaction(storageKey, nextReaction, nextStats);
    if (nextStats) onUpdateRef.current?.(nextStats.totals.likes, nextStats.totals.dislikes);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
    };
  }, []);

  // Totals handed down by a list (index page). Ignored while this card has an unsaved
  // vote, since the list may simply be echoing our own optimistic numbers back.
  const initialSig = initialTotals
    ? [initialTotals.likesCount, initialTotals.dislikesCount, initialTotals.baselineLikes, initialTotals.baselineDislikes].join('|')
    : '';
  useEffect(() => {
    if (!initialTotals || isPending()) return;
    const next = normalizeTotals(postId, initialTotals, true);
    confirmedRef.current = { reaction: confirmedRef.current.reaction, stats: next };
    show(desiredRef.current, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSig, postId]);

  // Without list totals (reader page), load counts and this visitor's saved vote.
  const hasInitialTotals = !!initialTotals;
  useEffect(() => {
    if ((hasInitialTotals && !refreshOnMount) || deferFetch) return;
    let cancelled = false;
    fetchReactions(postId)
      .then((data) => {
        if (cancelled || !data || isPending()) return;
        const next = normalizeTotals(postId, data, true);
        const serverState = asState((data as { state?: unknown }).state);
        const nextReaction = serverState ?? desiredRef.current;
        confirmedRef.current = { reaction: nextReaction, stats: next };
        desiredRef.current = nextReaction;
        show(nextReaction, next);
        broadcast(next);
      })
      .catch(() => {
        // Offline / API asleep: keep whatever we had; counts show a dash until known.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, hasInitialTotals, deferFetch, refreshOnMount]);

  const flashError = (message: string) => {
    setError(message);
    if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
    errorTimerRef.current = window.setTimeout(() => setError(null), 3500);
  };

  // Send the visitor's latest choice; one request at a time, latest choice wins.
  const sync = async () => {
    if (inFlightRef.current) return;
    const target = desiredRef.current;
    const from = confirmedRef.current.reaction;
    if (target === from) return;
    inFlightRef.current = true;
    try {
      const data = await submitReaction(postId, target === 'like', { prevState: from, nextState: target });
      const next = normalizeTotals(postId, data, true);
      confirmedRef.current = { reaction: target, stats: next };
      if (mountedRef.current && desiredRef.current === target) {
        show(target, next);
        broadcast(next);
      }
    } catch (err) {
      console.error(`[LikeDislike] Failed to save reaction for post ${postId}:`, err);
      const saved = confirmedRef.current;
      desiredRef.current = saved.reaction;
      if (mountedRef.current) {
        show(saved.reaction, saved.stats);
        if (saved.stats) broadcast(saved.stats);
        flashError("Couldn't save your vote. Please try again.");
      }
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current && desiredRef.current !== confirmedRef.current.reaction) void sync();
    }
  };

  const toggle = (target: 'like' | 'dislike') => {
    const prev = desiredRef.current;
    const next: ReactionState = prev === target ? 'none' : target;
    desiredRef.current = next;

    const base = statsRef.current ?? normalizeTotals(postId, null, false);
    const optimistic = applyVote(base, prev, next);
    show(next, optimistic);
    broadcast(optimistic);
    setError(null);
    if (next !== 'none') setPop((p) => ({ target: next, n: (p?.n ?? 0) + 1 }));
    onLike?.(next === 'like');
    onDislike?.(next === 'dislike');
    void sync();
  };

  const liked = reaction === 'like';
  const disliked = reaction === 'dislike';
  const known = stats !== null;
  const isReader = variant === 'reader';

  const base =
    'inline-flex items-center justify-center gap-2 rounded-full border font-sans font-medium tabular-nums select-none ' +
    'transition-colors duration-150 motion-safe:active:scale-95 touch-manipulation [-webkit-tap-highlight-color:transparent] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
    (isReader ? 'h-11 min-w-[96px] px-5 text-sm' : 'h-9 min-w-[64px] px-3 text-xs');
  const idle =
    'bg-card border-border text-muted-foreground [@media(hover:hover)]:hover:text-foreground [@media(hover:hover)]:hover:border-foreground/30';
  const iconSize = isReader ? 'h-[18px] w-[18px]' : 'h-3.5 w-3.5';
  const popClass = (t: 'like' | 'dislike') => (pop?.target === t && reaction === t ? 'reaction-pop' : '');

  return (
    <div className={`relative ${className || ''}`}>
      {isReader && (
        <p className="text-center text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide font-sans">
          Loved this story? Let me know with a like—or a dislike if you must
        </p>
      )}
      <div className={`flex items-center gap-3 ${isReader ? 'justify-center' : 'justify-start'}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle('like');
          }}
          className={`${base} ${liked ? 'bg-primary border-primary text-primary-foreground' : idle}`}
          aria-pressed={liked}
          aria-label={liked ? 'Remove your like' : 'Like this story'}
        >
          <ThumbsUp
            key={pop?.target === 'like' ? pop.n : 0}
            className={`${iconSize} ${liked ? 'fill-current' : ''} ${popClass('like')}`}
            aria-hidden="true"
          />
          <span className="min-w-[1.5ch] text-left">{known ? stats.totals.likes : '–'}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle('dislike');
          }}
          className={`${base} ${disliked ? 'bg-foreground border-foreground text-background' : idle}`}
          aria-pressed={disliked}
          aria-label={disliked ? 'Remove your dislike' : 'Dislike this story'}
        >
          <ThumbsDown
            key={pop?.target === 'dislike' ? pop.n : 0}
            className={`${iconSize} ${disliked ? 'fill-current' : ''} ${popClass('dislike')}`}
            aria-hidden="true"
          />
          <span className="min-w-[1.5ch] text-left">{known ? stats.totals.dislikes : '–'}</span>
        </button>
      </div>

      {/* Positioned below the buttons so showing it never shifts the page. */}
      <p
        role="status"
        aria-live="polite"
        className={`absolute left-0 right-0 top-full mt-1.5 text-xs text-destructive font-sans pointer-events-none ${
          isReader ? 'text-center' : 'text-left'
        }`}
      >
        {error}
      </p>
    </div>
  );
}

/** Keyed by story so moving to another story never carries the previous vote over. */
export function LikeDislike(props: LikeDislikeProps) {
  return <LikeDislikeInner key={`${props.source ?? 'local'}:${props.postId}`} {...props} />;
}
