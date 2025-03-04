import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "@/lib/wordpress-api";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";

function Post() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['/api/wordpress/posts', slug],
    queryFn: () => fetchPost(slug),
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading post: {error.message}</div>;
  }

  if (!post) {
    return <div className="text-center">Post not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 
          className="text-3xl font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </Card>
    </div>
  );
}

export default Post;