import { useQuery } from "@tanstack/react-query";
import { WordPressPost } from "@/lib/wordpress-api";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { extractHorrorExcerpt } from "@/lib/content-analysis";
import { sanitizeHtml } from "@/lib/sanitize";
import { Skeleton } from "@/components/ui/skeleton";

// Local memoized wrapper to avoid recomputing horror excerpt for identical content
const __horrorExcerptMemo = new Map<string, string>();
const extractHorrorExcerptMemo = (content: string, maxLength: number = 250): string => {
  try {
    const key = `${maxLength}::${content}`;
    const cached = __horrorExcerptMemo.get(key);
    if (typeof cached === 'string') return cached;
    const result = extractHorrorExcerpt(content, maxLength);
    __horrorExcerptMemo.set(key, result);
    if (__horrorExcerptMemo.size > 256) {
      const firstKey = __horrorExcerptMemo.keys().next().value as string | undefined;
      if (typeof firstKey === 'string') __horrorExcerptMemo.delete(firstKey);
    }
    return result;
  } catch {
    return extractHorrorExcerpt(content, maxLength);
  }
};

function Post() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['/api/posts/slug', slug],
    queryFn: async () => {
      const res = await fetch(`/api/posts/slug/${slug}`);
      if (!res.ok) throw new Error(`Failed to fetch post (${res.status})`);
      const p = await res.json();
      const adapted: WordPressPost = {
        id: p.id,
        date: p.createdAt,
        slug: p.slug,
        title: { rendered: p.title },
        content: { rendered: p.content },
        excerpt: { rendered: p.excerpt || (p.content ? String(p.content).slice(0, 150) + '…' : '') },
      } as any;
      return adapted;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-5 w-10/12" />
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading post: {error.message}</div>;
  }

  if (!post) {
    return <div className="text-center">Post not found</div>;
  }

  // Extract the horror excerpt
  const excerpt = extractHorrorExcerptMemo(post.content.rendered);

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 
          className="text-3xl font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.title.rendered) }}
        />
        <p className="mb-4 text-muted-foreground italic">
          "{excerpt}"
        </p>
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content.rendered) }}
        />
      </Card>
    </div>
  );
}

export default Post;