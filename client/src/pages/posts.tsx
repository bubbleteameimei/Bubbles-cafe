import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { type Post } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/blog/post-card";

export default function Posts() {
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No posts available.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Latest Posts</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <div key={post.id}>
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}