// Previous imports remain unchanged
const deletePostMutation = useMutation({
  mutationFn: async (postId: number) => {
    try {
      console.log('[Admin] Starting delete mutation for post:', postId);
      const response = await apiRequest("DELETE", `/api/posts/${postId}`, {credentials: 'include'});

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
    // Update the posts query data to remove the deleted post
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
    const response = await apiRequest("PATCH", `/api/comments/${id}`, { 
      approved, 
      credentials: 'include' 
    });
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
      const response = await apiRequest("DELETE", `/api/comments/${commentId}`, {credentials: 'include'});

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