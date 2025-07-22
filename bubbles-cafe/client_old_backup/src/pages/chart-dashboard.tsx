"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractiveBarChart } from "@/components/charts/interactive-bar-chart"
import { CustomLabelBarChart } from "@/components/charts/custom-label-bar-chart"
import { TrendLineChart } from "@/components/charts/trend-line-chart"
import { PieChartComponent } from "@/components/charts/pie-chart-component"

export default function ChartDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Example data for demonstration purposes
  // In a real application, this data would come from your API/database
  const monthlyData = [
    { date: "2025-01", desktop: 1520, mobile: 1190, tablet: 320 },
    { date: "2025-02", desktop: 1680, mobile: 1340, tablet: 350 },
    { date: "2025-03", desktop: 1940, mobile: 1560, tablet: 380 },
    { date: "2025-04", desktop: 2150, mobile: 1750, tablet: 410 },
    { date: "2025-05", desktop: 2380, mobile: 1970, tablet: 450 },
    { date: "2025-06", desktop: 2690, mobile: 2320, tablet: 490 },
  ]
  
  // Device distribution by month 
  const deviceDistribution = [
    { month: "Jan", desktop: 1520, mobile: 1190 },
    { month: "Feb", desktop: 1680, mobile: 1340 },
    { month: "Mar", desktop: 1940, mobile: 1560 },
    { month: "Apr", desktop: 2150, mobile: 1750 },
    { month: "May", desktop: 2380, mobile: 1970 },
    { month: "Jun", desktop: 2690, mobile: 2320 },
  ]
  
  // Calculate device growth rates (this would normally be done by your backend)
  const firstMonth = deviceDistribution[0];
  const lastMonth = deviceDistribution[deviceDistribution.length - 1];
  
  const desktopGrowth = ((lastMonth.desktop - firstMonth.desktop) / firstMonth.desktop) * 100;
  const mobileGrowth = ((lastMonth.mobile - firstMonth.mobile) / firstMonth.mobile) * 100;
  
  // Content engagement data
  const engagementData = [
    { content: "Horror", avgTime: 320, completion: 78 },
    { content: "Mystery", avgTime: 280, completion: 72 },
    { content: "Thriller", avgTime: 310, completion: 81 },
    { content: "Sci-Fi", avgTime: 260, completion: 65 },
    { content: "Fantasy", avgTime: 290, completion: 69 },
  ]
  
  // Traffic source data for pie chart
  const trafficSourceData = [
    { name: "Direct", value: 40, color: "#8884d8" },
    { name: "Social", value: 30, color: "#82ca9d" },
    { name: "Organic", value: 20, color: "#ffc658" },
    { name: "Referral", value: 10, color: "#ff8042" },
  ]
  
  // Device type distribution for pie chart
  const deviceTypeData = [
    { name: "Desktop", value: 55, color: "#0088fe" },
    { name: "Mobile", value: 35, color: "#00c49f" },
    { name: "Tablet", value: 10, color: "#ffbb28" },
  ]
  
  // Trend data for line chart
  const userGrowthData = [
    { date: "2025-01", active: 1200, new: 400, returning: 800 },
    { date: "2025-02", active: 1350, new: 450, returning: 900 },
    { date: "2025-03", active: 1500, new: 480, returning: 1020 },
    { date: "2025-04", active: 1750, new: 520, returning: 1230 },
    { date: "2025-05", active: 2000, new: 650, returning: 1350 },
    { date: "2025-06", active: 2300, new: 780, returning: 1520 },
  ]
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <p className="text-muted-foreground mb-8">Interactive charts demonstrating platform analytics capabilities</p>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>
            Device Overview
          </TabsTrigger>
          <TabsTrigger value="trends" onClick={() => setActiveTab("trends")}>
            Growth Trends
          </TabsTrigger>
          <TabsTrigger value="engagement" onClick={() => setActiveTab("engagement")}>
            User Engagement
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <InteractiveBarChart
              title="Monthly Usage Statistics"
              description="Comparing device usage over the last 6 months"
              data={monthlyData}
              defaultCategory="desktop"
            />
            
            <CustomLabelBarChart
              title="Device Distribution"
              description="January - June 2025"
              footer="Desktop remains the primary access method"
              trendingText="Desktop usage trending up by"
              trendingValue={desktopGrowth.toFixed(1)}
              data={deviceDistribution}
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <PieChartComponent
              title="Device Type Distribution"
              description="Current breakdown of user device types"
              data={deviceTypeData}
              innerRadius={60}
              outerRadius={90}
              showLabels={true}
            />
            
            <PieChartComponent
              title="Traffic Sources"
              description="How users are finding your platform"
              data={trafficSourceData}
              innerRadius={0}
              outerRadius={90}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <TrendLineChart
              title="User Growth Trends"
              description="Monthly user growth patterns"
              data={userGrowthData}
              xAxisDataKey="date"
              yAxisLabel="Users"
              lines={[
                { dataKey: "active", name: "Active Users", color: "#8884d8" },
                { dataKey: "new", name: "New Users", color: "#82ca9d" },
                { dataKey: "returning", name: "Returning Users", color: "#ffc658" }
              ]}
            />
            
            <CustomLabelBarChart
              title="Mobile Growth Analysis"
              description="January - June 2025"
              footer="Mobile usage increasing steadily"
              trendingText="Mobile growth rate:"
              trendingValue={mobileGrowth.toFixed(1)}
              data={deviceDistribution}
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-1">
            <TrendLineChart
              title="Platform Engagement Trends"
              description="How engagement is growing across all metrics"
              data={monthlyData}
              xAxisDataKey="date"
              yAxisLabel="Users"
              lines={[
                { dataKey: "desktop", name: "Desktop", color: "#0088fe", strokeWidth: 3 },
                { dataKey: "mobile", name: "Mobile", color: "#00c49f", strokeWidth: 3 },
                { dataKey: "tablet", name: "Tablet", color: "#ffbb28", strokeWidth: 3 }
              ]}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <InteractiveBarChart
              title="Content Engagement"
              description="Average time spent by content category (seconds)"
              data={engagementData}
              defaultCategory="avgTime"
            />
            
            <InteractiveBarChart
              title="Content Completion Rate"
              description="Percentage of users completing content (by category)"
              data={engagementData}
              defaultCategory="completion"
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <PieChartComponent
              title="Content Category Distribution"
              description="Content preferences by percentage"
              data={[
                { name: "Horror", value: 35, color: "#d32f2f" },
                { name: "Mystery", value: 25, color: "#7b1fa2" },
                { name: "Thriller", value: 20, color: "#1976d2" },
                { name: "Sci-Fi", value: 12, color: "#388e3c" },
                { name: "Fantasy", value: 8, color: "#f57c00" },
              ]}
              innerRadius={50}
              outerRadius={90}
              showPercentage={true}
              showLabels={true}
            />
            
            <TrendLineChart
              title="Engagement by Category"
              description="Time spent across different content categories"
              data={[
                { month: "Jan", horror: 280, mystery: 200, thriller: 240 },
                { month: "Feb", horror: 300, mystery: 210, thriller: 250 },
                { month: "Mar", horror: 320, mystery: 230, thriller: 270 },
                { month: "Apr", horror: 340, mystery: 250, thriller: 290 },
                { month: "May", horror: 360, mystery: 270, thriller: 310 },
                { month: "Jun", horror: 380, mystery: 290, thriller: 330 },
              ]}
              xAxisDataKey="month"
              yAxisLabel="Seconds"
              lines={[
                { dataKey: "horror", name: "Horror", color: "#d32f2f" },
                { dataKey: "mystery", name: "Mystery", color: "#7b1fa2" },
                { dataKey: "thriller", name: "Thriller", color: "#1976d2" }
              ]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}