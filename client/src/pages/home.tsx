import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import PostCard from "@/components/blog/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import Mist from "@/components/effects/mist";

export default function Home() {
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <Mist />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Bubble's Cafe</h1>
        <p className="text-xl text-muted-foreground">Thoughts and emotions made into art</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}