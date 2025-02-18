import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Redirect } from "wouter";
import { Loader2, TrendingUp, Users, Clock, Eye, Monitor, ArrowDownUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SiteAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  avgReadTime: number;
  bounceRate: number;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useQuery<SiteAnalytics>({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total page views across all stories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.uniqueVisitors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Distinct readers on the platform</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Read Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.avgReadTime.toFixed(1)} min</div>
              <p className="text-xs text-muted-foreground">Average time spent reading stories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analytics?.bounceRate || 0).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Percentage of single-page sessions</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Device Distribution</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Desktop</p>
                  <div className="text-2xl font-bold">
                    {((analytics?.deviceStats.desktop || 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Mobile</p>
                  <div className="text-2xl font-bold">
                    {((analytics?.deviceStats.mobile || 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Tablet</p>
                  <div className="text-2xl font-bold">
                    {((analytics?.deviceStats.tablet || 0) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}