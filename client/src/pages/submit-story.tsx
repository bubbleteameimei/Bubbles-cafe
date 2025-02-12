import { useLocation } from "wouter";
import PostEditor from "@/components/admin/post-editor";
import { Card } from "@/components/ui/card";
import { Pencil } from "lucide-react";

export default function SubmitStoryPage() {
  const [, navigate] = useLocation();

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Pencil className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Join Our Horror Community</h1>
          </div>
          <p className="text-muted-foreground">
            Welcome to our community of horror storytellers! We're excited to read your tale 
            of terror. Your story will be reviewed by our community moderators to ensure it aligns 
            with our guidelines, helping maintain a safe and enjoyable space for everyone. 
            Once approved, your story will be shared with fellow horror enthusiasts.
          </p>
        </div>

        <PostEditor 
          isCommunityPost={true}
          onClose={() => navigate("/")}
        />
      </Card>
    </div>
  );
}