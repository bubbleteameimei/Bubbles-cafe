import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Redirect } from "wouter";
import { Users, Clock, Eye, Monitor, ArrowDownUp, Bell, Activity, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ActivityTimeline, ActivityLog } from "@/components/admin/activity-timeline";

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

interface Notification {
  id: number;
  message: string;
  createdAt: string;
  type: 'info' | 'warning' | 'error';
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = !!user?.isAdmin;

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery<SiteAnalytics>({
    queryKey: ["/api/admin/analytics"],
    enabled: isAdmin,
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/admin/notifications"],
    enabled: isAdmin,
  });

  const { data: activityLogs = [], isLoading: logsLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity"],
    enabled: isAdmin,
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest('POST', `/api/admin/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
    }
  });

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  if (analyticsLoading || notificationsLoading || logsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin mb-4" aria-hidden="true" />
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            Failed to load analytics data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
            <div className="grid grid-cols-3 gap-4" role="list">
              <div role="listitem">
                <p className="text-sm font-medium">Desktop</p>
                <div className="text-2xl font-bold">
                  {((analytics?.deviceStats.desktop || 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div role="listitem">
                <p className="text-sm font-medium">Mobile</p>
                <div className="text-2xl font-bold">
                  {((analytics?.deviceStats.mobile || 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div role="listitem">
                <p className="text-sm font-medium">Tablet</p>
                <div className="text-2xl font-bold">
                  {((analytics?.deviceStats.tablet || 0) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Recent system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No new notifications</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start justify-between gap-4 p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead.mutate(notification.id)}
                        disabled={markAsRead.isPending}
                        aria-label="Mark notification as read"
                      >
                        Mark as read
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Log</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Recent admin activities and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full">
              {activityLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No activity logs found</p>
              ) : (
                <ActivityTimeline 
                  activities={activityLogs.map(log => ({
                    id: log.id,
                    timestamp: log.timestamp,
                    action: log.action,
                    performedBy: log.performedBy,
                    details: log.details
                  }))}
                  className="pb-4"
                />
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}