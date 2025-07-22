import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import SimplePostEditor from "@/components/community/simple-post-editor";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import ApiLoader from "@/components/api-loader";

export default function EditStoryPage({ params }: { params: { id: string } }) {
  const id = params?.id;
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Fetch the post data
  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: [`/api/posts/${id}`, id],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      return response.json();
    },
    enabled: !!id && isAuthenticated,
  });

  // Check if user is authorized to edit this post
  const isAuthorized = user?.isAdmin || (post && post.authorId === user?.id);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to edit stories",
        variant: "destructive",
      });
      navigate("/login?redirect=/edit-story/" + id);
    }
  }, [isAuthenticated, id, navigate, toast]);

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/community")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>
      </div>
      
      {isLoading ? (
        <div className="relative min-h-[200px]">
          <ApiLoader 
            isLoading={true}
            message="Loading your story..."
            minimumLoadTime={800}
          />
        </div>
      ) : isError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load story"}
          </AlertDescription>
        </Alert>
      ) : !post ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Story Not Found</AlertTitle>
          <AlertDescription>
            The story you're trying to edit doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
      ) : !isAuthorized ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            You don't have permission to edit this story.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Edit Your Story</h1>
            <p className="text-muted-foreground">
              Make changes to your story below. Your edits will be reviewed by our moderators.
            </p>
          </div>

          <SimplePostEditor 
            postId={parseInt(id)}
            onClose={() => navigate("/community")}
          />
        </Card>
      )}
    </div>
  );
}