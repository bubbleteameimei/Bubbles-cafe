"use client"

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DeviceAnalytics as DeviceAnalyticsData, PeriodType } from '@/types/analytics'
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  TrendingDown, 
  TrendingUp, 
  RefreshCcw 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Custom shape for the Pie chart with labels
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// Device colors
const COLORS = ['#0088FE', '#00C49F', '#FF8042']

export function DeviceAnalytics() {
  const [period, setPeriod] = useState<PeriodType>('month')
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch device analytics data
  const { data, isLoading, error, refetch } = useQuery<DeviceAnalyticsData>({
    queryKey: ['/api/analytics/devices', period, refreshKey],
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
          <CardTitle>Device Analytics</CardTitle>
          <CardDescription>Error loading device distribution data</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">There was a problem fetching device analytics.</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Format data for the device type pie chart
  const pieData = [
    { name: 'Desktop', value: data?.totals?.desktop || 0, icon: <Laptop className="h-4 w-4" /> },
    { name: 'Mobile', value: data?.totals?.mobile || 0, icon: <Smartphone className="h-4 w-4" /> },
    { name: 'Tablet', value: data?.totals?.tablet || 0, icon: <Tablet className="h-4 w-4" /> }
  ]

  // Get the appropriate time series data based on selected period
  const timeSeriesData = period === 'day' 
    ? data?.dailyData 
    : period === 'week' 
      ? data?.weeklyData 
      : data?.monthlyData

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>
              Distribution of user devices across different platforms
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <Tabs defaultValue="month" value={period} onValueChange={createTypedSetState(setPeriod)} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">Daily</TabsTrigger>
            <TabsTrigger value="week">Weekly</TabsTrigger>
            <TabsTrigger value="month">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex flex-col items-center justify-center h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="col-span-1 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Laptop className="h-4 w-4" /> Desktop
                  </span>
                  <div className="flex items-center">
                    <span className="text-xl font-bold">
                      {data?.totals?.desktop || 0}
                    </span>
                    <div className="ml-2 flex items-center text-xs">
                      {(data?.percentageChange?.desktop || 0) >= 0 ? (
                        <span className="text-green-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{data?.percentageChange?.desktop || 0}%
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {data?.percentageChange?.desktop || 0}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(
                        100, 
                        (data?.totals?.desktop || 0) / 
                        ((data?.totals?.desktop || 0) + 
                         (data?.totals?.mobile || 0) + 
                         (data?.totals?.tablet || 0)) * 100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Smartphone className="h-4 w-4" /> Mobile
                  </span>
                  <div className="flex items-center">
                    <span className="text-xl font-bold">
                      {data?.totals?.mobile || 0}
                    </span>
                    <div className="ml-2 flex items-center text-xs">
                      {(data?.percentageChange?.mobile || 0) >= 0 ? (
                        <span className="text-green-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{data?.percentageChange?.mobile || 0}%
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {data?.percentageChange?.mobile || 0}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(
                        100, 
                        (data?.totals?.mobile || 0) / 
                        ((data?.totals?.desktop || 0) + 
                         (data?.totals?.mobile || 0) + 
                         (data?.totals?.tablet || 0)) * 100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Tablet className="h-4 w-4" /> Tablet
                  </span>
                  <div className="flex items-center">
                    <span className="text-xl font-bold">
                      {data?.totals?.tablet || 0}
                    </span>
                    <div className="ml-2 flex items-center text-xs">
                      {(data?.percentageChange?.tablet || 0) >= 0 ? (
                        <span className="text-green-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{data?.percentageChange?.tablet || 0}%
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {data?.percentageChange?.tablet || 0}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(
                        100, 
                        (data?.totals?.tablet || 0) / 
                        ((data?.totals?.desktop || 0) + 
                         (data?.totals?.mobile || 0) + 
                         (data?.totals?.tablet || 0)) * 100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={timeSeriesData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
              />
              <Legend />
              <Bar name="Desktop" dataKey="desktop" fill="#0088FE" />
              <Bar name="Mobile" dataKey="mobile" fill="#00C49F" />
              <Bar name="Tablet" dataKey="tablet" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}