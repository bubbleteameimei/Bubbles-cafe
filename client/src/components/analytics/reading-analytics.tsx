"use client"

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ReadingTimeAnalytics, TopStory, PeriodType } from '@/types/analytics'
import { getReadingTimeAnalytics } from '@/api/analytics'
import { createTypedSetState } from '@/utils/types-util'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCcw, Clock, BookOpen, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export function ReadingAnalytics() {
  const [period, setPeriod] = useState<PeriodType>('day')
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line')
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch reading analytics data using explicit query function
  const { data, isLoading, error, refetch } = useQuery<ReadingTimeAnalytics>({
    queryKey: ['/api/analytics/reading-time', period, refreshKey],
    queryFn: getReadingTimeAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    refetch()
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-80" />
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Reading Analytics</CardTitle>
          <CardDescription>Error loading reading time data</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">There was a problem fetching reading analytics.</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Get the right data based on the selected period
  const chartData = period === 'day' 
    ? data?.dailyData 
    : period === 'week' 
      ? data?.weeklyData 
      : data?.monthlyData

  // Get top stories data
  const topStories = data?.topStories || []

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reading Metrics</CardTitle>
            <CardDescription>
              Time spent reading stories and scroll depth analytics
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Tabs defaultValue="day" value={period} onValueChange={createTypedSetState(setPeriod)} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Daily</TabsTrigger>
              <TabsTrigger value="week">Weekly</TabsTrigger>
              <TabsTrigger value="month">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="line" value={chartType} onValueChange={createTypedSetState(setChartType)} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="area">Area</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-primary/5 rounded-lg flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Read Time</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">{Math.floor((data?.overallStats?.avgReadingTime || 0) / 60)}m {(data?.overallStats?.avgReadingTime || 0) % 60}s</h3>
                <span className="ml-2 flex items-center text-xs">
                  {data?.overallStats?.changeFromLastPeriod?.readingTime.trend === 'up' ? (
                    <span className="text-green-500 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{data?.overallStats?.changeFromLastPeriod?.readingTime.value.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {data?.overallStats?.changeFromLastPeriod?.readingTime.value.toFixed(1)}%
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-primary/5 rounded-lg flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Story Views</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">{data?.overallStats?.totalViews.toLocaleString()}</h3>
                <span className="ml-2 flex items-center text-xs">
                  {data?.overallStats?.changeFromLastPeriod?.views.trend === 'up' ? (
                    <span className="text-green-500 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{data?.overallStats?.changeFromLastPeriod?.views.value.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {data?.overallStats?.changeFromLastPeriod?.views.value.toFixed(1)}%
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-primary/5 rounded-lg flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scroll Depth</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">{data?.overallStats?.averageScrollDepth.toFixed(0)}%</h3>
                <span className="ml-2 text-xs text-muted-foreground">of content viewed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`} />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  name="Avg. Reading Time (sec)" 
                  dataKey="avgTime" 
                  stroke="#8884d8"
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  name="Scroll Depth (%)" 
                  dataKey="scrollDepth" 
                  stroke="#82ca9d" 
                />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="avgTime" 
                  name="Avg. Reading Time (sec)" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8"
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="storyViews" 
                  name="Story Views" 
                  stackId="2" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`} />
                <Legend />
                <Bar dataKey="avgTime" name="Avg. Reading Time (sec)" fill="#8884d8" />
                <Bar dataKey="storyViews" name="Story Views" fill="#82ca9d" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <div className="bg-muted py-2.5 px-4 text-sm font-medium">
            Top Stories by Reading Time
          </div>
          <div className="divide-y">
            {topStories.map((story: TopStory, index: number) => (
              <div 
                key={story.id} 
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <div>
                    <h4 className="font-medium">{story.title}</h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      {Math.floor(story.avgReadingTime / 60)}m {story.avgReadingTime % 60}s avg. reading time
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{story.views.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">views</div>
                </div>
              </div>
            ))}
            
            {topStories.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No reading data available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}