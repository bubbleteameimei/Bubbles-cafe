import { useQuery } from "@tanstack/react-query";
import { type Post, type Comment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiWordpress, SiX, SiInstagram } from "react-icons/si";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { HamburgerMenu } from "@/components/ui/hamburger-menu";

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
}

export default function Sidebar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const socialLinks = {
    wordpress: "https://bubbleteameimei.wordpress.com",
    twitter: "https://x.com/Bubbleteameimei",
    instagram: "https://www.instagram.com/bubbleteameimei/"
  };

  const handleSocialClick = (url: string, platform: string) => {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(`Failed to open ${platform} link:`, error);
      toast({
        title: "Error",
        description: `Unable to open ${platform}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const { data: postsData, isLoading: isLoadingPosts } = useQuery<PostsResponse>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/posts?page=1&limit=5');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        return {
          posts: Array.isArray(data.posts) ? data.posts : [],
          hasMore: !!data.hasMore
        };
      } catch (error) {
        console.error('Error fetching posts:', error);
        return { posts: [], hasMore: false };
      }
    },
    staleTime: 5 * 60 * 1000
  });

  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ["/api/comments/recent"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/comments/recent');
        if (!response.ok) throw new Error('Failed to fetch comments');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
    }
  });

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
      </div>
    );
  }

  const posts = postsData?.posts || [];

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Navigation</h2>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          <HamburgerMenu isOpen={isOpen} />
        </button>
      </div>

      <Card className="transition-colors hover:bg-accent/5">
        <CardHeader>
          <CardTitle>Recent Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.ul className="space-y-3" variants={containerVariants}>
            {Array.isArray(posts) && posts.map((post) => (
              <motion.li key={post.id} variants={itemVariants}>
                <button 
                  onClick={() => setLocation(`/story/${post.slug || post.id}`)}
                  className="text-muted-foreground hover:text-primary transition-colors text-left w-full line-clamp-2 hover:underline"
                >
                  {post.title}
                </button>
              </motion.li>
            ))}
            {(!Array.isArray(posts) || posts.length === 0) && (
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
            {Array.isArray(comments) && comments.slice(0, 3).map((comment) => (
              <motion.li 
                key={comment.id} 
                variants={itemVariants}
                className="border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">Anonymous</p>
                  <time className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), 'MMM d')}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {comment.content}
                </p>
              </motion.li>
            ))}
            {(!Array.isArray(comments) || comments.length === 0) && (
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
            <button
              onClick={() => handleSocialClick(socialLinks.wordpress, "WordPress")}
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
              aria-label="Visit WordPress Blog"
            >
              <SiWordpress className="h-6 w-6" />
            </button>
            <button
              onClick={() => handleSocialClick(socialLinks.twitter, "Twitter")}
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
              aria-label="Visit Twitter/X Profile"
            >
              <SiX className="h-6 w-6" />
            </button>
            <button
              onClick={() => handleSocialClick(socialLinks.instagram, "Instagram")}
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110"
              aria-label="Visit Instagram Profile"
            >
              <SiInstagram className="h-6 w-6" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

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