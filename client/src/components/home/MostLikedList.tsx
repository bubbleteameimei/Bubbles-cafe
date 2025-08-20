import React, { useMemo } from 'react';
import { Star, Book } from 'lucide-react';
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
      .slice(0, 4);
  }, [posts]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">Most Liked</h3>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {topLiked.map((p) => (
          <div key={p.id} className="flex flex-col">
            <button
              className="text-left text-sm font-medium hover:text-primary line-clamp-1"
              onClick={() => onNavigate(p.slug || p.id)}
            >
              {p.title}
            </button>
            <div className="text-[11px] text-muted-foreground">❤️ {Number(p.likesCount || 0)} • {getReadingTime(p.content)}</div>
          </div>
        ))}
        {topLiked.length === 0 && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Book className="h-3 w-3" />
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

