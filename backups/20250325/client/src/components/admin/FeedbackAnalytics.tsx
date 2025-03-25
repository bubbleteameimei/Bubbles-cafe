import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeedbackAnalyticsProps {
  data?: any;
  isLoading?: boolean;
  isError?: boolean;
  refetch?: () => void;
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="text-sm font-medium">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function FeedbackAnalytics({ 
  data,
  isLoading = false, 
  isError = false, 
  refetch 
}: FeedbackAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('last30days');

  // Process data for charts
  const processData = () => {
    if (!data?.feedback || data.feedback.length === 0) {
      return {
        byType: [],
        byStatus: [],
        byCategory: [],
        byBrowser: [],
        byOS: [],
        byPage: [],
        timeline: [],
      };
    }

    // Organize counts by type
    const typeCount: Record<string, number> = {};
    data.feedback.forEach((item: any) => {
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
    });
    const byType = Object.entries(typeCount).map(([name, value]) => ({ name, value }));

    // Organize counts by status
    const statusCount: Record<string, number> = {};
    data.feedback.forEach((item: any) => {
      statusCount[item.status] = (statusCount[item.status] || 0) + 1;
    });
    const byStatus = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    // Organize counts by category
    const categoryCount: Record<string, number> = {};
    data.feedback.forEach((item: any) => {
      categoryCount[item.category || 'general'] = (categoryCount[item.category || 'general'] || 0) + 1;
    });
    const byCategory = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

    // Organize counts by browser
    const browserCount: Record<string, number> = {};
    data.feedback.forEach((item: any) => {
      browserCount[item.browser || 'unknown'] = (browserCount[item.browser || 'unknown'] || 0) + 1;
    });
    const byBrowser = Object.entries(browserCount).map(([name, value]) => ({ name, value }));

    // Organize counts by operating system
    const osCount: Record<string, number> = {};
    data.feedback.forEach((item: any) => {
      osCount[item.operatingSystem || 'unknown'] = (osCount[item.operatingSystem || 'unknown'] || 0) + 1;
    });
    const byOS = Object.entries(osCount).map(([name, value]) => ({ name, value }));

    // Organize counts by page
    const pageCount: Record<string, number> = {};
    data.feedback.forEach((item: any) => {
      pageCount[item.page || '/'] = (pageCount[item.page || '/'] || 0) + 1;
    });
    const byPage = Object.entries(pageCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 pages

    // Create timeline data
    const dateCount: Record<string, number> = {};
    data.feedback.forEach((item: any) => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      dateCount[date] = (dateCount[date] || 0) + 1;
    });

    // Convert to sorted array and fill missing dates
    const sortedDates = Object.keys(dateCount).sort();
    const timeline = [];

    if (sortedDates.length > 0) {
      const startDate = new Date(sortedDates[0]);
      const endDate = new Date();
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        timeline.push({
          date: dateString,
          count: dateCount[dateString] || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return {
      byType,
      byStatus,
      byCategory,
      byBrowser,
      byOS,
      byPage,
      timeline,
    };
  };

  const chartData = processData();

  // Calculate summary metrics
  const calculateMetrics = () => {
    if (!data?.feedback || data.feedback.length === 0) {
      return {
        total: 0,
        avgResponseTime: 0,
        resolutionRate: 0,
        changeRate: 0,
      };
    }

    const total = data.feedback.length;
    const resolved = data.feedback.filter((item: any) => item.status === 'resolved').length;
    const resolutionRate = (resolved / total) * 100;

    // This is a placeholder - actual response time would require additional data
    const avgResponseTime = 24; // Hours

    // Week-over-week change (placeholder)
    const changeRate = 5.2; // Percent

    return {
      total,
      avgResponseTime,
      resolutionRate,
      changeRate,
    };
  };

  const metrics = calculateMetrics();

  // Color configurations for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  const STATUS_COLORS = {
    pending: '#F59E0B',
    reviewed: '#3B82F6',
    resolved: '#10B981',
    rejected: '#EF4444',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-md" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-md" />
          <Skeleton className="h-80 w-full rounded-md" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-700 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p>There was a problem loading the analytics data. Please try again.</p>
          <Button 
            variant="outline" 
            onClick={() => refetch && refetch()} 
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Feedback Analytics
        </h2>
        <div className="flex items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch && refetch()}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-bold">{metrics.total}</p>
              <Badge variant="outline" className="text-xs">
                {metrics.changeRate >= 0 ? '+' : ''}{metrics.changeRate}% from last week
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-bold">{metrics.avgResponseTime}h</p>
              <Badge variant="outline" className="text-xs">
                Target: 48h
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-bold">{metrics.resolutionRate.toFixed(1)}%</p>
              <Badge variant="outline" className={metrics.resolutionRate >= 80 ? "text-green-600" : "text-yellow-600"}>
                Target: 80%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-bold">
                {(data?.feedback || []).filter((item: any) => 
                  item.status === 'pending' || item.status === 'reviewed'
                ).length}
              </p>
              <Badge variant="outline" className="text-blue-600">
                {(data?.feedback || []).filter((item: any) => item.status === 'pending').length} new
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="distribution">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Detailed Breakdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="distribution" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feedback by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Status</CardTitle>
                <CardDescription>
                  Distribution of feedback across different statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.byStatus.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || 
                              COLORS[index % COLORS.length]
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Feedback by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Type</CardTitle>
                <CardDescription>
                  Distribution of feedback across different types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData.byType}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="timeline" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Timeline</CardTitle>
              <CardDescription>
                Number of feedback submissions over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData.timeline}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Submissions"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feedback by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Category</CardTitle>
                <CardDescription>
                  Distribution across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.byCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.byCategory.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Feedback by Browser */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Browser</CardTitle>
                <CardDescription>
                  Distribution across different browsers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData.byBrowser}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Pages with Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Top Pages with Feedback</CardTitle>
                <CardDescription>
                  Pages with the most feedback submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData.byPage}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 30,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Feedback by Operating System */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by OS</CardTitle>
                <CardDescription>
                  Distribution across different operating systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData.byOS}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#8884D8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main component that fetches data and passes it to the analytics component
export function FeedbackAnalyticsContainer() {
  // Fetch all feedback
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/feedback'],
    queryFn: async () => {
      const response = await fetch('/api/feedback');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      return response.json();
    },
  });

  return (
    <FeedbackAnalytics 
      data={data} 
      isLoading={isLoading} 
      isError={isError} 
      refetch={refetch}
    />
  );
}