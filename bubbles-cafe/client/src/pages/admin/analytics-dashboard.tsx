"use client"

import React, { useState } from 'react'
import { DeviceAnalytics } from '@/components/analytics/device-analytics'
import { ReadingAnalytics } from '@/components/analytics/reading-analytics'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getReadingTimeAnalytics, getEngagementMetrics } from '@/api/analytics'
import { ReadingTimeAnalytics } from '@/types/analytics'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BarChart3, 
  LayoutDashboard, 
  LineChart, 
  RefreshCcw, 
  Settings, 
  BarChartIcon 
} from 'lucide-react'
import { format } from 'date-fns'

export default function AnalyticsDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  // Define interfaces for our analytics data
  interface SiteAnalytics {
    totalViews: number;
    uniqueVisitors: number;
    avgReadTime: number;
    bounceRate: number;
  }
  
  interface EngagementMetrics {
    totalReadingTime: number;
    averageSessionDuration: number;
    totalUsers: number;
    activeUsers: number;
    interactions: number;
    pageViews: number;
    returning: number;
  }
  
  // Use the analytics functions imported at the top of the file
  
  // Query for site analytics summary data - using explicit query function with correct type
  const { data: analyticsData, isLoading: isLoadingSite, error: siteError, refetch: refetchSite } = useQuery<ReadingTimeAnalytics>({
    queryKey: ['/api/analytics/reading-time', refreshKey],
    queryFn: getReadingTimeAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
  
  // Query for user engagement data - using explicit query function
  const { data: engagementData, isLoading: isLoadingEngagement, error: engagementError, refetch: refetchEngagement } = useQuery<EngagementMetrics>({
    queryKey: ['/api/analytics/engagement', refreshKey],
    queryFn: getEngagementMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    refetchSite()
    refetchEngagement()
  }
  
  // Determine if any queries are loading or have errors
  const isLoading = isLoadingSite || isLoadingEngagement
  const hasError = siteError || engagementError

  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-8">
        <div className="text-xl font-semibold text-red-500 mb-4">Error loading analytics data</div>
        <p className="text-muted-foreground mb-6">There was a problem fetching analytics information.</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and statistics about site usage and engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="devices">
            <BarChartIcon className="h-4 w-4 mr-2" />
            Device Statistics
          </TabsTrigger>
          <TabsTrigger value="reading">
            <LineChart className="h-4 w-4 mr-2" />
            Reading Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engagementData?.pageViews.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  From all site users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engagementData?.totalUsers.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Past 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engagementData?.activeUsers.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Past 7 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engagementData?.interactions.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All clicks and engagements
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reading Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor((engagementData?.totalReadingTime || 0) / 60)}m {(engagementData?.totalReadingTime || 0) % 60}s
                </div>
                <p className="text-xs text-muted-foreground">
                  Total time spent reading
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor((engagementData?.averageSessionDuration || 0) / 60)}m {Math.floor((engagementData?.averageSessionDuration || 0) % 60)}s
                </div>
                <p className="text-xs text-muted-foreground">
                  Average user session length
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Returning Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engagementData?.returning.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Users with multiple visits
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DeviceAnalytics />
            <ReadingAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <DeviceAnalytics />
        </TabsContent>

        <TabsContent value="reading" className="space-y-4">
          <ReadingAnalytics />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Data Update Status</CardTitle>
          <CardDescription>
            Information about the last analytics data refresh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last updated:</span>
              <span className="font-medium">{format(new Date(), 'PPpp')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Update frequency:</span>
              <span className="font-medium">Every 5 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data source:</span>
              <span className="font-medium">Primary Analytics API</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}