
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CommentWithMarkdown } from './CommentWithMarkdown';

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  metadata: {
    upvotes?: number;
    downvotes?: number;
    author?: string;
  };
  parentId: number | null;
  replies?: Comment[];
}

interface ThreadedCommentsProps {
  comments: Comment[];
  postId: number;
  onSubmitComment: (content: string, parentId: number | null) => Promise<void>;
}

export function ThreadedComments({ comments, postId, onSubmitComment }: ThreadedCommentsProps) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  // Organize comments into a tree structure
  const buildCommentTree = (comments: Comment[]): Comment[] => {
    const commentMap: Record<number, Comment> = {};
    const rootComments: Comment[] = [];
    
    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });
    
    // Second pass: organize into tree structure
    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap[comment.parentId];
        if (parent && parent.replies) {
          parent.replies.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });
    
    return rootComments;
  };
  
  const commentTree = buildCommentTree(comments);
  
  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };
  
  const submitReply = async () => {
    if (replyContent.trim()) {
      await onSubmitComment(replyContent, replyingTo);
      setReplyContent('');
      setReplyingTo(null);
    }
  };
  
  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };
  
  const renderComments = (comments: Comment[], depth = 0) => {
    return comments.map(comment => (
      <div 
        key={comment.id} 
        style={{ marginLeft: `${depth * 20}px` }}
        className={`mb-4 ${depth > 0 ? 'pl-4 border-l border-gray-200 dark:border-gray-700' : ''}`}
      >
        <CommentWithMarkdown
          author={comment.metadata?.author || 'Anonymous'}
          content={comment.content}
          createdAt={comment.createdAt}
          upvotes={comment.metadata?.upvotes || 0}
          downvotes={comment.metadata?.downvotes || 0}
          onReply={() => handleReply(comment.id)}
          onUpvote={() => console.log('Upvote', comment.id)}
          onDownvote={() => console.log('Downvote', comment.id)}
          onReport={() => console.log('Report', comment.id)}
        />
        
        {replyingTo === comment.id && (
          <div className="ml-8 mt-2 mb-4">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="mb-2"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={submitReply}>Reply</Button>
              <Button size="sm" variant="outline" onClick={cancelReply}>Cancel</Button>
            </div>
          </div>
        )}
        
        {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, depth + 1)}
      </div>
    ));
  };
  
  return (
    <div className="comments-section space-y-4">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      {commentTree.length > 0 ? (
        renderComments(commentTree)
      ) : (
        <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}
