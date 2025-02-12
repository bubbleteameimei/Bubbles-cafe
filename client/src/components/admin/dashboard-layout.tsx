import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

interface DashboardStats {
  totalUsers: number;
  totalStories: number;
  totalComments: number;
  pendingStories: number;
  pendingComments: number;
  activeUsers: number;
}

export function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-sm font-medium">Total Users</h3>
              <div className="mt-2 text-2xl font-bold">
                {stats ? stats.totalUsers.toLocaleString() : <Skeleton className="h-8 w-20" />}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Total Stories</h3>
              <div className="mt-2 text-2xl font-bold">
                {stats ? stats.totalStories.toLocaleString() : <Skeleton className="h-8 w-20" />}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Pending Reviews</h3>
              <div className="mt-2 text-2xl font-bold">
                {stats ? (
                  <>
                    <span className="text-orange-500">{stats.pendingStories}</span>
                    <span className="text-sm text-muted-foreground ml-2">stories</span>
                    <span className="text-orange-500 ml-4">{stats.pendingComments}</span>
                    <span className="text-sm text-muted-foreground ml-2">comments</span>
                  </>
                ) : (
                  <Skeleton className="h-8 w-20" />
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <div className="rounded-lg border p-8">
            <h3 className="text-xl font-semibold mb-4">User Management</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </TabsContent>
        <TabsContent value="content" className="space-y-4">
          <div className="rounded-lg border p-8">
            <h3 className="text-xl font-semibold mb-4">Content Management</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </TabsContent>
        <TabsContent value="logs" className="space-y-4">
          <div className="rounded-lg border p-8">
            <h3 className="text-xl font-semibold mb-4">Activity Logs</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
