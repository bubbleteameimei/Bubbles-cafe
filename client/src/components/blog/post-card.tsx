import { motion } from "framer-motion";
import { type Post } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <a href={`/post/${post.slug}`}>
        <Card className="h-full hover:bg-accent">
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{post.excerpt}</p>
          </CardContent>
        </Card>
      </a>
    </motion.div>
  );
}
