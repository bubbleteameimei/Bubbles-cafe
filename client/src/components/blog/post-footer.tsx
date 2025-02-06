import { SocialButtons } from "@/components/ui/social-buttons";
import { LikeDislike } from "@/components/ui/like-dislike";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

interface PostFooterProps {
  currentIndex: number;
  totalPosts: number;
  onPrevious: () => void;
  onNext: () => void;
  onRandom: () => void;
  socialLinks: {
    wordpress?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
    facebook?: string;
  };
}

export function PostFooter({
  currentIndex,
  totalPosts,
  onPrevious,
  onNext,
  onRandom,
  socialLinks
}: PostFooterProps) {
  return (
    <div className="mt-8 space-y-6">
      {/* Navigation controls */}
      <div className="controls-wrapper flex items-center justify-between bg-background/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-border/50">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalPosts}
          </span>
          <Button
            variant="ghost"
            onClick={onRandom}
            className="hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onNext}
          disabled={currentIndex === totalPosts - 1}
          className="hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Next
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Like/Dislike and Social buttons */}
      <div className="flex items-center justify-between gap-4 bg-background/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-border/50">
        <div className="w-full">
          <LikeDislike />
        </div>
        <div className="w-full flex justify-end">
          <SocialButtons links={socialLinks} />
        </div>
      </div>
    </div>
  );
}