import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { fetchWordPressPosts, convertWordPressPost } from "@/services/wordpress";

export default function LatestStories() {
  const [, setLocation] = useLocation();
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["wordpress", "latest-posts"],
    queryFn: async () => {
      const wpPosts = await fetchWordPressPosts(1, 3); // Fetch only 3 latest posts
      return wpPosts.map(post => convertWordPressPost(post)) as Post[];
    },
    staleTime: 5 * 60 * 1000
  });

  if (isLoading || !posts) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-6">
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

      <div className="grid gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group p-4 rounded-lg border border-border/50 bg-card hover:bg-card/80 transition-colors cursor-pointer"
            onClick={() => setLocation(`/story/${post.slug}`)}
          >
            <h3 className="font-medium group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {post.excerpt}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}