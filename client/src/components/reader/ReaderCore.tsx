import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cachedFetch } from "@/utils/api-cache";
import logger from "@/utils/secure-client-logger";

interface ReaderCoreProps {
  slug: string;
  onPostLoad?: (post: any) => void;
  onError?: (error: Error) => void;
}

export function ReaderCore({ slug, onPostLoad, onError }: ReaderCoreProps) {
  const mark = (_label: string) => {};
  const measure = (_name: string, _start: string, _end: string) => {};
  const contentRef = useRef<HTMLDivElement>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  type PostShape = {
    title?: string;
    content?: string;
    excerpt?: string | null;
    createdAt?: string | Date;
    readingTimeMinutes?: number | null;
  } | null;

  // Optimized post fetching with caching
  const { data: post, isLoading, error } = useQuery<PostShape>({
    queryKey: ['post', slug],
    queryFn: async () => {
      mark('fetch-start');
      try {
        const data = await cachedFetch(`/api/posts/by-slug/${slug}`, {
          ttl: 10 * 60 * 1000 // 10 minutes cache
        });
        measure('fetch-duration', 'fetch-start');
        return data as PostShape;
      } catch (err) {
        logger.error('Failed to fetch post', { slug, error: err });
        throw err as Error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!slug
  });

  // Calculate reading progress efficiently
  const updateReadingProgress = useMemo(() => {
    let ticking = false;
    
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (contentRef.current) {
            const element = contentRef.current;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = element.scrollHeight - window.innerHeight;
            const progress = Math.min(Math.max((scrollTop / Math.max(scrollHeight, 1)) * 100, 0), 100);
            setReadingProgress(Math.round(progress));
          }
          ticking = false;
        });
        ticking = true;
      }
    };
  }, []);

  // Optimized scroll listener
  useEffect(() => {
    const handleScroll = updateReadingProgress;
    
    window.addEventListener('scroll', handleScroll, { passive: true } as any);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateReadingProgress]);

  // Post load callback
  useEffect(() => {
    if (post && onPostLoad) {
      onPostLoad(post);
    }
  }, [post, onPostLoad]);

  // Error callback
  useEffect(() => {
    if (error && onError) {
      onError(error as Error);
    }
  }, [error, onError]);

  // Sanitize content for security
  const sanitizedContent = useMemo(() => {
    const html = post?.content ?? '';
    if (!html) return '';
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');
  }, [post?.content]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-lg mb-4">
          Failed to load content
        </div>
        <p className="text-muted-foreground">
          Please try refreshing the page or check your connection.
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <div className="text-lg mb-4">Content not found</div>
        <p className="text-muted-foreground">
          The requested content could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="reader-core">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Main Content */}
      <article ref={contentRef} className="max-w-4xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {post?.title ?? ''}
          </h1>
          
          {post?.excerpt && (
            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{post?.createdAt ? new Date(post.createdAt as any).toLocaleDateString() : ''}</span>
            {post?.readingTimeMinutes && (
              <span>{post.readingTimeMinutes} min read</span>
            )}
            <span>Progress: {readingProgress}%</span>
          </div>
        </header>

        <div 
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </article>
    </div>
  );
}

export default ReaderCore;