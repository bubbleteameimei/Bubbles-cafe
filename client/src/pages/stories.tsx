import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useLocation } from "wouter";
import PostCard from "@/components/blog/post-card";
import Mist from "@/components/effects/mist";

export default function Stories() {
  const [, setLocation] = useLocation();

  const { data: posts = [], isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    networkMode: 'offlineFirst',
    refetchOnWindowFocus: false
  });

  if (isLoading || !posts || posts.length === 0) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-center p-8">Error loading stories. Please try again later.</div>;
  }

  return (
    <div className="relative min-h-screen bg-[url('/assets/IMG_4399.jpeg')] bg-cover bg-center bg-fixed before:content-[''] before:absolute before:inset-0 before:bg-background/90">
      <Mist className="opacity-40" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-serif font-bold mb-8 text-center">Story Index</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.1, 2) }}
              >
                <PostCard 
                  post={post} 
                  onClick={() => setLocation(`/schoop?index=${index}`)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}