import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "@/lib/wordpress-api";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";

// Function to extract the most impactful horror line
function extractHorrorExcerpt(content: string): string {
  // Split content into paragraphs
  const paragraphs = content
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .split(/\n+/)
    .filter(p => p.trim().length > 0);

  // Keywords that might indicate horror/intense content
  const horrorKeywords = [
    'blood', 'scream', 'death', 'dark', 'fear', 'horror', 'terror', 'shadow',
    'nightmare', 'monster', 'demon', 'ghost', 'kill', 'dead', 'evil', 'haunted',
    'sinister', 'terrifying', 'horrific', 'dread'
  ];

  // Score each paragraph based on horror keywords
  const scoredParagraphs = paragraphs.map(paragraph => {
    let score = 0;
    horrorKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = (paragraph.match(regex) || []).length;
      score += matches;
    });
    return { text: paragraph, score };
  });

  // Sort by score and get the highest scoring paragraph
  scoredParagraphs.sort((a, b) => b.score - a.score);

  // If no horror content found, return first paragraph
  if (scoredParagraphs[0].score === 0) {
    return scoredParagraphs[0].text.slice(0, 200) + '...';
  }

  // Return the most horror-intensive paragraph
  const excerpt = scoredParagraphs[0].text;
  return excerpt.length > 200 ? excerpt.slice(0, 200) + '...' : excerpt;
}

function Post() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['/api/wordpress/posts', slug],
    queryFn: () => fetchPost(slug),
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading post: {error.message}</div>;
  }

  if (!post) {
    return <div className="text-center">Post not found</div>;
  }

  // Extract the horror excerpt
  const excerpt = extractHorrorExcerpt(post.content.rendered);

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 
          className="text-3xl font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <p className="mb-4 text-muted-foreground italic">
          "{excerpt}"
        </p>
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </Card>
    </div>
  );
}

export default Post;