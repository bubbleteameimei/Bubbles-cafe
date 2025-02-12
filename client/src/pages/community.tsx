import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
}

export default function CommunityPage() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<PostsResponse>({
    queryKey: ["/api/posts", { filter: "community" }],
    queryFn: async () => {
      const response = await fetch("/api/posts?filter=community");
      if (!response.ok) throw new Error("Failed to fetch community posts");
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Community Stories</h1>
          <p className="text-muted-foreground">
            Join our community of horror storytellers. Share your tales of terror with fellow enthusiasts.
          </p>
        </div>
        <Button onClick={() => navigate("/submit-story")}>
          Share Your Story
        </Button>
      </div>

      {data?.posts && data.posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((post) => (
            <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-2 line-clamp-2">{post.title}</h2>
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/story/${post.slug}`)}
              >
                Read More
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No Stories Yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share your horror story with our community!
          </p>
          <Button onClick={() => navigate("/submit-story")}>
            Share Your Story
          </Button>
        </div>
      )}
    </div>
  );
}