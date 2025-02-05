import { useQuery } from "@tanstack/react-query";
import { type Post, type Comment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiWordpress, SiX, SiInstagram } from "react-icons/si";

export default function Sidebar() {
  const { data: posts } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/posts/comments/recent"]
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {posts?.slice(0, 5).map((post) => (
              <li key={post.id}>
                <a 
                  href={`/post/${post.slug}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {post.title}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {comments?.slice(0, 3).map((comment) => (
              <li key={comment.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
                <p className="font-semibold">{comment.author}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{comment.content}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Follow Me</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <a
              href="https://bubbleteameimei.wordpress.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiWordpress className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com/Bubbleteameimei"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiX className="h-6 w-6" />
            </a>
            <a
              href="https://www.instagram.com/bubbleteameimei"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiInstagram className="h-6 w-6" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}