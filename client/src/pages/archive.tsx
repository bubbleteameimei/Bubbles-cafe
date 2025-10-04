import React from 'react';
import { useQuery } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import { fetchAllWordPressPosts, convertWordPressPost, type WordPressPost } from '@/services/wordpress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { format } from 'date-fns';

type Post = {
  id: number;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  createdAt: Date | string;
};

export default function ArchivePage() {
  const [, setLocation] = useLocation();

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['archive', 'all-posts'],
    queryFn: async () => {
      const wpPosts = await fetchAllWordPressPosts();
      return (wpPosts || []).map((p: WordPressPost) => convertWordPressPost(p)) as Post[];
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Archive"
        description="Dark, psychological, and gothic fiction — short stories and unsettling tales from Bubble’s Cafe."
        canonical="/archive"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Archive', url: '/archive' },
        ]}
      />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-decorative">Archive</h1>
          <p className="text-muted-foreground mt-2">
            Browse all stories in one place. Use your browser search to quickly find titles.
          </p>
        </header>

        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading archive…</div>
        )}

        {error && !isLoading && (
          <div className="text-sm text-red-500">
            Failed to load archive. Please try again later.
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-sm text-muted-foreground">No stories available.</div>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="hover:bg-accent/30 transition"
                onClick={() => setLocation('/reader')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold leading-snug">
                    <button
                      className="text-left hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        try {
                          sessionStorage.setItem('selectedPostSlug', String(post.slug || post.id));
                        } catch {}
                        setLocation('/reader');
                      }}
                    >
                      {post.title}
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground mb-2">
                    {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : ''}
                  </div>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="mt-3">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        try {
                          sessionStorage.setItem('selectedPostSlug', String(post.slug || post.id));
                        } catch {}
                        setLocation('/reader');
                      }}
                    >
                      Read
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}