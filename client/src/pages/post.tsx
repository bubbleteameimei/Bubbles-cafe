import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Post } from "@shared/schema";
import CommentSection from "@/components/blog/comment-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { LikeDislike } from "@/components/blog/like-dislike";
import Mist from "@/components/effects/mist";

interface ReadingProgress {
  progress: number;
}

export default function PostPage() {
  const [, params] = useRoute("/post/:slug");
  const slug = params?.slug;

  const { data: post, isLoading: isPostLoading } = useQuery<Post>({
    queryKey: ["/api/posts", slug],
    enabled: !!slug
  });

  const { data: progress = { progress: 0 } } = useQuery<ReadingProgress>({
    queryKey: ["/api/posts/progress", post?.id],
    enabled: !!post?.id
  });

  const { mutate: updateProgress } = useMutation({
    mutationFn: async (newProgress: number) => {
      if (!post?.id) return;
      await fetch(`/api/posts/${post.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, progress: newProgress })
      });
    }
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercent = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    if (scrollPercent > progress.progress) {
      updateProgress(Math.round(scrollPercent));
    }
  };

  if (isPostLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  if (!post || !slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">Post not found</p>
      </div>
    );
  }

  const renderContent = () => {
    if (!post.content) return <p>No content available.</p>;

    const paragraphs = post.content.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return null;

      const segments = paragraph.trim().split('_');
      return (
        <p key={index} className="mb-6">
          {segments.map((text, i) => 
            i % 2 === 0 ? text : <em key={i}>{text}</em>
          )}
        </p>
      );
    });
  };

  return (
    <div className="relative">
      <Mist />
      <div className="fixed top-0 left-0 right-0 h-1 bg-secondary/50 z-50">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress.progress}%` }} 
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/posts">Posts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/post/${post.slug}`}>{post.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <article 
          className="prose dark:prose-invert mx-auto mt-8 max-h-[calc(100vh-16rem)] overflow-y-auto px-4"
          onScroll={handleScroll}
        >
          <h1 className="mb-8">{post.title}</h1>
          <div className="story-content">
            {renderContent()}
          </div>
        </article>

        <div className="mt-8">
          <LikeDislike 
            postId={post.id}
            initialLikes={post.likes || 0}
            initialDislikes={post.dislikes || 0}
          />
        </div>

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}