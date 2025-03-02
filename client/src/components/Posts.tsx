import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/lib/wordpress-api";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";

function Posts() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/wordpress/posts', page],
    queryFn: () => fetchPosts(page),
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading posts: {error.message}</div>;
  }

  const { posts, hasMore } = data!;

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <h2 className="text-xl font-bold mb-2">
              <Link href={`/post/${post.slug}`}>
                <a dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              </Link>
            </h2>
            <div 
              className="text-sm text-gray-600 mb-4"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />
            <Link href={`/post/${post.slug}`}>
              <Button variant="outline">Read more</Button>
            </Link>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <Button onClick={() => setPage(p => p + 1)}>
            Load more posts
          </Button>
        </div>
      )}
    </div>
  );
}

export default Posts;