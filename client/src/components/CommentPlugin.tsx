
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card } from './ui/card';
import { MessageSquare } from 'lucide-react';
import CommentWithMarkdown from './CommentWithMarkdown';

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  replies?: Comment[];
}

interface CommentPluginProps {
  postId: number;
  initialComments?: Comment[];
  onSubmitComment?: (text: string, postId: number) => Promise<void>;
}

const CommentPlugin: React.FC<CommentPluginProps> = ({
  postId,
  initialComments = [],
  onSubmitComment,
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      if (onSubmitComment) {
        await onSubmitComment(commentText, postId);
      }
      
      // Add the new comment locally
      const newComment: Comment = {
        id: Date.now().toString(),
        content: commentText,
        author: 'You',
        createdAt: new Date(),
      };
      
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="comment-plugin mt-8 space-y-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comments ({comments.length})
      </h3>
      
      <div className="comment-form space-y-4">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write your comment here... (Markdown supported)"
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitComment} 
            disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </div>
      </div>
      
      <div className="comments-list space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{comment.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {comment.createdAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <CommentWithMarkdown content={comment.content} />
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentPlugin;
