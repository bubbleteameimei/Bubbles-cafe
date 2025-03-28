import { useQuery } from "@tanstack/react-query";
import { fetchWordPressPostBySlug } from "@/lib/wordpress-api";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { extractHorrorExcerpt } from "@/lib/content-analysis";

function Post() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['/api/wordpress/posts', slug],
    queryFn: () => fetchWordPressPostBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
  const excerpt = extractHorrorExcerpt(post.content.rendered);

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 
          className="text-3xl font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <p className="mb-4 text-muted-foreground italic">
          "{excerpt}"
        </p>
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </Card>
    </div>
  );
}

export default Post;