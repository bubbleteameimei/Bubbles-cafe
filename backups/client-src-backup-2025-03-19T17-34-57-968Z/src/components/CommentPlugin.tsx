
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card } from './ui/card';
import { MessageSquare, ThumbsUp, ThumbsDown, Reply } from 'lucide-react';
import CommentWithMarkdown from './CommentWithMarkdown';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  votes?: {
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down' | null;
  };
  replies?: Comment[];
}

interface CommentPluginProps {
  postId: number;
  initialComments?: Comment[];
  onSubmitComment?: (text: string, postId: number) => Promise<void>;
  onVoteComment?: (commentId: string, isUpvote: boolean) => Promise<void>;
}

const CommentPlugin: React.FC<CommentPluginProps> = ({
  postId,
  initialComments = [],
  onSubmitComment,
  onVoteComment,
}) => {
  const [comments, setComments] = useState<Comment[]>(
    initialComments.map(comment => ({
      ...comment,
      votes: comment.votes || { upvotes: 0, downvotes: 0, userVote: null }
    }))
  );
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

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
        votes: { upvotes: 0, downvotes: 0, userVote: null }
      };
      
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, isUpvote: boolean) => {
    // Find the comment
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;
    
    const comment = comments[commentIndex];
    const votes = comment.votes || { upvotes: 0, downvotes: 0, userVote: null };
    
    // Determine the new vote state
    let newUserVote: 'up' | 'down' | null = isUpvote ? 'up' : 'down';
    
    // If user is clicking the same vote button again, remove their vote
    if (votes.userVote === newUserVote) {
      newUserVote = null;
    }
    
    // Calculate new vote counts
    const newVotes = {
      upvotes: votes.upvotes + (newUserVote === 'up' ? 1 : 0) - (votes.userVote === 'up' ? 1 : 0),
      downvotes: votes.downvotes + (newUserVote === 'down' ? 1 : 0) - (votes.userVote === 'down' ? 1 : 0),
      userVote: newUserVote
    };
    
    // Update the comment in our local state
    const updatedComments = [...comments];
    updatedComments[commentIndex] = {
      ...comment,
      votes: newVotes
    };
    
    setComments(updatedComments);
    
    // Call the external handler if provided
    if (onVoteComment) {
      try {
        await onVoteComment(commentId, isUpvote);
      } catch (error) {
        console.error('Failed to register vote:', error);
        // Revert to previous state on error
        setComments(comments);
      }
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyText('');
  };

  const submitReply = (parentId: string) => {
    if (!replyText.trim()) return;
    
    // Find the parent comment
    const commentIndex = comments.findIndex(c => c.id === parentId);
    if (commentIndex === -1) return;
    
    const comment = comments[commentIndex];
    
    // Create the new reply
    const newReply: Comment = {
      id: Date.now().toString(),
      content: replyText,
      author: 'You',
      createdAt: new Date(),
      votes: { upvotes: 0, downvotes: 0, userVote: null }
    };
    
    // Add the reply to the parent comment
    const updatedComment = {
      ...comment,
      replies: [...(comment.replies || []), newReply]
    };
    
    // Update our state
    const updatedComments = [...comments];
    updatedComments[commentIndex] = updatedComment;
    
    setComments(updatedComments);
    setReplyingTo(null);
    setReplyText('');
  };
  
  const renderComment = (comment: Comment, isReply = false) => (
    <Card key={comment.id} className={`p-4 ${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{comment.author}</p>
              <p className="text-sm text-muted-foreground">
                {comment.createdAt instanceof Date 
                  ? comment.createdAt.toLocaleString() 
                  : new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <CommentWithMarkdown content={comment.content} />
          </div>
          <div className="mt-3 flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => handleVote(comment.id, true)}
                    className={`flex items-center gap-1 text-sm ${comment.votes?.userVote === 'up' ? 'text-green-600' : 'text-muted-foreground hover:text-green-500'}`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{comment.votes?.upvotes || 0}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Upvote</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => handleVote(comment.id, false)}
                    className={`flex items-center gap-1 text-sm ${comment.votes?.userVote === 'down' ? 'text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{comment.votes?.downvotes || 0}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Downvote</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => handleReply(comment.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-500"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Reply to this comment</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                className="min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => submitReply(comment.id)}>
                  Submit Reply
                </Button>
              </div>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
  
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
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentPlugin;
