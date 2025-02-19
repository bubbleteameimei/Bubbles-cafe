import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStoryRatingSchema } from "@shared/schema";
import type { InsertStoryRating } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skull } from "lucide-react";
import { motion } from "framer-motion";

interface StoryRatingProps {
  postId: number;
  userId?: number;
}

export function StoryRating({ postId, userId }: StoryRatingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localRating, setLocalRating] = useState<number>(0);

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

  const form = useForm<InsertStoryRating>({
    resolver: zodResolver(insertStoryRatingSchema),
    defaultValues: {
      postId,
      userId: userId || 0,
      fearRating: existingRating?.fearRating || 3
    }
  });

  const rateMutation = useMutation({
    mutationFn: async (fearRating: number) => {
      if (!userId) throw new Error("Must be logged in to rate");
      const response = await fetch(`/api/stories/${postId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fearRating, userId })
      });
      if (!response.ok) throw new Error("Failed to submit rating");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${postId}/rating`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${postId}/average-rating`] });
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this story! 👻",
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xs mx-auto p-2 space-y-2 bg-card rounded-lg shadow-sm border"
    >
      <div className="text-center space-y-1">
        <h3 className="text-xs font-medium">Spooky Rating</h3>
        <div className="flex justify-center space-x-0.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <Skull
              key={value}
              className={`w-3 h-3 transition-opacity hover:scale-110 ${getSkullOpacity(
                value,
                averageRating || 0
              )}`}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Average: {averageRating?.toFixed(1) || "No ratings"}
        </p>
      </div>

      {userId ? (
        <Form {...form}>
          <form className="space-y-2">
            <FormField
              control={form.control}
              name="fearRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between text-[10px]">
                    Your Rating
                    <span className="text-[10px] text-muted-foreground">
                      {localRating}/5
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      <Skull className="h-2 w-2 text-muted-foreground" />
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[localRating]}
                        onValueChange={([value]) => {
                          setLocalRating(value);
                          field.onChange(value);
                        }}
                        className="flex-1"
                      />
                      <Skull className="h-3 w-3 text-destructive" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="button"
              onClick={() => rateMutation.mutate(localRating)}
              disabled={rateMutation.isPending}
              className="w-full text-xs h-6"
              variant="secondary"
            >
              {rateMutation.isPending ? "Rating..." : "Rate Story"}
            </Button>
          </form>
        </Form>
      ) : (
        <p className="text-[10px] text-center text-muted-foreground">
          Sign in to rate this story 👻
        </p>
      )}
    </motion.div>
  );
}