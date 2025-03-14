import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, text, url = window.location.href, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast({
          description: "Story shared successfully!",
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
          toast({
            variant: "destructive",
            description: "Failed to share story. Please try again.",
          });
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        description: "Link copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying:", error);
      toast({
        variant: "destructive",
        description: "Failed to copy link. Please try again.",
      });
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={cn("share-btn", className)}
        onClick={handleShare}
        aria-label="Share this story"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="sm:max-w-md"
          aria-labelledby="share-dialog-title"
          aria-describedby="share-dialog-description"
        >
          <DialogTitle id="share-dialog-title">Share This Story</DialogTitle>
          <DialogDescription id="share-dialog-description">
            Share this story with friends via copy/paste or social media
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="grid gap-4 py-4">
            <Input
              id="shareURL"
              value={url}
              readOnly
              className="w-full flex-1 text-center"
            />
            <div className="flex justify-center gap-4">
              <Button 
                onClick={handleCopyLink} 
                className="flex items-center gap-2"
                aria-label={copied ? "Link copied" : "Copy link to clipboard"}
                aria-pressed={copied}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank')}
                aria-label="Share on WhatsApp"
              >
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank')}
                aria-label="Share on Twitter"
              >
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')}
                aria-label="Share on Facebook"
              >
                Facebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}