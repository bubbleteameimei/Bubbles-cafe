
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

const initialChartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Visitors",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function VisitorAnalytics() {
  const [chartData, setChartData] = useState(initialChartData)
  const [trendPercentage, setTrendPercentage] = useState(5.2)
  
  // Fetch real visitor data
  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        const response = await api.get('/analytics/visitors')
        if (response.data) {
          setChartData(response.data.visitorsByMonth)
          setTrendPercentage(response.data.trendPercentage || 5.2)
        }
      } catch (error) {
        console.error("Error fetching visitor analytics:", error)
      }
    }
    
    fetchVisitorData()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchVisitorData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitor Analytics</CardTitle>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
            <XAxis type="number" dataKey="desktop" hide />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending {trendPercentage > 0 ? "up" : "down"} by {Math.abs(trendPercentage)}% this month 
          <TrendingUp className={`h-4 w-4 ${trendPercentage < 0 ? "rotate-180 text-destructive" : "text-green-500"}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
