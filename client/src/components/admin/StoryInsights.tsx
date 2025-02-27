
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { api } from "@/lib/api"

// Initial sample data
const initialChartData = [
  { date: "2024-04-01", views: 222, likes: 150 },
  { date: "2024-04-02", views: 97, likes: 80 },
  { date: "2024-04-03", views: 167, likes: 120 },
  { date: "2024-04-04", views: 242, likes: 160 },
  { date: "2024-04-05", views: 373, likes: 190 },
  // More entries...
]

const chartConfig = {
  views: {
    label: "Story Views",
    color: "hsl(var(--chart-1))",
  },
  likes: {
    label: "Story Likes",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function StoryInsights() {
  const [chartData, setChartData] = React.useState(initialChartData)
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("views")

  // Calculate totals
  const total = React.useMemo(
    () => ({
      views: chartData.reduce((acc, curr) => acc + curr.views, 0),
      likes: chartData.reduce((acc, curr) => acc + curr.likes, 0),
    }),
    [chartData]
  )

  // Fetch real data
  React.useEffect(() => {
    const fetchStoryInsights = async () => {
      try {
        const response = await api.get('/analytics/stories')
        if (response.data && response.data.storyMetrics) {
          setChartData(response.data.storyMetrics)
        }
      } catch (error) {
        console.error("Error fetching story insights:", error)
      }
    }
    
    fetchStoryInsights()
    
    // Real-time updates
    const interval = setInterval(fetchStoryInsights, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Story Insights</CardTitle>
          <CardDescription>
            Views and likes for the last 90 days
          </CardDescription>
        </div>
        <div className="flex">
          {["views", "likes"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[chart as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="storyMetrics"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
