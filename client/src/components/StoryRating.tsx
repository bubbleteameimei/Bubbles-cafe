import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStoryRatingSchema } from "@shared/schema";
import type { InsertStoryRating } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Skull } from "lucide-react";

interface StoryRatingProps {
  postId: number;
  userId: number;
}

export function StoryRating({ postId, userId }: StoryRatingProps) {
  const { toast } = useToast();
  const [hasRated, setHasRated] = useState(false);

  // Fetch existing rating if any
  const { data: existingRating, isLoading } = useQuery({
    queryKey: ['/api/ratings', postId, userId],
    enabled: !!postId && !!userId,
  });

  const form = useForm<InsertStoryRating>({
    resolver: zodResolver(insertStoryRatingSchema),
    defaultValues: {
      postId,
      userId,
      fearRating: existingRating?.fearRating ?? 5
    }
  });

  const ratingMutation = useMutation({
    mutationFn: async (data: InsertStoryRating) => {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      return response.json();
    },
    onSuccess: () => {
      setHasRated(true);
      toast({
        title: "Rating submitted!",
        description: "Thank you for rating this story.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (hasRated) {
    return (
      <div className="text-center p-4 bg-secondary/50 rounded-lg">
        <p className="text-sm">Thanks for rating this story!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-card rounded-lg shadow-sm border">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Rate this Story</h3>
        <p className="text-sm text-muted-foreground">How scary was this story?</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => ratingMutation.mutate(data))} className="space-y-6">
          <FormField
            control={form.control}
            name="fearRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  Fear Rating
                  <span className="text-sm text-muted-foreground">
                    {field.value}/10
                  </span>
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Skull className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="flex-1"
                    />
                    <Skull className="h-6 w-6 text-destructive" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={ratingMutation.isPending}
          >
            {ratingMutation.isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
