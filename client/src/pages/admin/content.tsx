import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Post } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function AdminContentPage() {
  const { user } = useAuth();
  const { data: posts, isLoading } = useQuery<{ posts: Post[], hasMore: boolean }>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Content Management</h1>
      </div>

      <div className="grid gap-6">
        {posts?.posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{post.excerpt}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Status: {post.metadata && typeof post.metadata === 'object' && 'isSecret' in post.metadata && post.metadata.isSecret ? 'Secret' : 'Public'}
                </span>
                <span className="text-sm text-amber-500">
                  {post.metadata && typeof post.metadata === 'object' && 'isCommunityPost' in post.metadata && post.metadata.isCommunityPost ? 'Community Post' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}