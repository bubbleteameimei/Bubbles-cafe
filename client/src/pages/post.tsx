import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Post } from "@shared/schema";
import CommentSection from "@/components/blog/comment-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { LikeDislike } from "@/components/blog/like-dislike";
import Mist from "@/components/effects/mist";
import { useMemo, useRef, useCallback, memo } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface ReadingProgress {
  progress: number;
}

const PostContent = memo(({ content }: { content: string | undefined }) => {
  const renderedContent = useMemo(() => {
    if (!content?.trim()) {
      return <p className="text-muted-foreground">No content available.</p>;
    }

    return content.split('\n\n').map((paragraph, index) => {
      if (!paragraph.trim()) return null;

      const segments = paragraph.trim().split('_');
      return (
        <p key={index} className="mb-6">
          {segments.map((text, i) => 
            i % 2 === 0 ? text : <i key={i}>{text}</i>
          )}
        </p>
      );
    }).filter(Boolean);
  }, [content]);

  return <div className="story-content">{renderedContent}</div>;
});

PostContent.displayName = "PostContent";

const LoadingPost = memo(() => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <svg
      className="loading-skull"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 4.411 2.865 8.138 6.837 9.439.5.092.683-.217.683-.481 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.071 1.532 1.03 1.532 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.349-1.086.635-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.481C19.137 20.138 22 16.411 22 12c0-5.523-4.477-10-10-10"
        fill="currentColor"
      />
    </svg>
    <p className="text-lg text-muted-foreground animate-pulse">
      Summoning dark tales...
    </p>
  </div>
));

LoadingPost.displayName = "LoadingPost";

const PostHeader = memo(({ title }: { title: string }) => (
  <Breadcrumb>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbLink href="/posts">Posts</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbLink>{title}</BreadcrumbLink>
    </BreadcrumbItem>
  </Breadcrumb>
));

PostHeader.displayName = "PostHeader";

export default function PostPage() {
  const [, params] = useRoute("/post/:slug");
  const slug = params?.slug;
  const throttleTimeout = useRef<NodeJS.Timeout>();

  const { data: post, isLoading: isPostLoading } = useQuery<Post>({
    queryKey: ["/api/posts", slug],
    enabled: !!slug
  });

  const { data: progress = { progress: 0 } } = useQuery<ReadingProgress>({
    queryKey: ["/api/posts", post?.id, "progress"],
    enabled: !!post?.id
  });

  const progressMutation = useMutation({
    mutationFn: async (newProgress: number) => {
      if (!post?.id) return;
      await fetch(`/api/posts/${post.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, progress: newProgress })
      });
    }
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!post?.id) return;

    if (throttleTimeout.current) {
      clearTimeout(throttleTimeout.current);
    }

    throttleTimeout.current = setTimeout(() => {
      const element = e.currentTarget;
      const scrollPercent = Math.floor((element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100);

      if (scrollPercent > progress.progress) {
        const throttledProgress = Math.floor(scrollPercent / 5) * 5;
        if (throttledProgress > progress.progress) {
          progressMutation.mutate(throttledProgress);
        }
      }
    }, 200); // Throttle to 200ms
  }, [post?.id, progress.progress, progressMutation]);

  if (isPostLoading || !slug) {
    return <LoadingPost />;
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">Post not found</p>
      </div>
    );
  }

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
        <PostHeader title={post.title} />

        <article 
          className="prose dark:prose-invert mx-auto mt-8 max-h-[calc(100vh-16rem)] overflow-y-auto px-4"
          onScroll={handleScroll}
        >
          <h1 className="mb-8">{post.title}</h1>
          <ErrorBoundary>
            <PostContent content={post.content} />
          </ErrorBoundary>
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