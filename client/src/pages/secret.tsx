import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import PostCard from "@/components/blog/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Secret() {
  const { toast } = useToast();
  const [secretKey, setSecretKey] = useState("");
  const [unlockedPosts, setUnlockedPosts] = useState<Set<number>>(new Set());

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/secret"]
  });

  const tryUnlockPost = (post: Post) => {
    if (post.secretKey === secretKey) {
      setUnlockedPosts(prev => new Set([...prev, post.id]));
      toast({
        title: "Secret Story Unlocked!",
        description: "You've discovered a hidden tale..."
      });
    } else {
      toast({
        title: "Incorrect Key",
        description: post.secretHint || "This story remains locked in shadow...",
        variant: "destructive"
      });
    }
    setSecretKey("");
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent to-background opacity-50" />

      <div className="relative z-10">
        <motion.h1 
          className="text-4xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Hidden Stories
        </motion.h1>

        <motion.p 
          className="text-muted-foreground text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Some tales are meant to be discovered...
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {posts?.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {!unlockedPosts.has(post.id) ? (
                  <div className="backdrop-blur-sm bg-black/30 p-6 rounded-lg border border-primary/20">
                    <h3 className="text-2xl font-bold mb-4">{post.title}</h3>
                    <p className="text-muted-foreground mb-4">{post.secretHint || "This story is shrouded in mystery..."}</p>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Enter the key"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="bg-background/50"
                      />
                      <Button onClick={() => tryUnlockPost(post)}>Unlock</Button>
                    </div>
                  </div>
                ) : (
                  <PostCard post={post} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}