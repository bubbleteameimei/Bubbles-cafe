import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Recent Posts</h2>
          <ul className="space-y-2">
            {data?.recentPosts?.map((post: any) => (
              <li key={post.id} className="text-sm">
                {post.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Recent Comments</h2>
          <ul className="space-y-2">
            {data?.recentComments?.map((comment: any) => (
              <li key={comment.id} className="text-sm">
                {comment.content.substring(0, 50)}...
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Admin Users</h2>
          <ul className="space-y-2">
            {data?.adminUsers?.map((admin: any) => (
              <li key={admin.id} className="text-sm">
                {admin.username} ({admin.email})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
