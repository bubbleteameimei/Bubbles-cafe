import { useState } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
// Import recharts components
import { 
  ResponsiveContainer,
  BarChart, 
  LineChart,
  AreaChart,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  Line,
  Area,
  Pie
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartCell
} from "@/components/ui/chart";

// Type for tooltip props
interface TooltipProps<ValueType = number, NameType = string> {
  active?: boolean;
  payload?: Array<{
    value: ValueType;
    name: NameType;
    color?: string;
  }>;
  label?: string;
}
import { 
  Eye, 
  Users, 
  Clock, 
  MousePointer, 
  LayoutGrid, 
  Calendar, 
  Smartphone, 
  Laptop, 
  Tablet, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Gauge,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// Simple loading indicator component
const LoadingIndicator = () => (
  <div className="flex items-center justify-center w-full h-[50vh]">
    <div className="flex flex-col items-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
    </div>
  </div>
);

// Analytics types
interface SiteAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  avgReadTime: number;
  bounceRate: number;
  deviceDistribution: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trafficSources: {
    direct: number;
    search: number;
    social: number;
    referral: number;
  };
  pagePerformance: {
    slug: string;
    title: string;
    views: number;
    avgTime: number;
  }[];
  timeSeriesData: {
    date: string;
    views: number;
    visitors: number;
  }[];
  engagementMetrics: {
    commentsPerPost: number;
    likesPerPost: number;
    avgReadPercentage: number;
    returnRate: number;
  };
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltipContent
        active={active}
        payload={payload as any}
        label={label}
        formatter={(value) => value.toLocaleString()}
      />
    );
  }
  return null;
};

