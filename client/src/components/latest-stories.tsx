import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { extractHorrorExcerpt } from "@/lib/content-analysis";
import { useMemo } from "react";

export default function LatestStories() {
  const [, setLocation] = useLocation();
  
  // Fetch posts from our database (including user created posts)
  const { data: dbPosts, isLoading: dbLoading } = useQuery<Post[]>({
    queryKey: ["posts", "latest"],
    queryFn: async () => {
      const response = await fetch('/api/posts?limit=10');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      return data.posts as Post[];
    },
    staleTime: 2 * 60 * 1000
  });
  
  // Sort by date (newest first) and take top 3
  const allPosts = useMemo(() => {
    if (!dbPosts) return [];

    return dbPosts
      .slice()
      .sort((a, b) => {
        const dateA = new Date(a.createdAt as any).getTime();
        const dateB = new Date(b.createdAt as any).getTime();
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [dbPosts]);
  
  const isLoading = dbLoading;

  if (isLoading || !allPosts.length) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest Stories</h2>
          <Button
            variant="ghost"
            onClick={() => setLocation('/stories')}
            className="text-primary hover:text-primary/80"
          >
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-3">
          {allPosts.map((post) => (
            <div
              key={post.id}
              className="group p-3 rounded-lg border border-border/50 bg-card hover:bg-card/80 transition-colors cursor-pointer"
              onClick={() => setLocation(`/reader/${post.slug}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLocation(`/reader/${post.slug}`);
                }
              }}
              role="button"
              tabIndex={0}
              data-testid={`latest-story-${post.id}`}
            >
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground line-clamp-3 mt-1 font-serif leading-relaxed">
                {post.content && extractHorrorExcerpt(post.content)}
              </p>
            </div>
          ))}
        </div>

        <Card className="mt-6 bg-card/80 backdrop-blur-md border border-border/60">
          <CardHeader>
            <CardTitle>Try the Bubble’s Cafe App!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold">How to install — iPhone &amp; iPad</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Open in Safari browser</li>
                <li className="flex items-center gap-2">
                  Tap Share
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline-block"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                </li>
                <li>Scroll down and select "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold">Android</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Open in Chrome browser</li>
                <li>Look for "Add to Home Screen" banner</li>
                <li>Or tap menu → "Install app"</li>
                <li>Tap "Install" to confirm</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold">Having trouble?</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Use Safari (iOS) or Chrome (Android)</li>
                <li>Try refreshing the page</li>
                <li>Disable ad blockers temporarily</li>
                <li>Search how to install PWA</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </ErrorBoundary>
  );
}