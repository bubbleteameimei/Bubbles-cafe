import { useQuery, useMutation } from "@tanstack/react-query";
import { type Comment } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommentSchema } from "@shared/schema";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { toast } = useToast();

  const { data: comments, isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ["/api/posts", postId, "comments"],
  });

  const form = useForm({
    resolver: zodResolver(insertCommentSchema),
    defaultValues: {
      postId,
      author: "",
      content: ""
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", `/api/posts/${postId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      form.reset();
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (isLoadingComments) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="Share your thoughts..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full sm:w-auto"
          >
            {mutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      </Form>

      <div className="mt-8 space-y-6">
        {comments?.map((comment) => (
          <div 
            key={comment.id} 
            className="p-6 bg-accent/50 rounded-lg shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-lg">{comment.author}</p>
              <time className="text-sm text-muted-foreground">
                {format(new Date(comment.createdAt), 'MMM d, yyyy')}
              </time>
            </div>
            <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
          </div>
        ))}

        {comments?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}