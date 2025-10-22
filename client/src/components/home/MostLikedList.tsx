import React, { useMemo } from 'react';
import { Star, Calendar, Clock, Heart } from 'lucide-react';
import { getReadingTime } from '@/lib/content-analysis';
import { type posts } from '@shared/schema';

type Post = typeof posts.$inferSelect;

interface MostLikedListProps {
  posts: Post[];
  onNavigate: (slugOrId: string | number) => void;
}

const MostLikedListComponent: React.FC<MostLikedListProps> = ({ posts, onNavigate }) => {
  const topLiked = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return [] as Post[];
    return [...posts]
      .sort((a, b) => (Number(b.likesCount || 0)) - (Number(a.likesCount || 0)))
      .slice(0, 6);
  }, [posts]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">Most Liked</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topLiked.map((p) => (
          <article
            key={p.id}
            className="group rounded-lg border border-border/60 bg-card/70 hover:bg-card transition hover:-translate-y-0.5 shadow-sm hover:shadow-md cursor-pointer"
            onClick={() => onNavigate(p.slug || p.id)}
          >
            <div className="p-3">
              <button
                className="text-left text-sm font-medium hover:text-primary line-clamp-2"
                onClick={(e) => { e.stopPropagation(); onNavigate(p.slug || p.id); }}
                title={p.title}
              >
                {p.title}
              </button>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3 w-3 text-rose-500" />
                    {Number(p.likesCount || 0)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getReadingTime(p.content)}
                  </span>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <time>{new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
                </div>
              </div>
            </div>
          </article>
        ))}
        {topLiked.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No liked stories yet.
          </div>
        )}
      </div>
    </div>
  );
};

const propsAreEqual = (prev: MostLikedListProps, next: MostLikedListProps) => {
  // Shallow compare length and top candidates to avoid frequent re-renders
  if (prev.posts.length !== next.posts.length) return false;
  // Compare first 10 post ids as a heuristic for stability
  for (let i = 0; i < Math.min(10, prev.posts.length, next.posts.length); i++) {
    if (prev.posts[i]?.id !== next.posts[i]?.id || prev.posts[i]?.likesCount !== next.posts[i]?.likesCount) {
      return false;
    }
  }
  return prev.onNavigate === next.onNavigate;
};

export default React.memo(MostLikedListComponent, propsAreEqual);

