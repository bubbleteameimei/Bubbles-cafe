import { useQuery, useMutation } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Secret() {
  const [code, setCode] = useState("");
  const { toast } = useToast();
  const { data: secretPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts/secret"]
  });

  const unlockMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("POST", `/api/posts/secret/${postId}/unlock`, {
        unlockedBy: code
      });
      return response.json();
    },
    onSuccess: (_, postId) => {
      const post = secretPosts?.find(p => p.id === postId);
      if (post) {
        window.location.href = `/post/${post.slug}`;
      }
      queryClient.invalidateQueries({ queryKey: ["/api/posts/secret"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unlock the secret post. Please check your code.",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-4xl font-semibold mb-8 tracking-tight">Secret Stories</h1>
      <div className="flex gap-4 mb-8">
        <Input
          type="password"
          placeholder="Enter secret code..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="max-w-xs"
        />
        <Button 
          onClick={() => secretPosts?.[0] && unlockMutation.mutate(secretPosts[0].id)}
          disabled={unlockMutation.isPending || !code}
        >
          {unlockMutation.isPending ? "Unlocking..." : "Unlock"}
        </Button>
      </div>
      <div className="grid gap-6">
        {secretPosts?.map((post) => (
          <Card key={post.id} className="backdrop-blur">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
        {(!secretPosts || secretPosts.length === 0) && (
          <p className="text-center text-muted-foreground">No secret posts found.</p>
        )}
      </div>
    </div>
  );
}