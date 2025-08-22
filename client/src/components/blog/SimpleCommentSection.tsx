import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { applyCSRFToken, fetchCsrfTokenIfNeeded } from "@/lib/csrf-token";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  MessageSquare,
  Reply,
  Calendar,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Expand,
  AlertCircle
} from "lucide-react";

let useAuth: any;
try {
  useAuth = require("@/hooks/use-auth").useAuth;
} catch {
  useAuth = () => ({ user: null, isAuthenticated: false });
}

interface CommentMetadata {
  moderated: boolean;
  originalContent: string;
  isAnonymous: boolean;
  author: string;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  votes?: { upvotes: number; downvotes: number };
  ownerKey?: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date | string;
  metadata: CommentMetadata;
  is_approved?: boolean;
  approved?: boolean;
  parentId: number | null;
  replies?: Comment[];
  isOwner?: boolean;
  edited?: boolean;
  editedAt?: Date | string | null;
  postId?: number | null;
  userId?: number | null;
}

interface SimpleCommentSectionProps {
  postId: number;
}

function checkModeration(text: string): { isFlagged: boolean; isUnderReview: boolean } {
  const t = (text || "").toLowerCase();
  const flaggedWords = ["spam", "scam", "hate", "abuse"];
  const isFlagged = flaggedWords.some((w) => t.includes(w));
  return { isFlagged, isUnderReview: isFlagged };
}

