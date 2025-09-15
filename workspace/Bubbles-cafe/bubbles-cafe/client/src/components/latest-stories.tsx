import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { fetchWordPressPosts, convertWordPressPost } from "@/services/wordpress";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { extractHorrorExcerpt } from "@/lib/content-analysis";
import { useMemo } from "react";

export default function LatestStories() {
  const [, setLocation] = useLocation();
  
  // Fetch both WordPress posts and local database posts
  const { data: wordpressPosts, isLoading: wpLoading } = useQuery<Post[]>({
    queryKey: ["wordpress", "latest-posts"],
    queryFn: async () => {
      const wpPosts = await fetchWordPressPosts(1, 3); // Fetch latest WordPress posts
      return wpPosts.map(post => convertWordPressPost(post)) as Post[];
    },
    staleTime: 5 * 60 * 1000
  });

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
  
  // Combine and sort all posts by date
  const allPosts = useMemo(() => {
    const combined = [...(wordpressPosts || []), ...(dbPosts || [])];
    
    // Remove duplicates (might have same post in both WP and DB)
    const uniquePosts = combined.filter((post, index, self) => 
      index === self.findIndex(p => p.slug === post.slug)
    );
    
    // Sort by date (newest first)
    return uniquePosts.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    }).slice(0, 3); // Only take the 3 most recent
  }, [wordpressPosts, dbPosts]);
  
  const isLoading = wpLoading || dbLoading;

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
      </section>
    </ErrorBoundary>
  );
}