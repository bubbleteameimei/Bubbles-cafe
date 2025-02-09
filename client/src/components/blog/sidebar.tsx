import { useQuery } from "@tanstack/react-query";
import { type Post, type Comment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiWordpress, SiX, SiInstagram } from "react-icons/si";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Sidebar() {
  const [, setLocation] = useLocation();

  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ["/api/posts/comments/recent"]
  });

  if (isLoadingPosts || isLoadingComments) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="transition-colors hover:bg-accent/5">
        <CardHeader>
          <CardTitle>Recent Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {posts?.slice(0, 5).map((post) => (
              <li key={post.id}>
                <button 
                  onClick={() => setLocation(`/stories/${post.slug}`)}
                  className="text-muted-foreground hover:text-primary transition-colors text-left w-full line-clamp-2"
                >
                  {post.title}
                </button>
              </li>
            ))}
            {!posts?.length && (
              <li className="text-muted-foreground">No stories available</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="transition-colors hover:bg-accent/5">
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {comments?.slice(0, 3).map((comment) => (
              <li key={comment.id} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{comment.author}</p>
                  <time className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), 'MMM d')}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{comment.content}</p>
              </li>
            ))}
            {!comments?.length && (
              <li className="text-muted-foreground text-sm">No comments yet</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="transition-colors hover:bg-accent/5">
        <CardHeader>
          <CardTitle>Follow Me</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 justify-center">
            <a
              href="https://bubbleteameimei.wordpress.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
            >
              <SiWordpress className="h-6 w-6" />
              <span className="sr-only">WordPress Blog</span>
            </a>
            <a
              href="https://twitter.com/Bubbleteameimei"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
            >
              <SiX className="h-6 w-6" />
              <span className="sr-only">Twitter/X Profile</span>
            </a>
            <a
              href="https://www.instagram.com/bubbleteameimei"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
            >
              <SiInstagram className="h-6 w-6" />
              <span className="sr-only">Instagram Profile</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}