function formatTime(dateStr: string | Date): string {
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function SimpleCommentSection({ postId }: SimpleCommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"recent" | "active">("active");
  const [collapsedComments, setCollapsedComments] = useState<number[]>([]);
  const [autoCollapsing, setAutoCollapsing] = useState(false);
  const [flaggedComments, setFlaggedComments] = useState<number[]>([]);

  useEffect(() => {
    fetchCsrfTokenIfNeeded().catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("flaggedComments_" + postId);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setFlaggedComments(parsed);
      }
    } catch {}
  }, [postId]);

  // CSRF-aware fetch with single retry on 401/403
  async function csrfFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    await fetchCsrfTokenIfNeeded().catch(() => {});
    const attempt = async () => fetch(input, applyCSRFToken({ ...init, credentials: 'include' }));
    let res = await attempt();
    if (res.status === 401 || res.status === 403) {
      await fetchCsrfTokenIfNeeded().catch(() => {});
      res = await attempt();
    }
    return res;
  }

  const { data: comments = [], isLoading, error } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}/comments`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : data?.comments || [];
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 15_000
  });

  const rootComments = useMemo(
    () => (comments || []).filter((c) => c.parentId === null).filter((c) => (c.approved ?? c.is_approved) !== false),
    [comments]
  );

  const repliesByParentId = useMemo(() => {
    const map: Record<number, Comment[]> = {};
    (comments || [])
      .filter((c) => c.parentId !== null)
      .forEach((r) => {
        const pid = r.parentId!;
        if (!map[pid]) map[pid] = [];
        map[pid].push(r);
      });
    return map;
  }, [comments]);

  // Render nested replies up to a reasonable depth (preserve current look)
  const renderNestedReplies = (parentId: number, depth: number): JSX.Element | null => {
    const children = repliesByParentId[parentId];
    if (!children || children.length === 0 || depth > 3) return null;
    return (
      <div className="mt-3 space-y-4 pl-4 border-l-2 border-muted/30">
        {children.map((reply) => (
          <div key={reply.id} className="relative">
            <div className="absolute -left-[25px] top-2 h-2 w-2 rounded-full bg-primary/60"></div>
            <div className="flex gap-3">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {(reply.metadata.author || "A")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted/10 rounded-lg p-3 border border-border/30">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <strong className="text-xs sm:text-sm font-medium">{reply.metadata.author || "Anonymous"}</strong>
                  <span className="text-[10px] text-muted-foreground">{formatTime(reply.createdAt)}</span>
                </div>
                <p className="text-xs sm:text-sm text-card-foreground mt-2 leading-relaxed whitespace-pre-line">{reply.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => vote(reply.id, true)}>
                    +{reply.metadata?.votes?.upvotes ?? reply.metadata?.upvotes ?? 0}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => vote(reply.id, false)}>
                    -{reply.metadata?.votes?.downvotes ?? reply.metadata?.downvotes ?? 0}
                  </Button>
                </div>
                {renderNestedReplies(reply.id, depth + 1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const sortedRootComments = useMemo(() => {
    const list = [...rootComments];
    if (sortOrder === "active") {
      list.sort((a, b) => (repliesByParentId[b.id]?.length || 0) - (repliesByParentId[a.id]?.length || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
    }
    return list;
  }, [rootComments, repliesByParentId, sortOrder]);

  // Performance: render root comments in chunks
  const [visibleRootCount, setVisibleRootCount] = useState<number>(20);
  const visibleRootComments = useMemo(() => sortedRootComments.slice(0, visibleRootCount), [sortedRootComments, visibleRootCount]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const author = isAuthenticated && user ? user.username : "Anonymous";
      await fetchCsrfTokenIfNeeded();
      const { isFlagged, isUnderReview } = checkModeration(content);
      const res = await csrfFetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          author,
          needsModeration: isFlagged || isUnderReview,
          moderationStatus: isFlagged ? "flagged" : isUnderReview ? "under_review" : "none"
        })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      const previous = queryClient.getQueryData<Comment[]>([`/api/posts/${postId}/comments`]) || [];
      const optimistic: Comment = {
        id: Date.now(),
        content,
        postId: Number(postId),
        userId: null,
        createdAt: new Date(),
        parentId: null,
        is_approved: true,
        edited: false,
        editedAt: null,
        metadata: { author: isAuthenticated && user ? user.username : "Anonymous", upvotes: 0, downvotes: 0, replyCount: 0, moderated: false, originalContent: content, isAnonymous: !isAuthenticated, ownerKey: "optimistic" }
      } as unknown as Comment;
      queryClient.setQueryData<Comment[]>([`/api/posts/${postId}/comments`], [optimistic, ...previous]);
      return { previous } as { previous: Comment[] };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData([`/api/posts/${postId}/comments`], ctx.previous);
      toast({ title: "Failed to post comment", description: "Please try again.", variant: "destructive" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setContent("");
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ parentId, reply }: { parentId: number; reply: string }) => {
      await fetchCsrfTokenIfNeeded();
      const author = isAuthenticated && user ? user.username : "Anonymous";
      const res = await csrfFetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply.trim(), author, parentId })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] })
  });

  const editMutation = useMutation({
    mutationFn: async ({ commentId, newContent }: { commentId: number; newContent: string }) => {
      await fetchCsrfTokenIfNeeded();
      const res = await csrfFetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent.trim() })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setEditingCommentId(null);
      setEditContent("");
      toast({ title: "Updated", description: "Comment updated." });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await fetchCsrfTokenIfNeeded();
      const res = await csrfFetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error(await res.text());
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      toast({ title: "Deleted", description: "Comment deleted." });
    }
  });

  const vote = async (commentId: number, isUpvote: boolean) => {
    try {
      await fetchCsrfTokenIfNeeded();
      const res = await csrfFetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isUpvote })
      });
      if (!res.ok) throw new Error("Vote failed");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
    } catch (e) {
      toast({ title: "Error", description: (e as Error)?.message || "Failed to vote.", variant: "destructive" });
    }
  };

  const flagMutation = useMutation({
    mutationFn: async ({ commentId, reason }: { commentId: number; reason?: string }) => {
      await fetchCsrfTokenIfNeeded();
      const res = await csrfFetch(`/api/comments/${commentId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "inappropriate content" })
      });
      if (!res.ok) throw new Error(await res.text());
      return true;
    },
    onSuccess: (_data, vars) => {
      setFlaggedComments((prev) => {
        const next = prev.includes(vars.commentId) ? prev : [...prev, vars.commentId];
        try { localStorage.setItem("flaggedComments_" + postId, JSON.stringify(next)); } catch {}
        return next;
      });
      toast({ title: "Reported", description: "Thanks for reporting this comment." });
    }
  });

  const toggleCollapse = (id: number) => {
    setCollapsedComments((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const mainRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (autoCollapsing || collapsedComments.length > 0) return;
      const el = mainRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight * 1.2) {
        setAutoCollapsing(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [autoCollapsing, collapsedComments.length]);

  return (
    <div className="antialiased mx-auto" ref={mainRef}>
      <div className="border-t border-border/30 pt-4 pb-1.5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-medium">Comments ({rootComments.length})</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-1.5 text-[10px]"
              onClick={() => setSortOrder((s) => (s === "active" ? "recent" : "active"))}
            >
              Sort: {sortOrder === "active" ? "Most Active" : "Most Recent"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-1.5 text-[10px]"
              onClick={() => {
                if (collapsedComments.length > 0 || autoCollapsing) {
                  setCollapsedComments([]);
                  setAutoCollapsing(false);
                } else {
                  setCollapsedComments(rootComments.map((c) => c.id));
                }
              }}
            >
              {collapsedComments.length > 0 || autoCollapsing ? (
                <>
                  <Expand className="h-3 w-3 mr-1" /> Expand All
                </>
              ) : (
                <>
                  <Minimize2 className="h-3 w-3 mr-1" /> Collapse All
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="mb-6 p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-start gap-3">
            <Avatar className="rounded-full w-8 h-8 border">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {(isAuthenticated && user?.username ? user.username[0] : "A").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[90px] bg-background/80"
              />
              {/* Moderation hint below the textarea (keeps current look minimal) */}
              <div className="mt-1 flex items-center gap-2">
                {checkModeration(content).isFlagged ? (
                  <Badge variant="destructive" className="text-[10px]">Contains flagged words; may be held for review</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Be respectful. Comments may be held for review.</span>
                )}
              </div>
              {/* Moderation preview box when flagged content is detected */}
              {(() => {
                const { isFlagged, isUnderReview, moderated } = checkModeration(content as any);
                if (!content.trim() || (!isFlagged && !isUnderReview)) return null;
                return (
                  <div className="mt-2 rounded-md border border-amber-300/50 bg-amber-50/60 dark:bg-amber-900/10 p-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Your comment may be moderated for review</span>
                    </div>
                    <div className="mt-1 ml-5 space-y-1">
                      <p className="text-xs text-amber-800/90 dark:text-amber-200/90">
                        Contains potentially inappropriate language. You can edit it before posting.
                      </p>
                      {moderated && (
                        <p className="text-xs text-amber-900/90 dark:text-amber-100/90">
                          Moderated preview: {moderated}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div className="mt-2 flex items-center justify-end">
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || content.trim().length === 0}
                  className="shadow-sm"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center bg-card/50">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">Failed to load comments. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] })}>
            Try Again
          </Button>
        </Card>
      ) : rootComments.length === 0 ? (
        <Card className="p-8 text-center bg-card/50">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-muted/50 p-4 mb-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium text-card-foreground mb-2">No comments yet</h4>
            <p className="text-muted-foreground mb-2">Be the first to share your thoughts.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {visibleRootComments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <Card className="shadow-sm border-border/50 overflow-hidden">
                <div
                  className="bg-muted/30 px-4 py-2 flex items-center justify-between border-b border-border/30 cursor-pointer"
                  onClick={() => toggleCollapse(comment.id)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="rounded-full w-7 h-7 border-2 border-background">
                      <AvatarFallback className="text-sm bg-primary/10 text-primary">
                        {(comment.metadata.author || "A")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <strong className="text-sm font-medium text-card-foreground">{comment.metadata.author || "Anonymous"}</strong>
                      <p className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-2 bg-background/50">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(comment.createdAt as any).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </Badge>
                    {collapsedComments.includes(comment.id) || autoCollapsing ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/80" />
                    ) : (
                      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/80" />
                    )}
                  </div>
                </div>

                {!(collapsedComments.includes(comment.id) || autoCollapsing) && (
                  <div className="px-4 py-3">
                    {editingCommentId === comment.id ? (
                      <div className="mb-2">
                        <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="text-sm bg-background/80 min-h-[80px]" />
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (!editContent.trim()) {
                                toast({ title: "Missing content", description: "Please enter some text.", variant: "destructive" });
                                return;
                              }
                              editMutation.mutate({ commentId: comment.id, newContent: editContent });
                            }}
                          >
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setEditingCommentId(null); setEditContent(""); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-line">{comment.content}</p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => vote(comment.id, true)}>
                          +{comment.metadata?.votes?.upvotes ?? comment.metadata?.upvotes ?? 0}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => vote(comment.id, false)}>
                          -{comment.metadata?.votes?.downvotes ?? comment.metadata?.downvotes ?? 0}
                        </Button>
                        <Separator orientation="vertical" className="h-4" />
                        <Button variant="ghost" size="sm" className="gap-1 text-sm hover:bg-primary/5" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                          <Reply className="h-3.5 w-3.5" /> Reply
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={flaggedComments.includes(comment.id)}
                          onClick={() => flagMutation.mutate({ commentId: comment.id })}
                        >
                          {flaggedComments.includes(comment.id) ? "Reported" : "Report"}
                        </Button>
                        {comment.isOwner && (
                          <>
                            {editingCommentId === comment.id ? null : (
                              <Button variant="ghost" size="sm" onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.content); }}>
                                Edit
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Delete this comment?")) deleteMutation.mutate(comment.id);
                              }}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {replyingTo === comment.id && (
                      <div className="space-y-2 ml-8 mt-3 border-l-2 border-primary/10 pl-4">
                        <div className="flex gap-3">
                          <Avatar className="w-6 h-6 flex-shrink-0">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">{(isAuthenticated && user?.username ? user.username[0] : "Y").toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <form
                            className="flex-1"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.currentTarget as HTMLFormElement;
                              const fd = new FormData(form);
                              const text = String(fd.get("reply") || "");
                              if (!text.trim()) return;
                              replyMutation.mutate({ parentId: comment.id, reply: text });
                              form.reset();
                              setReplyingTo(null);
                            }}
                          >
                            <Card className="p-3 bg-muted/10 border-border/50">
                              <Textarea name="reply" placeholder="Write your reply..." className="min-h-[80px] bg-background/80" />
                              <div className="mt-2 flex gap-2 justify-end">
                                <Button type="button" variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                                  Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={replyMutation.isPending}>
                                  {replyMutation.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                                    </>
                                  ) : (
                                    "Post Reply"
                                  )}
                                </Button>
                              </div>
                            </Card>
                          </form>
                        </div>
                      </div>
                    )}

                    {repliesByParentId[comment.id] && repliesByParentId[comment.id].length > 0 && (
                      <>
                        <div className="flex items-center gap-2 mt-6 mb-4">
                          <Separator className="flex-grow" />
                          <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                            Replies ({repliesByParentId[comment.id].length})
                          </span>
                          <Separator className="flex-grow" />
                        </div>
                        <div className="space-y-4 pl-4 border-l-2 border-muted/30">
                          {repliesByParentId[comment.id].map((reply) => (
                            <div key={reply.id} className="relative">
                              <div className="absolute -left-[25px] top-2 h-2 w-2 rounded-full bg-primary/60"></div>
                              <div className="flex gap-3">
                                <Avatar className="h-6 w-6 flex-shrink-0">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {(reply.metadata.author || "A")[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted/10 rounded-lg p-3 border border-border/30">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <strong className="text-xs sm:text-sm font-medium">{reply.metadata.author || "Anonymous"}</strong>
                                    <span className="text-[10px] text-muted-foreground">{formatTime(reply.createdAt)}</span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-card-foreground mt-2 leading-relaxed whitespace-pre-line">{reply.content}</p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => vote(reply.id, true)}>
                                      +{reply.metadata?.votes?.upvotes ?? reply.metadata?.upvotes ?? 0}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => vote(reply.id, false)}>
                                      -{reply.metadata?.votes?.downvotes ?? reply.metadata?.downvotes ?? 0}
                                    </Button>
                                  </div>
                                  {renderNestedReplies(reply.id, 1)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            </div>
          ))}
          {sortedRootComments.length > visibleRootCount && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setVisibleRootCount((c) => c + 20)}>
                Load more comments ({sortedRootComments.length - visibleRootCount} more)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}