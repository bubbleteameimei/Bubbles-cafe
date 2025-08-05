import { Card } from './ui/card';

interface PostViewProps {
  post: {
    id: number;
    title: string;
    content: string;
    excerpt?: string;
    createdAt: Date;
    author?: {
      username: string;
    };
    likesCount?: number;
    commentsCount?: number;
  };
}

export function PostView({ post }: PostViewProps) {
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </Card>
  );
}