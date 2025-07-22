import { useLocation } from "wouter";
import SimplePostEditor from "@/components/community/simple-post-editor";
import { Card } from "@/components/ui/card";

export default function SubmitStoryPage() {
  const [, navigate] = useLocation();

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Share Your Horror Story</h1>
          <p className="text-muted-foreground">
            Tell your scary tale and share it with our horror community.
          </p>
        </div>

        <SimplePostEditor 
          onClose={() => navigate("/community")}
        />
      </Card>
    </div>
  );
}