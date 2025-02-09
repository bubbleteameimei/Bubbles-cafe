import { useQuery, useMutation } from "@tanstack/react-query";
import { type Comment } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommentSchema } from "@shared/schema";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { toast } = useToast();

  const { data: comments, isLoading: isLoadingComments, error: commentsError } = useQuery<Comment[]>({
    queryKey: ["/api/posts", postId, "comments"],
    retry: 2
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
    onError: (error: any) => {
      toast({
        title: "Error posting comment",
        description: error.message || "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (isLoadingComments) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 space-y-2 bg-accent/50 rounded-lg">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (commentsError) {
    return (
      <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <p>Failed to load comments. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Join the Discussion</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
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
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Share your thoughts..." 
                    className="min-h-[100px] resize-y"
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

      <motion.div 
        className="mt-8 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {comments?.map((comment) => (
            <motion.div 
              key={comment.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 bg-accent/50 rounded-lg shadow-sm transition-colors hover:bg-accent"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-lg">{comment.author}</p>
                <time className="text-sm text-muted-foreground">
                  {format(new Date(comment.createdAt), 'MMMM d, yyyy')}
                </time>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments?.length === 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-8"
          >
            No comments yet. Be the first to share your thoughts!
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}