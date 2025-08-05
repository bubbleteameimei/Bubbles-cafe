import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Eye, Heart, MessageCircle, Share2, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Define Post type locally since it's not exported from shared schema
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
  commentsCount?: number;
}

interface PostViewProps {
  post: Post;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  showFullContent?: boolean;
  isLoading?: boolean;
}

export default function PostView({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  showFullContent = false, 
  isLoading = false 
}: PostViewProps) {
  const [isExpanded, setIsExpanded] = useState(showFullContent);
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);

  // Content warning detection
  useEffect(() => {
    const warnings: string[] = [];
    const content = post.content.toLowerCase();
    
    const warningKeywords = [
      { keyword: 'blood', warning: 'Contains graphic violence' },
      { keyword: 'death', warning: 'Contains themes of death' },
      { keyword: 'horror', warning: 'Contains horror elements' },
      { keyword: 'nightmare', warning: 'Contains disturbing imagery' }
    ];

    warningKeywords.forEach(({ keyword, warning }) => {
      if (content.includes(keyword) && !warnings.includes(warning)) {
        warnings.push(warning);
      }
    });

    setContentWarnings(warnings);
  }, [post.content]);

  // Display content warnings if present
  const renderContentWarnings = () => {
    if (contentWarnings.length === 0) return null;

    return (
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-600 dark:text-yellow-400 font-medium">⚠️ Content Warning</span>
        </div>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          {contentWarnings.map((warning: string, index: number) => (
            <li key={index}>• {warning}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h1 className="story-title mb-4">{post.title}</h1>
      <div className="flex items-center gap-2 mb-4 mt-2">
        <time className="text-sm text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
        <span className="text-primary/50">•</span>
        <span className="read-time flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {/* Assuming getReadingTime is available or will be added */}
          {/* {readingTime} */}
        </span>
      </div>
      <div className="prose dark:prose-invert max-w-none italic-text">
        {post.content}
      </div>
      {post.triggerWarnings && post.triggerWarnings.length > 0 && (
        <div className="mt-6 p-4 bg-destructive/20 rounded-lg horror-glow">
          <h3 className="text-sm font-semibold mb-2">Content Warnings</h3>
          <ul className="list-disc list-inside">
            {post.triggerWarnings.map((warning, index) => (
              <li key={index} className="text-sm">{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};