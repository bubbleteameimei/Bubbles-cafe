import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { fetchReactions, submitReaction } from "@/api/reactions";

interface LikeDislikeProps {
  postId: number;
  slug?: string;
  source?: "local" | "wp";
  className?: string;
  variant?: "index" | "reader";
}

/**
 * Minimal reactions:
 * - Baseline counts for likes and dislikes from server.
 * - Simple toggle for like or dislike (no SSE, no complex optimistic logic).
 * - No "—" fallback; defaults to 0 until loaded.
 */
export function LikeDislike({
  postId,
  slug,
  source = "local",
  className,
  variant = "index",
}: LikeDislikeProps) {
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [disliked, setDisliked] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const totals = await fetchReactions(postId);
        if (!mounted) return;
        const baseLikes = Number(totals?.baselineLikes || 0);
        const baseDislikes = Number(totals?.baselineDislikes || 0);
        const totalLikes = Number(totals?.totals?.likes || baseLikes);
        const totalDislikes = Number(totals?.totals?.dislikes || baseDislikes);
        setLikes(totalLikes);
        setDislikes(totalDislikes);
        // Restore local state if present
        try {
          const key = slug && slug.trim()
            ? `reaction-${source}:${slug.trim()}`
            : `reaction-${source}:post-${postId}`;
          const raw = localStorage.getItem(key);
          const prev = raw ? JSON.parse(raw) : null;
          setLiked(prev?.state === "like");
          setDisliked(prev?.state === "dislike");
        } catch {}
      } catch {
        // Keep defaults on failure
      }
    })();
    return () => { mounted = false; };
  }, [postId, slug, source]);

  const persistState = (state: "like" | "dislike" | "none") => {
    try {
      const key = slug && slug.trim()
        ? `reaction-${source}:${slug.trim()}`
        : `reaction-${source}:post-${postId}`;
      localStorage.setItem(key, JSON.stringify({ state }));
    } catch {}
  };

  const handleLike = async () => {
    if (pending) return;
    setPending(true);
    try {
      const nextLiked = !liked;
      const res = await submitReaction(postId, nextLiked);
      const baseLikes = Number(res?.baselineLikes || 0);
      const baseDislikes = Number(res?.baselineDislikes || 0);
      const totalLikes = Number(res?.totals?.likes || baseLikes);
      const totalDislikes = Number(res?.totals?.dislikes || baseDislikes);
      setLikes(totalLikes);
      setDislikes(totalDislikes);
      setLiked(nextLiked);
      // If liking, clear dislike
      if (nextLiked && disliked) setDisliked(false);
      persistState(nextLiked ? "like" : "none");
    } catch {
      // On failure keep previous state
    } finally {
      setPending(false);
    }
  };

  const handleDislike = async () => {
    if (pending) return;
    setPending(true);
    try {
      const nextDisliked = !disliked;
      const res = await submitReaction(postId, false);
      const baseLikes = Number(res?.baselineLikes || 0);
      const baseDislikes = Number(res?.baselineDislikes || 0);
      const totalLikes = Number(res?.totals?.likes || baseLikes);
      const totalDislikes = Number(res?.totals?.dislikes || baseDislikes);
      setLikes(totalLikes);
      setDislikes(totalDislikes);
      setDisliked(nextDisliked);
      // If disliking, clear like
      if (nextDisliked && liked) setLiked(false);
      persistState(nextDisliked ? "dislike" : "none");
    } catch {
      // On failure keep previous state
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={className || ""}>
      <div className={`flex items-center gap-3 ${variant === "reader" ? "justify-center" : "justify-start"}`}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          className={`
            inline-flex items-center gap-2 font-sans font-medium text-sm
            px-4 py-2 rounded-lg border transition-all duration-200
            hover:scale-105 hover:-translate-y-[1px] active:translate-y-0 active:scale-95 will-change-transform
            focus:outline-none focus:ring-0 focus:ring-offset-0
            ${variant === "reader" ? "min-w-[100px] justify-center" : "h-8 px-3 py-1 text-xs min-w-[70px]"}
            ${liked
              ? "bg-[hsl(var(--success)/0.15)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))] shadow-sm hover:bg-[hsl(var(--success)/0.2)]"
              : "bg-card border-border text-foreground/80 hover:bg-muted hover:text-foreground shadow-sm"}
          `}
          aria-pressed={liked}
          aria-label="Like this story"
          disabled={pending}
        >
          <ThumbsUp className={`${variant === "reader" ? "h-4 w-4" : "h-3 w-3"}`} />
          <span className="font-sans tabular-nums">{likes}</span>
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleDislike(); }}
          className={`
            inline-flex items-center gap-2 font-sans font-medium text-sm
            px-4 py-2 rounded-lg border transition-all duration-200
            hover:scale-105 hover:-translate-y-[1px] active:translate-y-0 active:scale-95 will-change-transform
            focus:outline-none focus:ring-0 focus:ring-offset-0
            ${variant === "reader" ? "min-w-[100px] justify-center" : "h-8 px-3 py-1 text-xs min-w-[70px]"}
            ${disliked
              ? "bg-[hsl(var(--destructive)/0.15)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] shadow-sm hover:bg-[hsl(var(--destructive)/0.2)]"
              : "bg-card border-border text-foreground/80 hover:bg-muted hover:text-foreground shadow-sm"}
          `}
          aria-pressed={disliked}
          aria-label="Dislike this story"
          disabled={pending}
        >
          <ThumbsDown className={`${variant === "reader" ? "h-4 w-4" : "h-3 w-3"}`} />
          <span className="font-sans tabular-nums">{dislikes}</span>
        </button>
      </div>
    </div>
  );
}

