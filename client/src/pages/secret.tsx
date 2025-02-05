import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import PostCard from "@/components/blog/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import Mist from "@/components/effects/mist";

export default function Secret() {
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/secret"]
  });

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="relative">
      <Mist />
      <h1 className="text-4xl font-bold mb-8">Secret Stories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
