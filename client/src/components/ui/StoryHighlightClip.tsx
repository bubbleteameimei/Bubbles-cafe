import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, X, Quote, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface StoryHighlightClipProps {
  postId: number;
  postTitle: string;
  className?: string;
}

export function StoryHighlightClip({ postId, postTitle, className }: StoryHighlightClipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const captureRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Listen for text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const text = selection.toString().trim();
        if (text && text.length > 10) {
          setSelectedText(text);
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, []);

  // Check if there's any selected text to enable the highlight button
  const hasSelectedText = selectedText.length > 10;

  const openHighlightModal = () => {
    if (hasSelectedText) {
      setIsOpen(true);
    } else {
      toast({
        description: "Select some text to highlight first!",
        variant: "default"
      });
    }
  };

  // Capture the highlight as an image
  const captureHighlight = async () => {
    try {
      setIsCapturing(true);
      
      // Wait for a small delay to ensure the UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!captureRef.current) {
        toast({
          description: "Cannot find content to capture. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Dynamically import html2canvas
      const html2canvasModule = await import('html2canvas').catch(err => {
        console.error("Failed to load html2canvas:", err);
        throw new Error("Failed to load image capture library");
      });
      
      const html2canvas = html2canvasModule.default;
      
      // Get current theme for proper background color
      const isDarkMode = document.documentElement.classList.contains('dark');
      const backgroundColor = isDarkMode ? '#121212' : '#f8f9fa';
      
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor, 
        scale: 2, // Better quality
        logging: false,
        allowTaint: true,
        useCORS: true,
        imageTimeout: 15000 // Longer timeout for images
      });
      
      const imageData = canvas.toDataURL('image/png');
      setImageUrl(imageData);
      
      toast({
        description: "Highlight image created successfully!",
      });
    } catch (error) {
      console.error("Failed to capture highlight:", error);
      toast({
        description: error instanceof Error 
          ? `Error: ${error.message}` 
          : "Failed to create highlight image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };

  // Generate a link with the highlighted text as a query parameter
  const generateHighlightLink = () => {
    const baseUrl = window.location.href.split('?')[0];
    const encodedText = encodeURIComponent(selectedText);
    return `${baseUrl}?highlight=${encodedText}`;
  };

  const copyHighlightLink = () => {
    navigator.clipboard.writeText(generateHighlightLink());
    toast({
      description: "Highlight link copied to clipboard!",
    });
  };

  const shareHighlight = async () => {
    const shareData = {
      title: postTitle || document.title,
      text: `"${selectedText.substring(0, 100)}${selectedText.length > 100 ? '...' : ''}" from ${postTitle}`,
      url: generateHighlightLink()
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setIsOpen(false);
      } catch (error) {
        console.error("Sharing failed:", error);
        if ((error as Error).name !== "AbortError") {
          toast({
            description: "Failed to share. Please try another option.",
            variant: "destructive"
          });
        }
      }
    } else {
      copyHighlightLink();
    }
  };
  
  // Download the highlight image
  const downloadHighlightImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `highlight-${postId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Floating action button that appears when text is selected */}
      <AnimatePresence>
        {hasSelectedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-20 right-6 z-50"
          >
            <Button 
              onClick={openHighlightModal}
              className="rounded-full h-12 w-12 shadow-lg bg-primary hover:bg-primary/90"
              aria-label="Share highlight"
            >
              <Quote className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlight dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Story Highlight</DialogTitle>
            <DialogDescription>
              Create a shareable highlight clip from this story
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Preview of the highlighted text */}
            <div 
              ref={captureRef}
              className="relative bg-slate-900 text-white p-5 rounded-lg shadow-inner"
            >
              <div className="prose prose-invert max-w-none prose-quoteless">
                <blockquote className="not-italic text-lg font-medium leading-relaxed border-l-4 border-primary pl-4 py-1">
                  {selectedText}
                </blockquote>
              </div>
              <div className="mt-3 text-sm text-gray-400 flex items-center justify-between">
                <span>— {postTitle}</span>
                <span>Bubble's Café</span>
              </div>
            </div>
            
            {/* Actions for the highlight */}
            <div className="flex flex-col space-y-3">
              {!imageUrl ? (
                <Button 
                  onClick={captureHighlight} 
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  disabled={isCapturing}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isCapturing ? 'Creating image...' : 'Create Shareable Image'}
                </Button>
              ) : (
                <Button 
                  onClick={downloadHighlightImage} 
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Download Image
                </Button>
              )}
              
              <Button 
                onClick={copyHighlightLink} 
                variant="outline"
                className="w-full flex items-center justify-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Highlight Link
              </Button>
              
              <Button 
                onClick={shareHighlight}
                className="w-full flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Highlight
              </Button>
            </div>
          </div>
          
          <DialogClose asChild>
            <Button 
              type="button" 
              variant="ghost" 
              className="absolute right-4 top-4"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}