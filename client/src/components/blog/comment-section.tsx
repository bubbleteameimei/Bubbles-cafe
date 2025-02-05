import { useQuery, useMutation } from "@tanstack/react-query";
import { type Comment } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommentSchema } from "@shared/schema";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/posts", postId, "comments"]
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
    }
  });

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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="Your comment" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      </Form>

      <div className="mt-8 space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="p-4 bg-accent rounded-lg">
            <p className="font-bold">{comment.author}</p>
            <p className="mt-2">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
