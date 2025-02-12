import { useNavigate } from "wouter";
import PostEditor from "@/components/admin/post-editor";
import { Card } from "@/components/ui/card";

export default function SubmitStoryPage() {
  const navigate = useNavigate();

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Share Your Horror Story</h1>
          <p className="text-muted-foreground">
            Submit your story to our community. All submissions are reviewed by moderators
            before being published to ensure they meet our community guidelines.
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
