import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Eye, Heart } from 'lucide-react';
import { sanitizeHtmlContent } from '@/utils/wordpressConverter';

// Define Post type locally
interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  authorId: number;
  createdAt: Date;
  updatedAt?: Date;
  isSecret: boolean;
  slug?: string;
  tags?: string[];
  themeCategory?: string;
  wordCount?: number;
  readingTime?: number;
  views?: number;
  likes?: number;
}

interface StoryViewProps {
  post: Post;
  author?: {
    id: number;
    username: string;
    avatar?: string;
  };
  showFullContent?: boolean;
}

const StoryView: React.FC<StoryViewProps> = ({ post, author, showFullContent = false }) => {
  return (
    <Card className="story-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="story-title">{post.title}</CardTitle>
          {post.themeCategory && (
            <Badge variant="secondary" className="theme-badge">
              {post.themeCategory}
            </Badge>
          )}
        </div>
        
        <div className="story-meta flex items-center gap-2 text-sm text-muted-foreground">
          {author && (
            <>
              <span>by {author.username}</span>
              <span>•</span>
            </>
          )}
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          {post.readingTime && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTime} min read
              </span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="story-content prose dark:prose-invert max-w-none">
          {showFullContent ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(post.content) }} />
          ) : (
            <p>{post.excerpt || post.content.substring(0, 200) + '...'}</p>
          )}
        </div>
        
        <div className="story-stats flex items-center gap-4 mt-4 pt-4 border-t">
          {post.views && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {post.views}
            </span>
          )}
          {post.likes && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              {post.likes}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryView;