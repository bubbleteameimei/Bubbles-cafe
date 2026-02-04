import React from 'react';
import { useQuery } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import { apiRequest } from '@/lib/queryClient';
import type { Post } from '@shared/schema';

function getRotationDays(): number {
  const raw = (import.meta as any)?.env?.VITE_BEST_STORIES_ROTATION_DAYS;
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 3) return n;
  // Default weekly rotation; supports 3–4 day periods via env
  return 7;
}

export default function BestStoriesPage() {
  const canonical = '/best-stories';
  const rotationDays = getRotationDays();
  const epochDays = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const rotationIndexSeed = Math.floor(epochDays / rotationDays);

  const { data } = useQuery<Post[]>({
    queryKey: ['best-stories', 'posts'],
    queryFn: async () => {
      const res = await apiRequest<{ posts?: Post[] }>('/api/posts?limit=100&includeContent=false');
      return Array.isArray(res.posts) ? res.posts : [];
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const posts = Array.isArray(data) ? data : [];
  const count = posts.length;

  // Deterministic rotating selection of 3 consecutive posts
  const start = count > 0 ? (rotationIndexSeed % count) : 0;
  const selected = count >= 3
    ? [posts[start], posts[(start + 1) % count], posts[(start + 2) % count]]
    : posts.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Best Stories"
        description="A curated selection of Bubble’s Cafe’s most read and most loved short fiction."
        canonical={canonical}
        type="website"
      />
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Best Stories</h1>
        <p className="text-muted-foreground mb-8">
          A handpicked, rotating collection of reader favorites and standout pieces.
        </p>
        {selected.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stories available right now. Please check back soon.</p>
        ) : (
          <ul className="space-y-6">
            {selected.map((p: Post) => {
              const rawTitle = String(p?.title || 'Untitled');
              const titleText = rawTitle.replace(/<\/?[^>]+(>|$)/g, '').trim();
              const slug = String(p?.slug || p?.id || '').trim();
              const excerpt = String((p as any)?.excerpt || '').replace(/<\/?[^>]+(>|$)/g, '').trim();
              const description = excerpt || 'Discover this standout horror story.';
              if (!slug) return null;
              return (
                <li key={slug} className="border border-border rounded-lg p-4">
                  <a href={`/reader/${encodeURIComponent(slug)}`} className="text-xl font-semibold underline hover:no-underline">
                    <span>{titleText}</span>
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">{description}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}