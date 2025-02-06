import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { insertPostSchema, type InsertPost } from "@shared/schema";

export default function AdminPage() {
  const form = useForm<InsertPost>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      isSecret: false,
      slug: "",
      authorId: 1, // Default admin ID
    },
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  const onSubmit = async (data: InsertPost) => {
    try {
      // TODO: Implement post creation
      console.log("Creating post:", data);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input {...form.register("title")} />
            </div>
            
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea {...form.register("content")} rows={10} />
            </div>
            
            <div>
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea {...form.register("excerpt")} rows={3} />
            </div>
            
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input {...form.register("slug")} />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...form.register("isSecret")}
                className="rounded border-gray-300"
              />
              <label className="text-sm font-medium">Is Secret Post</label>
            </div>
            
            <Button type="submit">Create Post</Button>
          </form>
        </Form>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Existing Posts</h2>
        <div className="space-y-4">
          {posts?.map((post: any) => (
            <div key={post.id} className="p-4 border rounded">
              <h3 className="font-medium">{post.title}</h3>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
