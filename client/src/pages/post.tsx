import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Post } from "@shared/schema";
import CommentSection from "@/components/blog/comment-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import Mist from "@/components/effects/mist";

export default function PostPage() {
  const [, params] = useRoute("/post/:slug");
  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["/api/posts", params?.slug],
    enabled: !!params?.slug
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  const { data: progress } = useQuery({
    queryKey: ["/api/posts/progress", post?.id],
    enabled: !!post?.id
  });

  const updateProgress = useMutation({
    mutationFn: async (progress: number) => {
      await fetch(`/api/posts/${post?.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post?.id, progress })
      });
    }
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercent = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    if (scrollPercent > (progress?.progress || 0)) {
      updateProgress.mutate(Math.round(scrollPercent));
    }
  };

  return (
    <div className="relative">
      <Mist />
      <div className="fixed top-0 left-0 right-0 h-1 bg-secondary z-50">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress?.progress || 0}%` }} 
        />
      </div>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/post/${post.slug}`}>{post.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <article className="prose prose-invert mx-auto mt-8" onScroll={handleScroll}>
        <h1>{post.title}</h1>
        <div className="whitespace-pre-wrap">{post.content}</div>
      </article>

      <CommentSection postId={post.id} />
    </div>
  );
}