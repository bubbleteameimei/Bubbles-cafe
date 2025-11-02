import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useReaderUIToggle from "@/hooks/use-reader-ui-toggle";
import { useCopyProtection } from "@/hooks/useCopyProtection";
import TableOfContents from "@/components/reader/TableOfContents";
import SwipeNavigation from "@/components/reader/SwipeNavigation";
import "@/styles/reader-fixes.css";
import { Share2, Shuffle, ChevronLeft, ChevronRight, BookText, Trash } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { LikeDislike } from "@/components/ui/like-dislike";
import CreepyTextGlitch from "@/components/errors/CreepyTextGlitch";
import SimplifiedErrorPage from "@/components/errors/SimplifiedErrorPage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Footer from "@/components/layout/footer";
import { fetchWordPressPosts } from "@/lib/wordpress-api";
import { sanitizeHtml } from "@/lib/sanitize";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface ReaderPageProps {
  slug?: string;
  params?: { slug?: string };
  isCommunityContent?: boolean;
}

const sanitizeHtmlContent = (html: string): string => {
  try {
    return sanitizeHtml(html);
  } catch {
    return html;
  }
};

export default function ReaderPage({ slug, params, isCommunityContent = false }: ReaderPageProps) {
  const routeSlug = params?.slug || slug;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin === true;

  const { isUIHidden, toggleUI } = useReaderUIToggle();

  const [contentsDialogOpen, setContentsDialogOpen] = useState(false);
  useEffect(() => {
    try {
      if (contentsDialogOpen) {
        document.body.classList.add("overlay-active", "toc-active");
        document.documentElement.classList.add("overlay-active", "toc-active");
        lockBodyScroll("reader-toc");
      } else {
        document.body.classList.remove("overlay-active", "toc-active");
        document.documentElement.classList.remove("overlay-active", "toc-active");
        unlockBodyScroll("reader-toc");
      }
    } catch {}
    return () => {
      try {
        document.body.classList.remove("overlay-active", "toc-active");
        document.documentElement.classList.remove("overlay-active", "toc-active");
        unlockBodyScroll("reader-toc");
      } catch {}
    };
  }, [contentsDialogOpen]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        credentials: "include",
      });
      if (response.status === 204) return { ok: true };
      const contentType = response.headers.get("content-type") || "";
      let data: any = null;
      if (contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      }
      if (!response.ok) {
        throw new Error((data && data.message) ? data.message : `Failed to delete post (status ${response.status})`);
      }
      return data ?? { ok: true };
    },
    onSuccess: () => {
      if (isCommunityContent) {
        queryClient.invalidateQueries({ queryKey: ["/api/posts/community"] });
      }
      if (routeSlug) {
        queryClient.invalidateQueries({ queryKey: ["wordpress", "posts", "reader", routeSlug] });
        queryClient.invalidateQueries({ queryKey: ["/api/posts", routeSlug] });
      }
      setShowDeleteDialog(false);
      toast({ title: "Story Deleted", description: isAdmin ? "Community story has been deleted by admin." : "Your story has been deleted successfully." });
      setLocation("/community");
    },
    onError: (error: Error) => {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
      setShowDeleteDialog(false);
    },
  });

  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const savedIndex = sessionStorage.getItem("selectedStoryIndex");
      if (!savedIndex) return 0;
      const parsed = parseInt(savedIndex, 10);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    } catch {
      return 0;
    }
  });

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ["wordpress", "reader", isCommunityContent ? "community" : "regular"],
    queryFn: async () => {
      const result = await fetchWordPressPosts({ perPage: 100, includeContent: true });
      const posts = Array.isArray(result.posts) ? result.posts : [];
      return { posts, totalPages: result.totalPages ?? 1, total: result.total ?? posts.length };
    },
    placeholderData: () =>
      queryClient.getQueryData(["wordpress", "reader", isCommunityContent ? "community" : "regular"]) as any,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (postsData?.posts?.length) {
      if (routeSlug) {
        const bySlug = postsData.posts.findIndex((p: any) => String(p.slug || "") === String(routeSlug));
        if (bySlug >= 0 && bySlug !== currentIndex) {
          setCurrentIndex(bySlug);
          sessionStorage.setItem("selectedStoryIndex", String(bySlug));
        }
      }
      if (currentIndex >= postsData.posts.length) {
        setCurrentIndex(0);
        sessionStorage.setItem("selectedStoryIndex", "0");
      } else {
        sessionStorage.setItem("selectedStoryIndex", String(currentIndex));
      }
    }
  }, [postsData?.posts, routeSlug, currentIndex]);

  const posts = useMemo(() => postsData?.posts ?? [], [postsData?.posts]);
  const validCurrentIndex = useMemo(
    () => Math.max(0, Math.min(currentIndex, posts.length - 1)),
    [currentIndex, posts.length]
  );

  const ensuredCanonicalRef = useRef(false);
  useEffect(() => {
    try {
      if (!ensuredCanonicalRef.current && posts.length > 0 && !routeSlug) {
        ensuredCanonicalRef.current = true;
        const slugToUse = String(posts[validCurrentIndex]?.slug ?? posts[validCurrentIndex]?.id);
        if (slugToUse) setLocation(`/reader/${encodeURIComponent(slugToUse)}`);
      }
    } catch {}
  }, [posts, validCurrentIndex, routeSlug, setLocation]);

  const currentPost = posts[validCurrentIndex];

  useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: "auto" }); } catch {}
  }, [currentPost?.id]);

  const stripHtml = (s: string) => (s ? s.replace(/<\/?[^>]+(>|$)/g, "").trim() : "");
  const titleText = stripHtml(currentPost?.title?.rendered || (currentPost as any)?.title || "Story");
  const rawContent = currentPost?.content?.rendered || (currentPost as any)?.content || "";
  const plainText = stripHtml(rawContent);

  // Horror overlay state
  const [showHorrorMessage, setShowHorrorMessage] = useState(false);
  useEffect(() => {
    try {
      if (showHorrorMessage) {
        document.body.classList.add("overlay-active", "horror-active");
        document.documentElement.classList.add("overlay-active", "horror-active");
        lockBodyScroll("horror-modal");
      } else {
        document.body.classList.remove("overlay-active", "horror-active");
        document.documentElement.classList.remove("overlay-active", "horror-active");
        unlockBodyScroll("horror-modal");
      }
    } catch {}
    return () => {
      try {
        document.body.classList.remove("overlay-active", "horror-active");
        document.documentElement.classList.remove("overlay-active", "horror-active");
        unlockBodyScroll("horror-modal");
      } catch {}
    };
  }, [showHorrorMessage]);

  // Rapid navigation detection persisted via sessionStorage
  const checkRapidNavigation = (): boolean => {
    const now = Date.now();
    const getInt = (key: string) => {
      try {
        const v = sessionStorage.getItem(key);
        return v ? parseInt(v, 10) : 0;
      } catch {
        return 0;
      }
    };
    const setInt = (key: string, val: number) => {
      try { sessionStorage.setItem(key, String(val)); } catch {}
    };
    const lastTs = getInt("reader_last_nav_ts");
    const timeSince = lastTs ? now - lastTs : Number.POSITIVE_INFINITY;
    let count = getInt("reader_skip_count");
    let overlayTriggered = false;

    if (timeSince < 1500) {
      count += 1;
      setInt("reader_skip_count", count);
      if (count >= 2 && !showHorrorMessage) {
        const message = "I SEE YOU SKIPPING!!!";
        setShowHorrorMessage(true);
        toast({
          title: "NOTICE",
          description: <CreepyTextGlitch text={message} intensityFactor={8} />,
          variant: "destructive",
          duration: 9000,
        });
        setTimeout(() => {
          try { setShowHorrorMessage(false); } catch {}
          setInt("reader_skip_count", 0);
        }, 9000);
        overlayTriggered = true;
      }
    } else {
      count = Math.max(0, count - 1);
      setInt("reader_skip_count", count);
    }
    setInt("reader_last_nav_ts", now);
    return overlayTriggered;
  };

  const goToRandomStory = () => {
    if (posts && posts.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * posts.length);
      } while (randomIndex === validCurrentIndex);

      const overlayTriggered = checkRapidNavigation();
      if (overlayTriggered) return;

      setCurrentIndex(randomIndex);
      try {
        const nextSlug = String(posts[randomIndex]?.slug ?? posts[randomIndex]?.id);
        if (nextSlug) setLocation(`/reader/${encodeURIComponent(nextSlug)}`);
      } catch {}
    }
  };

  const goToPreviousStory = () => {
    if (posts && posts.length > 1 && validCurrentIndex > 0) {
      const newIndex = validCurrentIndex - 1;
      const overlayTriggered = checkRapidNavigation();
      if (overlayTriggered) return;
      setCurrentIndex(newIndex);
      try {
        const nextSlug = String(posts[newIndex]?.slug ?? posts[newIndex]?.id);
        if (nextSlug) setLocation(`/reader/${encodeURIComponent(nextSlug)}`);
      } catch {}
    }
  };

  const goToNextStory = () => {
    if (posts && posts.length > 1 && validCurrentIndex < posts.length - 1) {
      const newIndex = validCurrentIndex + 1;
      const overlayTriggered = checkRapidNavigation();
      if (overlayTriggered) return;
      setCurrentIndex(newIndex);
      try {
        const nextSlug = String(posts[newIndex]?.slug ?? posts[newIndex]?.id);
        if (nextSlug) setLocation(`/reader/${encodeURIComponent(nextSlug)}`);
      } catch {}
    }
  };

  const isFirstStory = validCurrentIndex === 0;
  const isLastStory = validCurrentIndex === posts.length - 1;

  if (isLoading) {
    return null;
  }
  if (error) {
    return (
      <SimplifiedErrorPage
        statusCode={404}
        title="Story Not Found"
        message={error instanceof Error ? error.message : "The requested story could not be found."}
        actionText="Browse Stories"
        actionLink="/reader"
      />
    );
  }
  if (posts.length === 0 || !currentPost) {
    return (
      <SimplifiedErrorPage
        statusCode={404}
        title="Story Not Found"
        message="The requested story could not be found."
        actionText="Browse Stories"
        actionLink="/reader"
      />
    );
  }

  const contentRef = useCopyProtection(true);

  return (
    <div className="reader-page w-full">
      {/* Horror overlay */}
      {showHorrorMessage && (
        <motion.div
          onClick={() => setShowHorrorMessage(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/80 backdrop-blur-md w-screen min-h-[100svh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="horror-modal-title"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.98, opacity: 0, y: 4 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-background/95 p-6 rounded-lg shadow-xl w-[90%] max-w-full text-center border border-[#ff0000]/80"
          >
            <h2 id="horror-modal-title" className="sr-only">Notice</h2>
            <div className="absolute inset-0 rounded-lg bg-[#ff0000]/10 animate-pulse" />
            <div className="relative z-10">
              <div className="mb-6">
                <CreepyTextGlitch
                  text="I SEE YOU SKIPPING!!!"
                  className="text-4xl font-bold"
                  intensityFactor={8}
                />
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="border-[#ff0000]/60 bg-background hover:bg-background/90 text-foreground w-full py-6"
                  onClick={() => setShowHorrorMessage(false)}
                >
                  <span className="mx-auto text-lg font-medium">I understand, I'm sorry</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* TOC trigger */}
      <div className="flex justify-end items-center gap-2 px-6 pt-4">
        <Dialog open={contentsDialogOpen} onOpenChange={setContentsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 rounded-md w-fit"
            >
              <BookText className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-semibold tracking-wide">TOC</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" aria-labelledby="toc-dialog-title" aria-describedby="toc-dialog-description">
            <div className="flex items-center">
              <DialogTitle id="toc-dialog-title">Table of Contents</DialogTitle>
            </div>
            <DialogDescription id="toc-dialog-description">Browse all available stories</DialogDescription>
            <TableOfContents
              currentPostId={currentPost.id}
              posts={posts.map((p: any) => ({
                id: p.id,
                title: (p.title?.rendered || p.title || "Untitled") as string,
                slug: (p.slug || `post-${p.id}`) as string,
                date: (p.date || p.createdAt || new Date().toISOString()) as string,
              }))}
              onSelect={(selected) => {
                try {
                  const foundIndex = posts.findIndex((p: any) =>
                    (selected.slug && p.slug === selected.slug) || p.id === selected.id
                  );
                  if (foundIndex >= 0) {
                    const overlayTriggered = checkRapidNavigation();
                    if (overlayTriggered) return;
                    setCurrentIndex(foundIndex);
                    setLocation(`/reader/${encodeURIComponent(String(posts[foundIndex].slug || posts[foundIndex].id))}`);
                  }
                } catch (err) {
                  console.error("[Reader] TOC onSelect error:", err);
                } finally {
                  setContentsDialogOpen(false);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Separator */}
      <div aria-hidden="true" className="border-b border-border/20 mt-2" />

      <motion.article
        key={currentPost.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="prose dark:prose-invert px-6 md:px-6 pt-0 w-full max-w-none"
      >
        {/* Separator above title */}
        <div aria-hidden="true" className="border-b border-border/20" />

        <div className="flex flex-col items-center mb-2 mt-0">
          <div className="relative flex flex-col items-center">
            {isCommunityContent && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-foreground border-primary/20">
                  Community Story
                </Badge>
                {(isAdmin || (isCommunityContent && user?.id === (currentPost as any)?.authorId)) && isCommunityContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-600"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Delete</span>
                  </Button>
                )}
              </div>
            )}
            <h1
              className="text-4xl md:text-5xl font-bold text-center mb-1 tracking-tight leading-tight"
              dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(currentPost.title?.rendered || (currentPost as any)?.title || "Story") }}
            />
          </div>

          {/* Delete dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl">
                  <Trash className="h-5 w-5 mr-2 text-red-500" />
                  {isAdmin && user?.id !== (currentPost as any)?.authorId ? "Delete Community Story" : "Delete Your Story"}
                </DialogTitle>
                <DialogDescription className="pt-2 text-sm">
                  {isAdmin && user?.id !== (currentPost as any)?.authorId
                    ? "As an admin, you are about to delete a user-submitted community story. This action cannot be undone."
                    : "You are about to delete your community story. This action cannot be undone."}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-between border p-3 rounded-md bg-muted/50 mt-2">
                <div className="font-medium truncate pr-2">
                  {currentPost.title?.rendered || (currentPost as any)?.title || "Story"}
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  Community
                </Badge>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(currentPost.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete Story"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Navigation controls */}
          <div className="flex justify-center items-center gap-4 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousStory}
              disabled={posts.length <= 1 || isFirstStory}
              className="h-9 px-4 bg-background/80 hover:bg-background/60 border-border/50 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToRandomStory}
              disabled={posts.length <= 1}
              className="h-9 px-4 bg-background/80 hover:bg-background/60 border-border/50 disabled:opacity-30"
            >
              <Shuffle className="h-4 w-4 mr-1" />
              Random
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextStory}
              disabled={posts.length <= 1 || isLastStory}
              className="h-9 px-4 bg-background/80 hover:bg-background/60 border-border/50 disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Content area with swipe navigation */}
        <SwipeNavigation onPrevious={goToPreviousStory} onNext={goToNextStory} disabled={showHorrorMessage || posts.length <= 1}>
          <div className="story-container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div
              className="story-content cursor-pointer text-justify"
              ref={contentRef}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtmlContent(currentPost.content?.rendered || (currentPost as any)?.content || "No content available."),
              }}
              onClick={toggleUI}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleUI();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Toggle user interface visibility"
              aria-pressed={isUIHidden}
            />
          </div>
        </SwipeNavigation>

        {/* Compact bottom pagination */}
        <div className="flex items-center justify-center gap-2 mb-6 mt-4 w-full text-center">
          <div className="relative overflow-visible flex items-center justify-center gap-1 bg-background/90 backdrop-blur-md border border-transparent rounded-full h-16 px-1.5 shadow-sm">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ border: "1px solid", borderColor: "hsl(var(--border) / 0.4)", transform: "translateY(-1px)" }}
            />
            <div className="flex items-center gap-1 translate-y-2">
              {/* Previous story button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousStory}
                className={`h-5 w-5 rounded-full group relative transition-all duration-200 ${
                  isFirstStory
                    ? "opacity-30 cursor-not-allowed text-muted-foreground"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-300"
                }`}
                aria-label="Previous story"
                disabled={posts.length <= 1 || isFirstStory}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                  Previous Story
                </span>
              </Button>

              {/* Counter */}
              <div className="px-1 h-5 flex items-center -translate-y-2.5 text-[10px] leading-none text-muted-foreground font-medium">
                {validCurrentIndex + 1} of {posts.length}
              </div>

              {/* Next story button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextStory}
                className={`h-5 w-5 rounded-full group relative transition-all duration-200 ${
                  isLastStory
                    ? "opacity-30 cursor-not-allowed text-muted-foreground"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-300"
                }`}
                aria-label="Next story"
                disabled={posts.length <= 1 || isLastStory}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                  Next Story
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Separator above reactions/share */}
        <div aria-hidden="true" className="border-b border-border/20" />

        <div className="mt-2 pt-3">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex justify-center w-full">
              <LikeDislike postId={currentPost.id} slug={currentPost.slug} source="wp" variant="reader" />
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground font-medium">✨ Loved the story? Share it or follow for more! ✨</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: currentPost.title?.rendered || (currentPost as any)?.title || "Story", url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ title: "Link Copied", description: "Story link copied to clipboard!" });
                    }
                  }}
                  className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>

                {/* Social links */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      window.open("https://twitter.com/Bubbleteameimei", "_blank", "noopener,noreferrer");
                    }}
                    className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" className="h-4 w-4"><path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 0 0 1.87-2.36 8.56 8.56 0 0 1-2.71 1.04 4.25 4.25 0 0 0-7.24 3.88A12.07 12.07 0 0 1 3.15 4.94a4.25 4.25 0 0 0 1.32 5.67 4.22 4.22 0 0 1-1.92-.53v.05a4.25 4.25 0 0 0 3.41 4.17 4.28 4.28 0 0 1-1.91.07 4.25 4.25 0 0 0 3.96 2.94A8.52 8.52 0 0 1 2 19.54a12.05 12.05 0 0 0 6.53 1.91c7.84 0 12.12-6.49 12.12-12.12v-.55A8.68 8.68 0 0 0 24 6.36a8.44 8.44 0 0 1-2.54.7z"/></svg>
                    <span className="sr-only">Follow on Twitter</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      window.open("https://bubbleteameimei.wordpress.com/", "_blank", "noopener,noreferrer");
                    }}
                    className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M12 2C6.48 2 2 6.43 2 11.92c0 4.83 3.42 8.86 7.98 9.77l2.02-5.25l-4.07-11.2L12 8.89l4.07-3.65l-4.07 11.2l2.02 5.25c4.56-.91 7.98-4.94 7.98-9.77C22 6.43 17.52 2 12 2z"/></svg>
                    <span className="sr-only">Follow on WordPress</span>
                  </Button>

                  <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200">
                    <a href="https://www.instagram.com/Bubbleteameimei/" target="_blank" rel="noreferrer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 3a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6a3 3 0 0 0 0-6Zm5.5-.75a1.25 1.25 0 1 1-2.5 0a1.25 1.25 0 0 1 2.5 0Z"/></svg>
                      <span className="sr-only">Follow on Instagram</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.article>

      <Footer />
    </div>
  );
}
                            placeholder="e.g., ghost, skull, brain"
                          />
                          <p className="text-xs text-muted-foreground">
                            Common options: ghost, skull, brain, bug, cpu, footprints, cloud-rain, castle
                          </p>
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            try {
                              const auto = determineThemeCategory(
                                titleText || 'Story',
                                plainText || ''
                              );
                              const autoCat = String(auto || 'HORROR');
                              setSelectedThemeCat(autoCat);
                              const defIcon =
                                SHARED_THEME_CATEGORIES[
                                  autoCat as keyof typeof SHARED_THEME_CATEGORIES
                                ]?.icon || 'ghost';
                              setSelectedThemeIcon(defIcon);
                            } catch {
                              setSelectedThemeCat('HORROR');
                              setSelectedThemeIcon('ghost');
                            }
                          }}
                        >
                          Auto-detect
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              setSavingTheme(true);
                              const csrfToken = document.cookie.replace(
                                /(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/,
                                "$1"
                              );
                              const res = await fetch(`/api/posts/${currentPost.id}/theme`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'X-CSRF-Token': csrfToken
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                  themeCategory: selectedThemeCat,
                                  themeIcon: selectedThemeIcon,
                                  // snake_case for older compatibility
                                  theme_category: selectedThemeCat,
                                  icon: selectedThemeIcon
                                })
                              });
                              if (!res.ok) {
                                const data = await res.json().catch(() => null);
                                throw new Error(data?.error || 'Failed to update theme');
                              }
                              setOverrideThemeCategory(selectedThemeCat);
                              setOverrideThemeIcon(selectedThemeIcon);
                              setThemeEditorOpen(false);
                              toast({
                                title: 'Theme updated',
                                description: 'Theme and icon were updated for this story.'
                              });
                            } catch (err: any) {
                              toast({
                                title: 'Update failed',
                                description: err?.message || 'Could not update theme. Make sure this story exists in the database.',
                                variant: 'destructive'
                              });
                            } finally {
                              setSavingTheme(false);
                            }
                          }}
                          disabled={savingTheme}
                        >
                          {savingTheme ? 'Saving…' : 'Save'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Original navigation controls moved here under time-to-read */}
                <div className={`flex justify-center items-center gap-4 py-3 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousStory}
                    disabled={posts.length <= 1 || isFirstStory}
                    className="h-9 px-4 bg-background/80 hover:bg-background/60 border-border/50 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToRandomStory}
                    disabled={posts.length <= 1}
                    className="h-9 px-4 bg-background/80 hover:bg-background/60 border-border/50 disabled:opacity-30"
                  >
                    <Shuffle className="h-4 w-4 mr-1" />
                    Random
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextStory}
                    disabled={posts.length <= 1 || isLastStory}
                    className="h-9 px-4 bg-background/80 hover:bg-background/60 border-border/50 disabled:opacity-30"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content needs to be wrapped in a SwipeNavigation component */}
            <SwipeNavigation
              onPrevious={goToPreviousStory}
              onNext={goToNextStory}
              disabled={showHorrorMessage || posts.length <= 1}
            >
              <div className="story-container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                <div 
                  className="story-content cursor-pointer text-justify"
                  ref={contentRef}
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtmlContent(currentPost.content?.rendered || currentPost.content || 'No content available.') 
                  }}
                  onClick={toggleUI}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleUI();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Toggle user interface visibility"
                  aria-pressed={isUIHidden}
                />
              </div>
            </SwipeNavigation>
            
            {/* Simple pagination at bottom of story content - extremely compact */}
            <div className={`flex items-center justify-center gap-2 mb-6 mt-4 w-full text-center ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
              <div className="relative overflow-visible flex items-center justify-center gap-1 bg-background/90 backdrop-blur-md border border-transparent rounded-full h-16 px-1.5 shadow-sm">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{ border: '1px solid', borderColor: 'hsl(var(--border) / 0.4)', transform: 'translateY(-1px)' }}
                />
                <div className="flex items-center gap-1 translate-y-2">
                  {/* Previous story button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToPreviousStory}
                    className={`h-5 w-5 rounded-full group relative transition-all duration-200 ${
                      isFirstStory 
                        ? 'opacity-30 cursor-not-allowed text-muted-foreground' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-300'
                    }`}
                    aria-label="Previous story"
                    disabled={posts.length <= 1 || isFirstStory}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                      Previous Story
                    </span>
                  </Button>
                  
                  {/* Story counter */}
                  <div className="px-1 h-5 flex items-center -translate-y-2.5 text-[10px] leading-none text-muted-foreground font-medium">
                    {currentIndex + 1} of {posts.length}
                  </div>
                  
                  {/* Next story button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToNextStory}
                    className={`h-5 w-5 rounded-full group relative transition-all duration-200 ${
                      isLastStory 
                        ? 'opacity-30 cursor-not-allowed text-muted-foreground' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-300'
                    }`}
                    aria-label="Next story"
                    disabled={posts.length <= 1 || isLastStory}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                      Next Story
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Full-bleed separator above reactions/share section (thin, end-to-end) */}
            <div
              aria-hidden="true"
              className="border-b border-border/20"
              style={{ width: '100%', position: 'relative', left: 0, transform: 'none' }}
            />

            <div className="mt-2 pt-3">
              <div className="flex flex-col items-center justify-center gap-6">
                {/* Centered Like/Dislike buttons */}
                <div className={`flex justify-center w-full ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
                  <LikeDislike postId={currentPost.id} slug={currentPost.slug} source="wp" variant="reader" />
                </div>

                <div className={`flex flex-col items-center gap-3 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
                  <p className="text-sm text-muted-foreground font-medium">✨ Loved the story? Share it or follow for more! ✨</p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: currentPost.title?.rendered || currentPost.title || 'Story',
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: "Link Copied",
                            description: "Story link copied to clipboard!"
                          });
                        }
                      }}
                      className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          window.open('https://twitter.com/Bubbleteameimei', '_blank', 'noopener,noreferrer');
                        }}
                        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                      >
                        <FaTwitter className="h-4 w-4" />
                        <span className="sr-only">Follow on Twitter</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          window.open('https://bubbleteameimei.wordpress.com/', '_blank', 'noopener,noreferrer');
                        }}
                        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                      >
                        <FaWordpress className="h-4 w-4" />
                        <span className="sr-only">Follow on WordPress</span>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                      >
                        <a href="https://www.instagram.com/Bubbleteameimei/" target="_blank" rel="noreferrer">
                          <FaInstagram className="h-4 w-4" />
                          <span className="sr-only">Follow on Instagram</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social sharing and support section */}
            <div className={`social-support-section mt-8 pt-6 border-t border-border ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
              <SupportWritingCard authorId={resolveAuthorId(currentPost)} />
            </div>

            {/* Comment section */}
            <div className={`mt-8 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
              <SimpleCommentSection postId={currentPost.id} />
            </div>
        </motion.article>
      </div>
      <Footer />
    </div>
  );
}