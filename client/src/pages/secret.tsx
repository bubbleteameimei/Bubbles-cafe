import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Secret() {
  const [code, setCode] = useState("");
  const { data: secretPosts } = useQuery<Post[]>({
    queryKey: ["/api/secret-posts"],
  });

  const handleUnlock = async (postId: number) => {
    const response = await fetch("/api/unlock-secret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, code }),
    });

    if (response.ok) {
      window.location.href = `/post/${secretPosts?.find(p => p.id === postId)?.slug}`;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-serif mb-8">Secret Pages</h1>
      <div className="flex gap-4 mb-8">
        <Input
          type="password"
          placeholder="Enter secret code..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button onClick={() => secretPosts?.[0] && handleUnlock(secretPosts[0].id)}>
          Unlock
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
      </div>
    </div>
  );
}