
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ThumbsUp, ThumbsDown, Reply, Flag } from 'lucide-react';

interface CommentProps {
  author: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  onReply: () => void;
  onUpvote: () => void;
  onDownvote: () => void;
  onReport: () => void;
}

export function CommentWithMarkdown({
  author,
  content,
  createdAt,
  upvotes,
  downvotes,
  onReply,
  onUpvote,
  onDownvote,
  onReport
}: CommentProps) {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarFallback>{author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="text-sm font-semibold">{author}</h4>
              <span className="text-xs text-muted-foreground">
                {new Date(createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="comment-content mt-2 text-sm">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                className="prose prose-sm dark:prose-invert max-w-none"
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-2">
        <div className="flex justify-between w-full">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={onUpvote} className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span className="text-xs">{upvotes}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onDownvote} className="flex items-center">
              <ThumbsDown className="h-4 w-4 mr-1" />
              <span className="text-xs">{downvotes}</span>
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={onReply} className="flex items-center">
              <Reply className="h-4 w-4 mr-1" />
              <span className="text-xs">Reply</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onReport} className="flex items-center">
              <Flag className="h-4 w-4 mr-1" />
              <span className="text-xs">Report</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
