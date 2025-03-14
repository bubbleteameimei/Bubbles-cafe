import { useAuth } from "@/hooks/use-auth";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { useQuery } from "@tanstack/react-query";
import { 
  Loader2, 
  Users, 
  FileText, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  AlertTriangle,
  TrendingUp,
  Activity, 
  User,
  Calendar,
  Clock,
  BarChart4,
  BookOpen,
  Flag
} from "lucide-react";
import { Redirect } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

// Mock data for the chart
const activityData = [
  { name: 'Mon', visits: 20, comments: 5, likes: 10 },
  { name: 'Tue', visits: 15, comments: 3, likes: 7 },
  { name: 'Wed', visits: 25, comments: 7, likes: 12 },
  { name: 'Thu', visits: 30, comments: 10, likes: 15 },
  { name: 'Fri', visits: 22, comments: 6, likes: 11 },
  { name: 'Sat', visits: 18, comments: 4, likes: 8 },
  { name: 'Sun', visits: 28, comments: 8, likes: 14 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("week");
  
  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/info'],
    queryFn: async () => {
      const res = await fetch('/api/admin/info');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    }
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics data');
      return res.json();
    }
  });

  const { data: activityLogs, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/activity'],
    queryFn: async () => {
      const res = await fetch('/api/admin/activity');
      if (!res.ok) throw new Error('Failed to fetch activity data');
      return res.json();
    }
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground">Unable to load dashboard data. Please try again later.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={data?.totalUsers || 0}
          description="Active user accounts"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={+7.2}
        />
        <StatsCard
          title="Total Stories"
          value={data?.totalPosts || 0}
          description="Published stories"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          trend={+12.5}
        />
        <StatsCard
          title="Total Comments"
          value={data?.totalComments || 0}
          description="User interactions"
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
          trend={+24.3}
        />
        <StatsCard
          title="Total Likes"
          value={data?.totalLikes || 0}
          description="Story engagements"
          icon={<ThumbsUp className="h-4 w-4 text-muted-foreground" />}
          trend={+18.7}
        />
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
                <CardDescription>
                  Site traffic and engagement metrics for the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line type="monotone" dataKey="comments" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="likes" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Content */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Content</CardTitle>
                <CardDescription>
                  The latest stories and submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[324px] pr-4">
                  <div className="space-y-4">
                    {data?.recentPosts?.map((post: any) => (
                      <div key={post.id} className="flex items-center justify-between space-x-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{post.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {post.metadata?.themeCategory || 'Story'}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin/content'}>
                  View All Content
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Comments</CardTitle>
                <CardDescription>Latest user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    {data?.recentComments?.map((comment: any) => (
                      <div key={comment.id} className="border-b pb-2 mb-2 last:border-b-0 last:mb-0 last:pb-0">
                        <p className="text-sm">{comment.content.substring(0, 60)}...</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {comment.userId ? `User #${comment.userId}` : 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(comment.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" 
                  onClick={() => window.location.href = '/admin/content-moderation'}>
                  Moderate Comments
                </Button>
              </CardFooter>
            </Card>

            {/* Admin Users */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Team</CardTitle>
                <CardDescription>Active administrators</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    {data?.adminUsers?.map((admin: any) => (
                      <div key={admin.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{admin.username}</p>
                          <p className="text-xs text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full"
                  onClick={() => window.location.href = '/admin/users'}>
                  Manage Users
                </Button>
              </CardFooter>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" 
                  onClick={() => window.location.href = '/admin/posts'}>
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Stories
                </Button>
                <Button variant="outline" className="w-full justify-start"
                  onClick={() => window.location.href = '/admin/bug-reports'}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Bug Reports
                </Button>
                <Button variant="outline" className="w-full justify-start"
                  onClick={() => window.location.href = '/admin/feedback'}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  User Feedback
                </Button>
                <Button variant="outline" className="w-full justify-start"
                  onClick={() => window.location.href = '/admin/content-moderation'}>
                  <Flag className="mr-2 h-4 w-4" />
                  Content Moderation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Site traffic and engagement over time</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={dateRange === "week" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setDateRange("week")}
                    >
                      Week
                    </Button>
                    <Button 
                      variant={dateRange === "month" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setDateRange("month")}
                    >
                      Month
                    </Button>
                    <Button 
                      variant={dateRange === "year" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setDateRange("year")}
                    >
                      Year
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visits" fill="#8884d8" name="Page Views" />
                    <Bar dataKey="comments" fill="#82ca9d" name="Comments" />
                    <Bar dataKey="likes" fill="#ffc658" name="Likes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Visitor Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Visitor Statistics</CardTitle>
                <CardDescription>User demographics and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Desktop</div>
                    <div className="text-sm text-muted-foreground">65%</div>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Mobile</div>
                    <div className="text-sm text-muted-foreground">30%</div>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Tablet</div>
                    <div className="text-sm text-muted-foreground">5%</div>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full"
                  onClick={() => window.location.href = '/admin/analytics'}>
                  <BarChart4 className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Button>
              </CardFooter>
            </Card>

            {/* Popular Content */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Content</CardTitle>
                <CardDescription>Most viewed stories</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[220px]">
                  <div className="space-y-4">
                    {analyticsLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <Skeleton className="h-5 w-[200px]" />
                          <Skeleton className="h-5 w-[50px]" />
                        </div>
                      ))
                    ) : (
                      analyticsData?.popularContent?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {item.title.length > 30 ? `${item.title.slice(0, 30)}...` : item.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">{item.views}</span>
                            <span className="text-xs text-muted-foreground">views</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>User interaction statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Avg. Time on Page</span>
                  </div>
                  <span className="text-sm font-medium">3m 42s</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Bounce Rate</span>
                  </div>
                  <span className="text-sm font-medium">32.4%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Comments per Post</span>
                  </div>
                  <span className="text-sm font-medium">8.7</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ThumbsUp className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Likes per Post</span>
                  </div>
                  <span className="text-sm font-medium">24.2</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-8">
                  {activityLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    ))
                  ) : (
                    data?.recentActivity?.map((activity: any, index: number) => (
                      <div key={index} className="relative pl-6 pb-6 last:pb-0">
                        {/* Timeline line */}
                        {index !== data.recentActivity.length - 1 && (
                          <div className="absolute left-2 top-2 h-full w-[1px] bg-border"></div>
                        )}
                        
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-2 h-4 w-4 rounded-full border border-primary bg-background"></div>
                        
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            By {activity.performedBy} • {new Date(activity.timestamp).toLocaleString()}
                          </p>
                          {activity.details && (
                            <p className="text-xs mt-1 bg-muted p-2 rounded-md">{activity.details}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  description, 
  icon,
  trend
}: { 
  title: string; 
  value: number; 
  description: string; 
  icon: React.ReactNode;
  trend: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend > 0 ? (
            <div className="text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{trend}%
            </div>
          ) : (
            <div className="text-xs text-red-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              {trend}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-[120px]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Skeleton className="h-10 w-[300px] mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px] mb-2" />
                <Skeleton className="h-4 w-[250px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px] mb-2" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-5 w-[200px]" />
                      <Skeleton className="h-5 w-[50px]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
