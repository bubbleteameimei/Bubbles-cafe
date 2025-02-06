import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface LikeDislikeProps {
  postId: number;
  initialLikes?: number;
  initialDislikes?: number;
}

export function LikeDislike({ postId, initialLikes = 0, initialDislikes = 0 }: LikeDislikeProps) {
  const [interaction, setInteraction] = useState<'like' | 'dislike' | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: updateInteraction, isPending } = useMutation({
    mutationFn: async (type: 'like' | 'dislike' | null) => {
      const response = await fetch(`/api/posts/${postId}/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (!response.ok) throw new Error('Failed to update interaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
    },
    onError: () => {
      // Revert the optimistic update
      setInteraction(null);
      toast({
        title: "Error",
        description: "Failed to update interaction. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleInteraction = (type: 'like' | 'dislike') => {
    if (isPending) return; // Prevent multiple clicks while processing
    const newInteraction = interaction === type ? null : type;
    setInteraction(newInteraction);
    updateInteraction(newInteraction);
  };

  return (
    <div className="like-dislike-container">
      <div className="icons-box">
        <div className="icons">
          <label className="btn-label">
            <input
              type="checkbox"
              className="input-box"
              checked={interaction === 'like'}
              onChange={() => handleInteraction('like')}
              disabled={isPending}
            />
            <svg className="svgs" id="icon-like-regular" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7.5 12c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5zm3.75-1.5c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5c0-.828-.672-1.5-1.5-1.5zm5.5 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5c0-.828-.672-1.5-1.5-1.5z" />
            </svg>
            <svg className="svgs" id="icon-like-solid" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="like-text-content">{initialLikes}</span>
            <div className="fireworks">
              <div className="checked-like-fx" />
            </div>
          </label>
        </div>

        <div className="icons">
          <label className="btn-label">
            <input
              type="checkbox"
              className="input-box"
              checked={interaction === 'dislike'}
              onChange={() => handleInteraction('dislike')}
              disabled={isPending}
            />
            <svg className="svgs" id="icon-dislike-regular" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
              <path d="M14 7h-4v10h4z" />
            </svg>
            <svg className="svgs" id="icon-dislike-solid" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm2 15h-4V7h4v10z" />
            </svg>
            <span className="dislike-text-content">{initialDislikes}</span>
            <div className="fireworks">
              <div className="checked-dislike-fx" />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}