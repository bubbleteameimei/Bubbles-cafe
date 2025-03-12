import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";


interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
}

export default function CommunityPage() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<PostsResponse>({
    queryKey: ["/api/posts/community"],
    queryFn: async () => {
      return apiRequest<PostsResponse>("GET", "/api/posts/community");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  const posts = data?.posts || [];

  return (
    <div className="relative min-h-screen">
      <motion.div 
        className="container relative z-10 max-w-7xl mx-auto py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center mb-12">
          <h1 className="stories-page-title mb-4 text-4xl font-bold text-center">Community Stories</h1>
          <p className="text-muted-foreground text-center mb-6">
            Got a story you'd like to share? We'd love to read it
          </p>
          <Button onClick={() => navigate("/submit-story")}>
            Share Your Story
          </Button>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                <h2 className="story-title mb-2 text-2xl font-bold line-clamp-2">{post.title}</h2>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/story/${post.slug}`)}
                >
                  Read More
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Stories Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your story with our community!
            </p>
            <Button onClick={() => navigate("/submit-story")}>
              Share Your Story
            </Button>
          </div>
        )}

        {/* Community Guidelines Section */}
        <div className="mt-16 prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Community Guidelines</h2>
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold">Our Community Values</h3>
              <p>Our horror story community strives to be a welcoming space for writers and readers to share and enjoy creepy content. We believe in fostering creativity while maintaining respect for all members.</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Content Standards</h3>
              <p>While we embrace horror and the macabre, we have guidelines about what content is appropriate:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Clearly label mature content (gore, extreme violence, etc.)</li>
                <li>No glorification of real-world tragedies or criminals</li>
                <li>No explicit sexual content involving minors</li>
                <li>No hate speech or content that targets specific groups</li>
                <li>No doxxing or sharing others' personal information</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Interaction Guidelines</h3>
              <p>When interacting with other community members:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide constructive feedback, not destructive criticism</li>
                <li>Respect different writing styles and horror preferences</li>
                <li>Don't harass or bully other members</li>
                <li>Report inappropriate content instead of engaging with it</li>
                <li>Be mindful that behind every story is a real person</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Plagiarism Policy</h3>
              <p>We take intellectual property seriously:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Only post original content you created or have permission to share</li>
                <li>Give proper credit when building upon others' ideas</li>
                <li>Report suspected plagiarism to moderators</li>
              </ul>
              <p>Violations of our plagiarism policy may result in content removal and account restrictions.</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">Moderation</h3>
              <p>Our moderation team works to ensure these guidelines are followed. Actions they may take include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Content removal</li>
                <li>Warnings</li>
                <li>Temporary restrictions</li>
                <li>Permanent bans for serious or repeated violations</li>
              </ul>
              <p>If you believe a moderation action was taken in error, you can appeal through our contact form.</p>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}