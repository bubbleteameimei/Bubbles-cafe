import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  MessageSquare, 
  Reply, 
  ThumbsUp,
  Calendar,
  MessageCircle,
  SendHorizontal,
  AlertCircle,
  Check,
  ShieldAlert,
  Flag,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Interfaces
interface CommentMetadata {
  author: string;
  upvotes: number;
  isAnonymous: boolean;
  moderated: boolean;
  originalContent: string;
  replyCount: number;
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  metadata: CommentMetadata;
  // Support both field names during API transition
  approved?: boolean;
  is_approved?: boolean;
  parentId: number | null;
}

interface CommentSectionProps {
  postId: number;
  title?: string;
}

interface ReplyFormProps {
  commentId: number;
  postId: number;
  onCancel: () => void;
  authorToMention?: string;
}

// Enhanced moderation check with immediate flagging
const checkModeration = (text: string): { isFlagged: boolean, moderated: string, isUnderReview: boolean } => {
  if (!text) return { isFlagged: false, moderated: "", isUnderReview: false };
  
  // List of words/patterns that trigger moderation
  const flaggedPatterns = [
    /\b(hate|stupid|idiot|dumb|moron)\b/gi,
    /\b(sh[i*]t|f[u*]ck|a[s*][s*]|b[i*]tch)\b/gi,
    /\b(damn|hell|crap)\b/gi
  ];
  
  // Words that trigger review
  const reviewPatterns = [
    /\b(kill|violent|disgusting|vile|appalling|nasty|horrible|garbage|sucks|pathetic)\b/gi,
    /\b(scam|fraud|fake|lying|spam|trash|worst|terrible|lazy|awful)\b/gi,
    /\b(useless|worthless|waste|ugly|offensive|sexist|racist|bigot)\b/gi
  ];
  
  let moderated = text;
  let isFlagged = false;
  let isUnderReview = false;
  
  // Check for immediate moderation patterns
  flaggedPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      isFlagged = true;
      moderated = moderated.replace(pattern, match => '*'.repeat(match.length));
    }
  });
  
  // Check for patterns that require review
  if (!isFlagged) {
    reviewPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        isUnderReview = true;
      }
    });
  }
  
  return { isFlagged, moderated, isUnderReview };
};

