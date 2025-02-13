import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DashboardStats {
  totalUsers: number;
  totalStories: number;
  totalComments: number;
  pendingStories: number;
  pendingComments: number;
  activeUsers: number;
}

export default function AdminDashboardV2() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [, navigate] = useLocation();

  const { 
    data: stats, 
    isLoading: statsLoading,
    error: statsError 
  } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/v2/stats"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/v2/stats");
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Admin stats error:", errorData);
          throw new Error(errorData.message || 'Failed to fetch admin statistics');
        }
        return response.json();
      } catch (error) {
        console.error("Admin stats error:", error);
        throw error;
      }
    },
    enabled: !!user?.isAdmin,
    retry: 1
  });

  useEffect(() => {
    if (!authLoading && !user?.isAdmin) {
      console.log("Unauthorized access attempt, redirecting to login");
      navigate("/admin/login");
    }
  }, [user?.isAdmin, authLoading, navigate]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not admin, don't render anything while redirecting
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard v2</h2>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {statsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load dashboard statistics. Please try again later.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      stats?.totalUsers.toLocaleString()
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      stats?.totalStories.toLocaleString()
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : stats && (
                      <div className="flex items-center gap-2">
                        <span>{stats.pendingStories + stats.pendingComments}</span>
                        <span className="text-sm text-muted-foreground">
                          ({stats.pendingStories} stories, {stats.pendingComments} comments)
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      stats?.activeUsers.toLocaleString()
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  User management features coming soon
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Content management features coming soon
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Activity logging features coming soon
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}