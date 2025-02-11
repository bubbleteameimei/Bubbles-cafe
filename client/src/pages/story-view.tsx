import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from "date-fns";
import CommentSection from "@/components/blog/comment-section";

interface StoryViewProps {
  slug: string;
}

export default function StoryView({ slug }: StoryViewProps) {
  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ["/api/posts", slug],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !post) {
    return <div>Story not found or error loading story.</div>;
  }

  return (
    <div>
      <article>
        <h1>{post.title}</h1>
        <time>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</time>
        <div>
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>
              {paragraph.trim().split('_').map((text, i) =>
                i % 2 === 0 ? text : <i key={i}>{text}</i>
              )}
            </p>
          ))}
        </div>
        <div>
          <CommentSection postId={post.id} />
        </div>
      </article>
    </div>
  );
}