// Simple reply form component
function ReplyForm({ commentId, postId, onCancel, authorToMention }: ReplyFormProps) {
  const [content, setContent] = useState(authorToMention ? `@${authorToMention} ` : "");
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get authentication state
  const { user, isAuthenticated } = useAuth();
  
  // Apply moderation check with review flag
  const { isFlagged, moderated, isUnderReview } = checkModeration(content);

  // Focus the textarea when the form appears and position cursor at the end
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      
      // Position cursor at the end of the text
      const length = textareaRef.current.value.length;
      textareaRef.current.selectionStart = length;
      textareaRef.current.selectionEnd = length;
    }
  }, []);

  const replyMutation = useMutation({
    mutationFn: async () => {
      // Use authenticated user's username if available, otherwise use "Anonymous"
      const replyAuthor = isAuthenticated && user ? user.username : "Anonymous";
      
      // Get CSRF token from cookie
      const cookies = document.cookie.split('; ');
      const csrfCookie = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';
      
      // Using the endpoint that matches server routes for replies
      const response = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include", // Important for CSRF token
        body: JSON.stringify({
          content: content.trim(),
          author: replyAuthor,
          userId: user?.id || null,
          commentId: commentId,
          metadata: {
            author: replyAuthor,
            isAnonymous: !isAuthenticated,
            moderated: false,
            originalContent: content.trim(),
            upvotes: 0,
            downvotes: 0
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error('Failed to post reply: ' + errorData);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setContent("");
      onCancel();
      toast({
        title: "Reply posted",
        description: "Your reply has been added to the discussion.",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate content is provided
    if (!content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a message",
        variant: "destructive"
      });
      return;
    }
    
    replyMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="border-l border-primary/30 pl-2 mt-0.5 bg-muted/5 rounded-md overflow-hidden">
      <div className="space-y-0.5 p-1">
        <div className="flex items-center gap-1 mb-0.5">
          <Reply className="h-2.5 w-2.5 text-primary/70" />
          <span className="text-[10px] font-medium">Reply to this comment</span>
        </div>
        
        <div className="flex gap-1">
          <Textarea
            ref={textareaRef}
            placeholder="Write your reply..."
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setContent(e.target.value);
              if (isFlagged && !previewMode) {
                setPreviewMode(true);
              }
            }}
            className="min-h-[35px] text-[10px] bg-background/80 py-1 flex-grow"
            required
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 px-1.5 text-[10px] self-start"
          >
            Cancel
          </Button>
        </div>
        
        {/* Moderation preview for reply */}
        {isFlagged && content.trim() !== "" && (
          <motion.div 
            className="px-1.5 py-1 bg-amber-500/10 rounded-sm text-[9px] border border-amber-500/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-2.5 w-2.5" />
              <span className="font-medium">Preview with moderation:</span>
            </div>
            <p className="mt-0.5 text-xs ml-3.5">{moderated}</p>
          </motion.div>
        )}
        
        {/* Under review notice for reply */}
        {isUnderReview && !isFlagged && content.trim() !== "" && (
          <motion.div 
            className="px-1.5 py-1 bg-blue-500/10 rounded-sm text-[9px] border border-blue-500/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <ShieldAlert className="h-2.5 w-2.5" />
              <span className="font-medium">This reply may be placed under review</span>
            </div>
            <p className="mt-0.5 text-[9px] ml-3.5 text-muted-foreground">
              Your reply contains content that might need moderator approval.
            </p>
          </motion.div>
        )}
        
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={replyMutation.isPending}
            className="h-5 text-[10px] px-1.5 py-0"
          >
            {replyMutation.isPending ? (
              <>
                <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                <span>Posting</span>
              </>
            ) : (
              <>
                <SendHorizontal className="mr-1 h-2.5 w-2.5" />
                <span>Reply</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

// Helper to check approval status, handling both field names
const isCommentApproved = (comment: Comment): boolean => {
  // Check both field names due to API transition
  return comment.approved === true || comment.is_approved === true;
};

// Main component
export default function SimpleCommentSection({ postId, title }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [commentToFlag, setCommentToFlag] = useState<number | null>(null);
  const [flaggedComments, setFlaggedComments] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get authentication state
  const { user, isAuthenticated, isAuthReady } = useAuth();
  
  // Smart moderation preview with review flag
  const { isFlagged, moderated, isUnderReview } = checkModeration(content);
  
  // Load previously flagged comments from localStorage
  useEffect(() => {
    const storedFlaggedComments = localStorage.getItem('flaggedComments_' + postId);
    if (storedFlaggedComments) {
      try {
        const parsedComments = JSON.parse(storedFlaggedComments);
        if (Array.isArray(parsedComments)) {
          setFlaggedComments(parsedComments);
        }
      } catch (e) {
        console.error('Error parsing flagged comments from localStorage', e);
      }
    }
  }, [postId]);

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    }
  });

  // Post new comment
  const mutation = useMutation({
    mutationFn: async () => {
      // Use authenticated user's username if available, otherwise use "Anonymous"
      const commentAuthor = isAuthenticated && user ? user.username : "Anonymous";
      
      // Get CSRF token from cookie
      const cookies = document.cookie.split('; ');
      const csrfCookie = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';
      
      // Using the correct endpoint format that matches server routes
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include", // Important for CSRF token
        body: JSON.stringify({
          content: content.trim(),
          author: commentAuthor
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error('Failed to post comment: ' + errorData);
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Comment posted successfully:', data);
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setContent("");
      toast({
        title: "Comment posted",
        description: "Thank you for joining the conversation!",
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle upvote
  const handleUpvote = async (commentId: number) => {
    try {
      // Get CSRF token from cookie
      const cookies = document.cookie.split('; ');
      const csrfCookie = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';
      
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include",
        body: JSON.stringify({ isUpvote: true })
      });
      
      if (!response.ok) {
        throw new Error("Failed to upvote comment");
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upvote comment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle opening the flag dialog
  const openFlagDialog = (commentId: number) => {
    // Check if comment has already been flagged
    if (flaggedComments.includes(commentId)) {
      toast({
        title: "Already reported",
        description: "You have already reported this comment. Thank you for helping keep our community safe.",
        variant: "default"
      });
      return;
    }
    
    setCommentToFlag(commentId);
    setFlagDialogOpen(true);
  };
  
  // Handle flag confirmation from dialog
  const confirmFlagComment = async () => {
    if (!commentToFlag) return;
    
    try {
      // Get CSRF token from cookie
      const cookies = document.cookie.split('; ');
      const csrfCookie = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';
      
      const response = await fetch(`/api/comments/${commentToFlag}/flag`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include",
        body: JSON.stringify({ reason: "inappropriate content" })
      });
      
      if (!response.ok) {
        throw new Error("Failed to flag comment");
      }
      
      // Add comment to flagged list to prevent multiple reports
      setFlaggedComments(prev => [...prev, commentToFlag]);
      
      // Save flagged comments to localStorage to persist between sessions
      localStorage.setItem('flaggedComments_' + postId, JSON.stringify([...flaggedComments, commentToFlag]));
      
      toast({
        title: "Comment reported",
        description: "Thank you for flagging this comment. Our moderators will review it.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFlagDialogOpen(false);
      setCommentToFlag(null);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate content is provided
    if (!content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a message",
        variant: "destructive"
      });
      return;
    }
    
    // Execute mutation to submit comment
    mutation.mutate();
  };

  // Get root comments and group replies, filtering for approved comments only
  const rootComments = comments
    .filter(comment => comment.parentId === null)
    .filter(comment => isCommentApproved(comment));
  
  const repliesByParentId = comments
    .filter(comment => comment.parentId !== null)
    .filter(comment => isCommentApproved(comment))
    .reduce((groups: Record<number, Comment[]>, reply) => {
      if (reply.parentId) {
        if (!groups[reply.parentId]) {
          groups[reply.parentId] = [];
        }
        groups[reply.parentId].push(reply);
      }
      return groups;
    }, {});

  // Format date
  const formatDate = (dateStr: string | Date): string => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return format(date, 'MMM d');
  };
  
  // Parse and highlight @mentions in text
  const parseMentions = (text: string): React.ReactNode => {
    if (!text) return "";
    
    // Regular expression to match @mentions
    const mentionRegex = /@(\w+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    // Find all mentions in the text
    while ((match = mentionRegex.exec(text)) !== null) {
      // Add the text before the mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the mention with highlighting
      const username = match[1];
      parts.push(
        <span key={`mention-${match.index}`} className="text-primary font-medium">
          @{username}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? <>{parts}</> : text;
  };

  return (
    <div className="antialiased mx-auto">
      <div className="border-t border-border/30 pt-4 pb-1.5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-medium">Comments ({rootComments.length})</h3>
        </div>
        {/* Comment form - ultra sleek design */}
        <Card className="mb-2 p-2 shadow-sm bg-gradient-to-b from-card/80 to-card/50 border-border/30 overflow-hidden hover:shadow-md transition-shadow">
          <form onSubmit={handleSubmit} className="space-y-1">
            <div className="grid grid-cols-1 gap-1">
              <motion.div 
                className="flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setContent(e.target.value);
                      if (isFlagged && !previewMode) {
                        setPreviewMode(true);
                      }
                    }}
                    className="h-7 text-xs bg-background/80 min-h-[45px] flex-grow"
                    required
                  />
                  <div className="flex flex-col">
                    <Button 
                      type="submit" 
                      disabled={mutation.isPending}
                      size="sm"
                      className="h-[45px] w-7 ml-1 p-0 flex items-center justify-center"
                    >
                      {mutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <SendHorizontal className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Moderation preview */}
                {isFlagged && content.trim() !== "" && (
                  <motion.div 
                    className="mt-1 px-1.5 py-1 bg-amber-500/10 rounded-sm text-[9px] border border-amber-500/20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-2.5 w-2.5" />
                      <span className="font-medium">Preview with automatic moderation:</span>
                    </div>
                    <p className="mt-0.5 text-xs ml-3.5">{moderated}</p>
                  </motion.div>
                )}
                
                {/* Under review notice */}
                {isUnderReview && !isFlagged && content.trim() !== "" && (
                  <motion.div 
                    className="mt-1 px-1.5 py-1 bg-blue-500/10 rounded-sm text-[9px] border border-blue-500/20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <ShieldAlert className="h-2.5 w-2.5" />
                      <span className="font-medium">This comment may be placed under review</span>
                    </div>
                    <p className="mt-0.5 text-[9px] ml-3.5 text-muted-foreground">
                      Your comment contains content that might need moderator approval before being displayed to all users.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </form>
        </Card>
      </div>

      {/* Comments list */}
      <div className="space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        ) : rootComments.length > 0 ? (
          rootComments.map(comment => (
            <motion.div 
              key={comment.id} 
              className="space-y-1"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
            >
              <Card className={cn(
                "shadow-sm hover:shadow-md transition-all border-border/30 overflow-hidden",
                comment.metadata.moderated ? "border-amber-500/30" : "hover:border-primary/30"
              )}>
                {/* Comment header - ultra compact */}
                <div className="px-2.5 py-1 flex items-center justify-between border-b border-border/10 bg-muted/10">
                  <div className="flex items-center">
                    <span className="font-medium text-xs">{comment.metadata.author || "Anonymous"}</span>
                    {repliesByParentId[comment.id]?.length > 0 && (
                      <Badge variant="outline" className="ml-2 text-[9px] px-1 py-0 h-3.5 border-muted-foreground/30">
                        {repliesByParentId[comment.id].length} {repliesByParentId[comment.id].length === 1 ? 'reply' : 'replies'}
                      </Badge>
                    )}
                    {comment.metadata.moderated && (
                      <div className="ml-2 flex items-center text-[9px] text-amber-500">
                        <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                        <span>Moderated</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground flex items-center">
                    <Calendar className="h-2.5 w-2.5 mr-0.5" />
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                
                {/* Comment body - ultra compact */}
                <div className="px-2.5 py-1">
                  <p className="text-xs text-card-foreground leading-relaxed mb-1">
                    {parseMentions(comment.content)}
                  </p>
                  
                  {comment.metadata.moderated && (
                    <div className="mb-1 px-1.5 py-0.5 bg-amber-500/10 rounded-sm text-[9px] border border-amber-500/20">
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-2.5 w-2.5" />
                        <span className="font-medium">This comment was automatically moderated</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleUpvote(comment.id)}
                        className="inline-flex items-center text-[10px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ThumbsUp className="h-2.5 w-2.5 mr-0.5" />
                        <span>{comment.metadata.upvotes > 0 ? comment.metadata.upvotes : ''}</span>
                      </button>
                      <button 
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="inline-flex items-center text-[10px] text-muted-foreground hover:text-primary transition-colors ml-2"
                      >
                        <Reply className="h-2.5 w-2.5 mr-0.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                    <div>
                      {flaggedComments.includes(comment.id) ? (
                        <span 
                          className="inline-flex items-center text-[9px] text-muted-foreground/70"
                          title="You've reported this comment"
                        >
                          <span className="mr-1 opacity-70">Reported</span>
                          <Flag className="h-2.5 w-2.5 fill-destructive/10 text-destructive/50" />
                        </span>
                      ) : (
                        <button 
                          onClick={() => openFlagDialog(comment.id)}
                          className="inline-flex items-center text-[9px] text-muted-foreground hover:text-destructive transition-colors group"
                          title="Report this comment"
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">Flag</span>
                          <Flag className="h-2.5 w-2.5 group-hover:fill-destructive/10" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Show reply form if replying to this comment */}
              <AnimatePresence>
                {replyingTo === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, x: -10 }}
                    animate={{ opacity: 1, height: "auto", x: 0 }}
                    exit={{ opacity: 0, height: 0, x: -10 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                    className="ml-4"
                  >
                    <ReplyForm 
                      commentId={comment.id} 
                      postId={postId}
                      onCancel={() => setReplyingTo(null)}
                      authorToMention={comment.metadata.author}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Replies to this comment */}
              {repliesByParentId[comment.id] && repliesByParentId[comment.id].length > 0 && (
                <div className="ml-4 space-y-1">
                  {repliesByParentId[comment.id].map(reply => (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0, x: -5, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
                    >
                      <Card className={cn(
                        "shadow-xs hover:shadow-sm transition-all border-border/30 overflow-hidden",
                        reply.metadata.moderated ? "border-amber-500/30" : "hover:border-primary/20"
                      )}>
                        {/* Reply header - ultra compact */}
                        <div className="px-2 py-0.5 flex items-center justify-between border-b border-border/10 bg-muted/5">
                          <div className="flex items-center">
                            <span className="font-medium text-[10px]">{reply.metadata.author || "Anonymous"}</span>
                            {reply.metadata.moderated && (
                              <div className="ml-2 flex items-center text-[8px] text-amber-500">
                                <AlertCircle className="h-2 w-2 mr-0.5" />
                                <span>Moderated</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[8px] text-muted-foreground flex items-center">
                            <Calendar className="h-2 w-2 mr-0.5" />
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        
                        {/* Reply body - ultra compact */}
                        <div className="px-2 py-1">
                          <p className="text-[10px] text-card-foreground leading-relaxed mb-1">
                            {parseMentions(reply.content)}
                          </p>
                          
                          {reply.metadata.moderated && (
                            <div className="mb-1 px-1 py-0.5 bg-amber-500/10 rounded-sm text-[8px] border border-amber-500/20">
                              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-2 w-2" />
                                <span className="font-medium">This reply was automatically moderated</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-1">
                            <button 
                              onClick={() => handleUpvote(reply.id)}
                              className="inline-flex items-center text-[9px] text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ThumbsUp className="h-2 w-2 mr-0.5" />
                              <span>{reply.metadata.upvotes > 0 ? reply.metadata.upvotes : ''}</span>
                            </button>
                            {flaggedComments.includes(reply.id) ? (
                              <span 
                                className="inline-flex items-center text-[8px] text-muted-foreground/70"
                                title="You've reported this reply"
                              >
                                <Flag className="h-2 w-2 fill-destructive/10 text-destructive/50" />
                              </span>
                            ) : (
                              <button 
                                onClick={() => openFlagDialog(reply.id)}
                                className="inline-flex items-center text-[8px] text-muted-foreground hover:text-destructive transition-colors group"
                                title="Report this reply"
                              >
                                <Flag className="h-2 w-2 group-hover:fill-destructive/10" />
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-3">
            <p className="text-xs text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
      
      {/* Confirmation dialog for flagging comments */}
      <AlertDialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <AlertDialogContent className="max-w-[350px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Report this comment?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to report this comment? This will notify our moderation team to review it for inappropriate content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-1.5">
            <AlertDialogCancel className="text-[11px] h-7">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmFlagComment}
              className="text-[11px] h-7 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Flag className="h-3 w-3 mr-1.5" />
              Report Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}