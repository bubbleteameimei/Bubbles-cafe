import React from 'react';
import { useQuery } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import { apiRequest } from '@/lib/queryClient';
import type { Post } from '@shared/schema';

const curatedSlugs = ['nostalgia', 'blood'];

export default function EditorsPicksPage() {
  const canonical = '/editors-picks';

  const { data } = useQuery<Post[]>({
    queryKey: ['editors-picks', 'posts'],
    queryFn: async () => {
      const res = await apiRequest<{ posts?: Post[] }>('/api/posts?limit=100&includeContent=false');
      return Array.isArray(res.posts) ? res.posts : [];
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const posts = Array.isArray(data) ? data : [];

  // Try to map curated slugs to posts
  const curatedFound: Post[] = [];
  for (const slug of curatedSlugs) {
    const match = posts.find((p: Post) => String(p?.slug || '').trim().toLowerCase() === slug);
    if (match) curatedFound.push(match);
  }

  // If fewer than 3, fill with remaining posts from the list without duplicates
  const fillCount = Math.max(0, 3 - curatedFound.length);
  const filler: Post[] = [];
  for (const p of posts) {
    if (filler.length >= fillCount) break;
    const slug = String(p?.slug || '').trim();
    if (!slug) continue;
    if (curatedSlugs.includes(slug.toLowerCase())) continue;
    filler.push(p as Post);
  }

  const selected = [...curatedFound, ...filler].slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Editor’s Picks"
        description="A curated showcase of standout short fiction selected by the editor."
        canonical={canonical}
        type="website"
      />
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Editor’s Picks</h1>
        <p className="text-muted-foreground mb-8">
          Selected highlights from Bubble’s Cafe.
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
              const description = excerpt || 'Read this editor’s pick.';
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