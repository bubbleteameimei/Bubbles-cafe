import { useQuery } from "@tanstack/react-query";
import { type Post, type Comment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiWordpress, SiX, SiInstagram } from "react-icons/si";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Sidebar() {
  const [, setLocation] = useLocation();

  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });

  const { data: comments, isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ["/api/posts/comments/recent"]
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoadingPosts || isLoadingComments) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="transition-colors hover:bg-accent/5">
        <CardHeader>
          <CardTitle>Recent Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.ul className="space-y-3" variants={containerVariants}>
            {posts?.slice(0, 5).map((post) => (
              <motion.li key={post.id} variants={itemVariants}>
                <button 
                  onClick={() => setLocation(`/stories/${post.slug}`)}
                  className="text-muted-foreground hover:text-primary transition-colors text-left w-full line-clamp-2 hover:underline"
                >
                  {post.title}
                </button>
              </motion.li>
            ))}
            {!posts?.length && (
              <motion.li variants={itemVariants} className="text-muted-foreground">
                No stories available
              </motion.li>
            )}
          </motion.ul>
        </CardContent>
      </Card>

      <Card className="transition-colors hover:bg-accent/5">
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.ul className="space-y-4" variants={containerVariants}>
            {comments?.slice(0, 3).map((comment) => (
              <motion.li 
                key={comment.id} 
                variants={itemVariants}
                className="border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{comment.author}</p>
                  <time className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), 'MMM d')}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {comment.content}
                </p>
              </motion.li>
            ))}
            {!comments?.length && (
              <motion.li 
                variants={itemVariants}
                className="text-muted-foreground text-sm"
              >
                No comments yet
              </motion.li>
            )}
          </motion.ul>
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
              aria-label="Visit WordPress Blog"
            >
              <SiWordpress className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com/Bubbleteameimei"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
              aria-label="Visit Twitter/X Profile"
            >
              <SiX className="h-6 w-6" />
            </a>
            <a
              href="https://www.instagram.com/bubbleteameimei"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
              aria-label="Visit Instagram Profile"
            >
              <SiInstagram className="h-6 w-6" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}