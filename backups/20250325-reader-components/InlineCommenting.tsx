import { useState, useRef, useEffect, useCallback } from "react";
import { XIcon, MessageSquareIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AnimatePresence, motion } from "framer-motion";

export interface SelectionRange {
  start: number;
  end: number;
  text: string;
  paragraphIndex?: number;
}

interface InlineCommentingProps {
  postId: number;
  slug: string;
  contentRef: React.RefObject<HTMLDivElement>;
  enabled?: boolean;
}

const InlineCommenting: React.FC<InlineCommentingProps> = ({
  postId,
  slug,
  contentRef,
  enabled = true
}) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [commentPosition, setCommentPosition] = useState({ top: 0, left: 0 });
  const commentFormRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const handleMouseUp = useCallback(() => {
    if (!enabled) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !contentRef.current) return;
    
    const range = selection.getRangeAt(0);
    if (!range) return;
    
    // Check if selection is within content area
    if (!contentRef.current.contains(range.commonAncestorContainer)) return;
    
    const selectionText = selection.toString().trim();
    if (selectionText.length < 5) return; // Require minimum length
    
    const rect = range.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    
    // Find paragraph index
    let paragraphNode = range.startContainer;
    while (paragraphNode && paragraphNode.nodeType !== Node.ELEMENT_NODE) {
      paragraphNode = paragraphNode.parentNode;
    }
    
    const paragraphs = contentRef.current.querySelectorAll('p');
    let paragraphIndex = -1;
    
    paragraphs.forEach((p, idx) => {
      if (p.contains(paragraphNode) || p === paragraphNode) {
        paragraphIndex = idx;
      }
    });
    
    setSelectionRange({
      start: range.startOffset,
      end: range.endOffset,
      text: selectionText,
      paragraphIndex
    });
    
    // Position the comment form near but not covering the selection
    setCommentPosition({
      top: rect.bottom - contentRect.top + 10,
      left: rect.left - contentRect.left + (rect.width / 2) - 150 // Center the 300px wide form
    });
    
    setShowCommentForm(true);
  }, [enabled, contentRef]);
  
  // Listen for clicks outside the comment form to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commentFormRef.current && !commentFormRef.current.contains(event.target as Node)) {
        setShowCommentForm(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Listen for selection events
  useEffect(() => {
    if (!contentRef.current || !enabled) return;
    
    contentRef.current.addEventListener("mouseup", handleMouseUp);
    return () => {
      contentRef.current?.removeEventListener("mouseup", handleMouseUp);
    };
  }, [contentRef, handleMouseUp, enabled]);
  
  const submitCommentMutation = useMutation({
    mutationFn: async (data: {
      postId: number;
      comment: string;
      selection: string;
      range: SelectionRange;
    }) => {
      return apiRequest(`/api/posts/${data.postId}/inline-comments`, {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment added",
        description: "Your inline comment has been saved",
        duration: 3000
      });
      
      setShowCommentForm(false);
      setCommentText("");
      setSelectionRange(null);
      
      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${slug}/comments`] });
    },
    onError: (error) => {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to save your comment. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    }
  });
  
  const handleSubmitComment = () => {
    if (!selectionRange || !commentText.trim() || !user) {
      toast({
        title: "Error",
        description: user ? "Please enter a comment" : "You must be logged in to comment",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    
    submitCommentMutation.mutate({
      postId,
      comment: commentText,
      selection: selectionRange.text,
      range: selectionRange
    });
  };
  
  if (!showCommentForm) return null;
  
  return (
    <AnimatePresence>
      {showCommentForm && (
        <motion.div
          ref={commentFormRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            top: `${commentPosition.top}px`,
            left: `${commentPosition.left}px`,
            zIndex: 100,
            width: "300px",
          }}
          className="shadow-lg"
        >
          <Card className="border border-accent p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageSquareIcon size={14} />
                <span>Add comment</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCommentForm(false)}
              >
                <XIcon size={14} />
              </Button>
            </div>
            
            {selectionRange && (
              <div className="bg-muted/50 p-2 rounded-sm mb-2 text-xs italic">
                "{selectionRange.text}"
              </div>
            )}
            
            <Textarea
              placeholder="What are your thoughts on this passage?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[80px] text-sm mb-2"
              disabled={submitCommentMutation.isPending}
            />
            
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentForm(false)}
                disabled={submitCommentMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submitCommentMutation.isPending}
                className="flex items-center gap-1"
              >
                <Check size={14} />
                <span>Submit</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InlineCommenting;