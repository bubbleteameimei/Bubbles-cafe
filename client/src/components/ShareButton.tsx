import { useState } from 'react';
import { Share, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';

interface ShareButtonProps {
  className?: string;
}

export const ShareButton = ({ className }: ShareButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Share via navigator.share API if available, otherwise open dialog
  const handleShare = async () => {
    try {
      // Get more detailed information for sharing
      const pageTitle = document.title || "Horror Story";
      const pageUrl = window.location.href;
      const siteInfo = "Bubble's Café";
      
      // Create a richer sharing object
      const shareData = {
        title: pageTitle,
        text: `Check out this horror story on ${siteInfo}!`,
        url: pageUrl
      };

      // Check if navigator.share API is available
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          console.log("Content shared successfully via Web Share API");
        } catch (error) {
          console.error("Web Share API failed:", error);
          
          // Don't show error for user cancellations
          if ((error as Error).name !== "AbortError") {
            toast({
              description: "Native sharing failed. Using alternative options.",
              variant: "default"
            });
            // Fall back to dialog when share API fails
            setIsModalOpen(true);
          }
        }
      } else {
        // If Web Share API not available, open the dialog
        console.log("Web Share API not available, using fallback dialog");
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Error in share handler:", err);
      // Always ensure the dialog opens if any unexpected error occurs
      setIsModalOpen(true);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        description: "Link copied to clipboard!",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      textArea.style.position = "fixed";  // Avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          toast({
            description: "Link copied to clipboard!",
          });
          setIsModalOpen(false);
        } else {
          throw new Error("Copy command failed");
        }
      } catch (err) {
        console.error("Fallback copy failed:", err);
        toast({
          description: "Could not copy link. Please try selecting and copying manually.",
          variant: "destructive"
        });
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <>
      {/* Button that triggers either web share API or opens dialog */}
      <Button 
        onClick={handleShare} 
        variant="ghost" 
        size="lg" 
        className={`share-btn ${className || ''}`} 
        aria-label="Share"
      >
        <Share className="h-6 w-6" />
        <span className="sr-only">Share</span>
      </Button>

      {/* Accessible dialog for sharing when Web Share API is not available */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="sm:max-w-md"
          aria-describedby="share-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Share This Story</DialogTitle>
            <DialogDescription id="share-dialog-description">
              Share this story with friends or on social media
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 bg-muted p-2 rounded text-sm"
              />
              <Button 
                onClick={copyLink} 
                size="sm"
                className="px-3"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white p-2 rounded text-center hover:opacity-90"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DA1F2] text-white p-2 rounded text-center hover:opacity-90"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#4267B2] text-white p-2 rounded text-center hover:opacity-90"
              >
                Facebook
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};