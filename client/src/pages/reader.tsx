import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from "date-fns";
import CommentSection from "@/components/blog/comment-section";

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
}

export default function Reader() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  const { data: postsData, isLoading, error } = useQuery<PostsResponse>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const response = await fetch('/api/posts?page=1&limit=16');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      if (!data.posts || !Array.isArray(data.posts)) {
        throw new Error('Invalid posts data format');
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 3
  });

  useEffect(() => {
    // Save current index to session storage - retained from original code
    sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
  }, [currentIndex]);


  const goToPrevious = useCallback(() => {
    if (!postsData?.posts || !Array.isArray(postsData.posts) || postsData.posts.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? postsData.posts.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [postsData?.posts]);

  const goToNext = useCallback(() => {
    if (!postsData?.posts || !Array.isArray(postsData.posts) || postsData.posts.length === 0) return;
    setCurrentIndex((prev) => (prev === postsData.posts.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [postsData?.posts]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !postsData?.posts || !Array.isArray(postsData.posts) || postsData.posts.length === 0) {
    return <div>No stories available.</div>;
  }

  const posts = postsData.posts;
  const currentPost = posts[currentIndex];

  if (!currentPost) {
    return <div>No story selected.</div>;
  }

  const formattedDate = format(new Date(currentPost.createdAt), 'MMMM d, yyyy');

  return (
    <div>
      <div>
        <article>
          <h1>{currentPost.title}</h1>
          <time>{formattedDate}</time>
          <div>
            {currentPost.content && currentPost.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>
                {paragraph.trim().split('_').map((text, i) => (
                  i % 2 === 0 ? text : <i key={i}>{text}</i>
                ))}
              </p>
            ))}
          </div>
          <div>
            <Button onClick={goToPrevious}>Previous</Button>
            <span>{currentIndex + 1} / {posts.length}</span>
            <Button onClick={goToNext}>Next</Button>
          </div>
          <CommentSection postId={currentPost.id} title={currentPost.title || ''} />
        </article>
      </div>
    </div>
  );
}