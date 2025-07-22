import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

interface UseInlineCommentingProps {
  enabled?: boolean;
  onSubmitComment?: (text: string, selection: string, selectionRange: SelectionRange) => void;
  contentSelector?: string;
}

interface SelectionRange {
  start: number;
  end: number;
  paragraphIndex?: number;
}

const useInlineCommenting = ({
  enabled = true,
  onSubmitComment,
  contentSelector = '.story-content'
}: UseInlineCommentingProps = {}) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    if (!enabled) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      return;
    }
    
    // Make sure the selection is within the content area
    const contentElement = document.querySelector(contentSelector);
    if (!contentElement) return;
    
    const range = selection.getRangeAt(0);
    if (!contentElement.contains(range.commonAncestorContainer)) {
      return;
    }
    
    // Get the selected text
    const text = selection.toString().trim();
    if (text.length > 10) { // Only trigger for meaningful selections
      setSelectedText(text);
      
      // Calculate the selection range for later highlighting
      const start = range.startOffset;
      const end = range.endOffset;
      
      // Try to determine paragraph index
      let paragraphIndex;
      const paragraphs = contentElement.querySelectorAll('p');
      for (let i = 0; i < paragraphs.length; i++) {
        if (paragraphs[i].contains(range.commonAncestorContainer)) {
          paragraphIndex = i;
          break;
        }
      }
      
      setSelectionRange({ start, end, paragraphIndex });
      setIsDialogOpen(true);
    }
  }, [enabled, contentSelector]);

  // Add and remove event listeners
  useEffect(() => {
    if (enabled) {
      document.addEventListener('mouseup', handleTextSelection);
    }
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, [enabled, handleTextSelection]);

  // Handle comment submission
  const handleSubmitComment = () => {
    if (commentText.trim() && selectedText && selectionRange && onSubmitComment) {
      onSubmitComment(commentText, selectedText, selectionRange);
      setCommentText('');
      setIsDialogOpen(false);
    }
  };

  // Cancel commenting
  const handleCancelComment = () => {
    setCommentText('');
    setIsDialogOpen(false);
  };

  // The comment dialog component
  const CommentDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent 
        className="sm:max-w-md"
        aria-labelledby="comment-dialog-title"
        aria-describedby="comment-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="comment-dialog-title">Add a Comment</DialogTitle>
          <DialogDescription id="comment-dialog-description">
            You are commenting on:
            <blockquote className="border-l-2 border-accent pl-4 mt-2 italic">
              {selectedText.length > 100 ? `${selectedText.substring(0, 100)}...` : selectedText}
            </blockquote>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment here..."
            className="w-full min-h-[100px]"
            autoFocus
          />
        </div>
        
        <DialogFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleCancelComment}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmitComment}>
            Submit Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    CommentDialog,
    isSelecting: isDialogOpen,
    selectedText,
    selectionRange
  };
};

export default useInlineCommenting;