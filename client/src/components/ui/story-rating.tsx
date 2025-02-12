import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skull } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StoryRatingProps {
  postId: number;
  userId?: number;
}

export function StoryRating({ postId, userId }: StoryRatingProps) {
  const [rating, setRating] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingRating } = useQuery({
    queryKey: [`/api/stories/${postId}/rating`, userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/stories/${postId}/rating?userId=${userId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!userId
  });

  const { data: averageRating } = useQuery({
    queryKey: [`/api/stories/${postId}/average-rating`],
    queryFn: async () => {
      const response = await fetch(`/api/stories/${postId}/average-rating`);
      if (!response.ok) throw new Error("Failed to fetch average rating");
      return response.json();
    }
  });

  const rateMutation = useMutation({
    mutationFn: async (fearRating: number) => {
      if (!userId) throw new Error("Must be logged in to rate");
      return apiRequest(
        existingRating ? "PATCH" : "POST",
        `/api/stories/${postId}/rate`,
        { fearRating, userId }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${postId}/rating`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${postId}/average-rating`] });
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this story!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit rating",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getSkullOpacity = (index: number, rating: number) => {
    return index < rating ? "opacity-100" : "opacity-30";
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Fear Rating</h3>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <Skull
              key={value}
              className={`w-6 h-6 transition-opacity ${getSkullOpacity(
                value,
                averageRating || 0
              )}`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Average: {averageRating?.toFixed(1) || "No ratings yet"}
        </p>
      </div>

      {userId ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <Slider
              value={[rating]}
              onValueChange={(value) => setRating(value[0])}
              max={5}
              step={1}
              className="w-full"
            />
          </div>
          <Button
            onClick={() => rateMutation.mutate(rating)}
            disabled={rateMutation.isPending}
            className="w-full"
          >
            {rateMutation.isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-center text-muted-foreground">
          Log in to rate this story
        </p>
      )}
    </div>
  );
}
