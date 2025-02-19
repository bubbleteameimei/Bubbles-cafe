import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";

type StoryRating = {
  postId: number;
  isLike: boolean;
};

export function StoryRating({ postId }: { postId: number }) {
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<boolean | null>(null);

  const form = useForm<StoryRating>({
    defaultValues: {
      postId,
      isLike: true
    }
  });

  const rateMutation = useMutation({
    mutationFn: async (data: StoryRating) => {
      const response = await fetch('/api/stories/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to rate story');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      setUserRating(variables.isLike);
      toast({
        title: "Rating submitted!",
        description: `You ${variables.isLike ? 'liked' : 'disliked'} this story.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: StoryRating) {
    rateMutation.mutate(data);
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-card rounded-lg shadow-sm">
      <div className="flex justify-center space-x-4">
        <Button
          variant={userRating === true ? "default" : "outline"}
          onClick={() => onSubmit({ postId, isLike: true })}
          disabled={rateMutation.isPending}
        >
          👍 Like
        </Button>
        <Button
          variant={userRating === false ? "default" : "outline"}
          onClick={() => onSubmit({ postId, isLike: false })}
          disabled={rateMutation.isPending}
        >
          👎 Dislike
        </Button>
      </div>
    </div>
  );
}