export default function SiteStatisticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("week");
  const [currentTab, setCurrentTab] = useState("overview");
  
  // Redirect if not admin
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  // Fetch analytics data
  const { data: analytics, isLoading, error } = useQuery<SiteAnalytics>({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics data');
      return res.json();
    }
  });

  // Mock time series data if it's not available in the API response
  const timeSeriesData = analytics?.timeSeriesData || [
    { date: 'Mar 8', views: 1200, visitors: 850 },
    { date: 'Mar 9', views: 1300, visitors: 900 },
    { date: 'Mar 10', views: 1500, visitors: 950 },
    { date: 'Mar 11', views: 1400, visitors: 920 },
    { date: 'Mar 12', views: 1800, visitors: 1100 },
    { date: 'Mar 13', views: 2000, visitors: 1250 },
    { date: 'Mar 14', views: 1900, visitors: 1200 },
  ];
  
  // Device distribution data
  const deviceData = analytics ? [
    { name: 'Desktop', value: analytics.deviceDistribution?.desktop || 60 },
    { name: 'Mobile', value: analytics.deviceDistribution?.mobile || 35 },
    { name: 'Tablet', value: analytics.deviceDistribution?.tablet || 5 },
  ] : [];
  
  // Traffic source data
  const trafficSourceData = analytics ? [
    { name: 'Direct', value: analytics.trafficSources?.direct || 40 },
    { name: 'Search', value: analytics.trafficSources?.search || 30 },
    { name: 'Social', value: analytics.trafficSources?.social || 20 },
    { name: 'Referral', value: analytics.trafficSources?.referral || 10 },
  ] : [];
  
  // Page performance data
  const pagePerformanceData = analytics?.pagePerformance || [];
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load analytics data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold">Site Statistics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive analytics and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 3 months</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            Export Data
          </Button>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-8">
        <TabsList className="grid grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <LayoutGrid className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center space-x-2">
            <BarChartIcon className="h-4 w-4" />
            <span>Traffic</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <PieChartIcon className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center space-x-2">
            <LineChartIcon className="h-4 w-4" />
            <span>Engagement</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                <CardTitle className="text-sm font-medium">Avg. Reading Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics && `${Math.floor(analytics.avgReadTime / 60)}m ${Math.round(analytics.avgReadTime % 60)}s`}
                </div>
                <p className="text-xs text-muted-foreground">Time spent on stories</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics ? `${Math.round(analytics.bounceRate * 100)}%` : '0%'}</div>
                <p className="text-xs text-muted-foreground">Single-page sessions</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Visitors Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Visitors & Page Views</CardTitle>
                <CardDescription>Last 7 days traffic trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <ChartTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="views" stroke="#8884d8" fillOpacity={1} fill="url(#colorViews)" />
                      <Area type="monotone" dataKey="visitors" stroke="#82ca9d" fillOpacity={1} fill="url(#colorVisitors)" />
                      <ChartLegend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          
            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>User access by device type</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-80">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: { name: string, percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <ChartCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                      <ChartLegend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Laptop className="h-4 w-4" />
                    <span className="text-sm">{deviceData[0]?.value}% Desktop</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm">{deviceData[1]?.value}% Mobile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tablet className="h-4 w-4" />
                    <span className="text-sm">{deviceData[2]?.value}% Tablet</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors come from</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trafficSourceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <ChartTooltip content={<CustomTooltip />} />
                    <ChartLegend />
                    <Bar dataKey="value" name="Percentage" fill="#8884d8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Traffic Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Trends</CardTitle>
                <CardDescription>Daily website traffic patterns</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<CustomTooltip />} />
                    <ChartLegend />
                    <Line type="monotone" dataKey="views" stroke="#8884d8" activeDot={{ r: 8 }} name="Views" />
                    <Line type="monotone" dataKey="visitors" stroke="#82ca9d" name="Visitors" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Geographic Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Top regions by visitor count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>United States</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">45%</span>
                      <Badge variant="outline" className="text-xs">
                        +5.2%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span>United Kingdom</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">15%</span>
                      <Badge variant="outline" className="text-xs">
                        +1.8%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={15} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span>Canada</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">12%</span>
                      <Badge variant="outline" className="text-xs">
                        +2.3%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={12} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span>Australia</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">8%</span>
                      <Badge variant="outline" className="text-xs">
                        +0.5%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={8} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span>Germany</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">5%</span>
                      <Badge variant="outline" className="text-xs">
                        +1.1%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Top Performing Content */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Most viewed stories and pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pagePerformanceData.length > 0 ? (
                  <div className="space-y-4">
                    {pagePerformanceData.map((page, index) => (
                      <div key={index} className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">{index + 1}.</span>
                            <span className="font-medium">{page.title}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span>{page.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{Math.floor(page.avgTime / 60)}m {Math.round(page.avgTime % 60)}s</span>
                            </div>
                          </div>
                        </div>
                        <Progress value={(page.views / Math.max(...pagePerformanceData.map(p => p.views))) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No content performance data available.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Content Categories */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Content Categories</CardTitle>
                <CardDescription>Performance by story category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Psychological', value: 35 },
                        { name: 'Supernatural', value: 25 },
                        { name: 'Body Horror', value: 20 },
                        { name: 'Gothic', value: 10 },
                        { name: 'Other', value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: { name: string, percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <ChartCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                    <ChartLegend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Publication Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Publication Analysis</CardTitle>
                <CardDescription>Views by publication day</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { day: 'Mon', views: 850 },
                    { day: 'Tue', views: 740 },
                    { day: 'Wed', views: 900 },
                    { day: 'Thu', views: 1200 },
                    { day: 'Fri', views: 1500 },
                    { day: 'Sat', views: 1300 },
                    { day: 'Sun', views: 1100 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Bar dataKey="views" name="Views" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Comments per Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.engagementMetrics?.commentsPerPost.toFixed(1) || "5.7"}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Likes per Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.engagementMetrics?.likesPerPost.toFixed(1) || "12.4"}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg. Read %</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.engagementMetrics?.avgReadPercentage.toFixed(0) || "76"}%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Return Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.engagementMetrics?.returnRate.toFixed(0) || "42"}%
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Reading Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Reading Patterns</CardTitle>
                <CardDescription>Time of day analysis</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { hour: '00:00', users: 120 },
                    { hour: '03:00', users: 80 },
                    { hour: '06:00', users: 150 },
                    { hour: '09:00', users: 350 },
                    { hour: '12:00', users: 420 },
                    { hour: '15:00', users: 380 },
                    { hour: '18:00', users: 490 },
                    { hour: '21:00', users: 520 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} name="Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* User Retention */}
            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Weekly user return rate</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { week: 'Week 1', returnRate: 100 },
                    { week: 'Week 2', returnRate: 75 },
                    { week: 'Week 3', returnRate: 50 },
                    { week: 'Week 4', returnRate: 42 },
                    { week: 'Week 5', returnRate: 40 },
                    { week: 'Week 6', returnRate: 38 },
                    { week: 'Week 7', returnRate: 35 },
                    { week: 'Week 8', returnRate: 30 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Bar dataKey="returnRate" name="Return Rate %" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}