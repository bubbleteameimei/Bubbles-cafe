import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { AdminDashboard } from "@/components/admin/dashboard-layout";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user, authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated as admin
  useEffect(() => {
    if (!authLoading && !user?.isAdmin) {
      console.log('[Admin] Redirecting to login - User not authenticated or not admin');
      setLocation("/admin/login");
    }
  }, [user, authLoading, setLocation]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not admin, don't render anything while redirecting
  if (!user?.isAdmin) {
    console.log('[Admin] User not admin, waiting for redirect...');
    return null;
  }

  console.log('[Admin] Rendering admin dashboard for user:', user);
  return <AdminDashboard />;
}

// Post and comment moderation mutations
export function useAdminMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      try {
        console.log('[Admin] Starting delete mutation for post:', postId);
        const response = await apiRequest("DELETE", `/api/posts/${postId}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Admin] Delete post error:', errorData);
          throw new Error(errorData.message || "Failed to delete post");
        }

        return postId;
      } catch (error) {
        console.error('[Admin] Delete post error:', error);
        throw error;
      }
    },
    onSuccess: (deletedPostId) => {
      console.log('[Admin] Post deleted successfully:', deletedPostId);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error('[Admin] Post deletion error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
      if (error.message.includes("Unauthorized")) {
        setLocation("/admin/login");
      }
    },
  });

  const moderateCommentMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      const response = await apiRequest("PATCH", `/api/comments/${id}`, { approved });
      if (!response.ok) {
        throw new Error("Failed to moderate comment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Success",
        description: "Comment moderated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to moderate comment",
        variant: "destructive"
      });
      if (error.message.includes("Unauthorized")) {
        setLocation("/admin/login");
      }
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      try {
        console.log('[Admin] Starting delete mutation for comment:', commentId);
        const response = await apiRequest("DELETE", `/api/comments/${commentId}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[Admin] Delete comment error:', errorData);
          throw new Error(errorData.message || "Failed to delete comment");
        }

        return commentId;
      } catch (error) {
        console.error('[Admin] Delete comment error:', error);
        throw error;
      }
    },
    onSuccess: (deletedCommentId) => {
      console.log('[Admin] Comment deleted successfully:', deletedCommentId);
      queryClient.invalidateQueries({ queryKey: ["/api/comments/pending"] });
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
    },
    onError: (error: Error) => {
      console.error('[Admin] Comment deletion error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive"
      });
      if (error.message.includes("Unauthorized")) {
        setLocation("/admin/login");
      }
    }
  });

  return {
    deletePostMutation,
    moderateCommentMutation,
    deleteCommentMutation
  };
}