import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";

interface AdminStats {
  totalUsers: number;
  totalStories: number;
  pendingComments: number;
  recentActivity: Array<{
    description: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Verify admin status
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Registered users count</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Stories</CardTitle>
            <CardDescription>Published stories count</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalStories || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>Pending approval</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.pendingComments || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity?.map((activity, index) => (
              <div key={index} className="py-2 border-b last:border-0">
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}