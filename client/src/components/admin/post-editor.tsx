import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Undo,
  Redo,
  Check,
  X,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type Post, type InsertPost, insertPostSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PostEditorProps {
  post?: Post | null;
  onClose?: () => void;
}

export default function PostEditor({ post, onClose }: PostEditorProps) {
  const { toast } = useToast();
  const [selectedText, setSelectedText] = useState({ start: 0, end: 0 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      excerpt: post?.excerpt || "",
      isSecret: post?.isSecret || false,
      slug: post?.slug || "",
      authorId: post?.authorId || 1,
      themeCategory: post?.themeCategory || "PSYCHOLOGICAL",
      triggerWarnings: post?.triggerWarnings || [],
      matureContent: post?.matureContent || false
    }
  });

  // Optimistic update helper with proper type handling
  const getOptimisticPost = (formData: InsertPost): Post => {
    const content = formData.content;
    const readingTime = Math.ceil(content.split(/\s+/).length / 200);
    const slug = formData.slug || formData.title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    return {
      id: post?.id || Date.now(),
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      isSecret: formData.isSecret,
      slug,
      createdAt: post?.createdAt ? new Date(post.createdAt) : new Date(),
      authorId: formData.authorId,
      likesCount: post?.likesCount || 0,
      dislikesCount: post?.dislikesCount || 0,
      themeCategory: formData.themeCategory,
      triggerWarnings: formData.triggerWarnings,
      matureContent: formData.matureContent,
      readingTimeMinutes: readingTime
    };
  };

  const mutation = useMutation({
    mutationFn: async (data: InsertPost) => {
      const endpoint = post ? `/api/posts/${post.id}` : "/api/posts";
      const method = post ? "PATCH" : "POST";

      const response = await apiRequest(method, endpoint, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${post ? 'update' : 'create'} post`);
      }
      return response.json();
    },
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ["/api/posts"] });
      const previousPosts = queryClient.getQueryData<{ posts: Post[]; hasMore: boolean }>(["/api/posts"]);

      queryClient.setQueryData<{ posts: Post[]; hasMore: boolean }>(["/api/posts"], (old = { posts: [], hasMore: false }) => {
        const optimisticPost = getOptimisticPost(newPost);
        if (post) {
          return {
            posts: old.posts.map(p => p.id === post.id ? optimisticPost : p),
            hasMore: old.hasMore
          };
        }
        return {
          posts: [...old.posts, optimisticPost],
          hasMore: old.hasMore
        };
      });

      return { previousPosts };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: post ? "Post updated successfully" : "Post created successfully",
      });
      onClose?.();
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["/api/posts"], context.previousPosts);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to save post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTextSelection = () => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const newContent = textarea.value;
      setSelectedText({
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      });

      if (history[history.length - 1] !== newContent) {
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newContent]);
        setHistoryIndex(prev => prev + 1);
      }
    }
  };

  const insertFormatting = (format: string) => {
    const content = form.getValues("content");
    const { start, end } = selectedText;
    const selectedContent = content.substring(start, end);

    let newContent = '';
    switch (format) {
      case 'bold':
        newContent = content.substring(0, start) + `**${selectedContent}**` + content.substring(end);
        break;
      case 'italic':
        newContent = content.substring(0, start) + `_${selectedContent}_` + content.substring(end);
        break;
      default:
        return;
    }

    form.setValue("content", newContent);
    handleTextSelection();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      form.setValue("content", history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      form.setValue("content", history[historyIndex + 1]);
    }
  };

  const onSubmit = (data: InsertPost) => {
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
    }

    // Handle trigger warnings - if empty array is submitted, ensure it's properly handled
    data.triggerWarnings = data.triggerWarnings || [];

    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2 pb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => insertFormatting('bold')}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => insertFormatting('italic')}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Undo"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your story..."
                        className="min-h-[400px] font-mono"
                        onSelect={handleTextSelection}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTextSelection();
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a brief excerpt..."
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="themeCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Category</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="PSYCHOLOGICAL">Psychological</option>
                      <option value="TECHNOLOGICAL">Technological</option>
                      <option value="COSMIC">Cosmic</option>
                      <option value="FOLK_HORROR">Folk Horror</option>
                      <option value="BODY_HORROR">Body Horror</option>
                      <option value="SURVIVAL">Survival</option>
                      <option value="SUPERNATURAL">Supernatural</option>
                      <option value="GOTHIC">Gothic</option>
                      <option value="APOCALYPTIC">Apocalyptic</option>
                      <option value="LOVECRAFTIAN">Lovecraftian</option>
                      <option value="ISOLATION">Isolation</option>
                      <option value="AQUATIC">Aquatic</option>
                      <option value="VIRAL">Viral</option>
                      <option value="URBAN_LEGEND">Urban Legend</option>
                      <option value="TIME_HORROR">Time Horror</option>
                      <option value="DREAMSCAPE">Dreamscape</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="isSecret"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Secret Post</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="matureContent"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Mature Content</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="min-w-[120px]"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {post ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {post ? "Update Post" : "Create Post"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}