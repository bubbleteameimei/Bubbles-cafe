
import { DiscussionEmbed } from 'disqus-react';

interface CommentSectionProps {
  postId: number;
  title?: string;
}

export default function CommentSection({ postId, title }: CommentSectionProps) {
  const disqusConfig = {
    url: `${window.location.origin}/reader?story=${postId}`,
    identifier: `story-${postId}`,
    title: title || `Story ${postId}`,
    language: 'en'
  };

  return (
    <div className="mt-12 border-t border-border/50 pt-8">
      <h2 className="text-2xl font-bold mb-6">Join the Discussion</h2>
      <div className="mt-8 bg-background/50 p-6 rounded-lg border border-border/50">
        <DiscussionEmbed
          shortname="bubblescafe"
          config={disqusConfig}
        />
      </div>
    </div>
  );
}
