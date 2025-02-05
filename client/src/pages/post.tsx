import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Post } from "@shared/schema";
import CommentSection from "@/components/blog/comment-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import Mist from "@/components/effects/mist";

export default function PostPage() {
  const [, params] = useRoute("/post/:slug");
  const { data: post, isLoading } = useQuery<Post>({
    queryKey: ["/api/posts", params?.slug],
    enabled: !!params?.slug
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="relative">
      <Mist />
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/post/${post.slug}`}>{post.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <article className="prose prose-invert mx-auto mt-8">
        <h1>{post.title}</h1>
        <div className="whitespace-pre-wrap">{post.content}</div>
      </article>

      <CommentSection postId={post.id} />
    </div>
  );
}
