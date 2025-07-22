"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartWrapper } from "@/components/ui/chart-wrapper"

interface DataItem {
  [key: string]: number | string
}

interface InteractiveBarChartProps {
  title: string
  description?: string
  footer?: string
  data: DataItem[]
  defaultCategory?: string
}

export function InteractiveBarChart({
  title,
  description,
  footer,
  data,
  defaultCategory,
}: InteractiveBarChartProps) {
  // Extract available categories from the data (excluding date/month fields)
  const categories = React.useMemo(() => {
    const firstItem = data[0] || {}
    return Object.keys(firstItem).filter(key => 
      !["date", "month", "year", "day", "week", "quarter"].includes(key.toLowerCase())
    )
  }, [data])
  
  // Set up state for selected category
  const [selectedCategory, setSelectedCategory] = React.useState(defaultCategory || categories[0] || "")
  
  // Define colors for different categories
  const categoryColors: { [key: string]: string } = {
    desktop: "#8884d8",
    mobile: "#82ca9d",
    tablet: "#ffc658",
    web: "#ff8042",
    ios: "#0088fe",
    android: "#00c49f",
  }
  
  // Get the first field that could represent a date field for the X-axis
  const dateField = React.useMemo(() => {
    const firstItem = data[0] || {}
    return Object.keys(firstItem).find(key => 
      ["date", "month", "year", "day", "week", "quarter"].includes(key.toLowerCase())
    ) || Object.keys(firstItem)[0] || "date"
  }, [data])
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartWrapper className="aspect-[4/3]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey={dateField} 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                // Format date values if needed
                tickFormatter={(value) => {
                  if (typeof value === "string" && value.includes("-")) {
                    // Handle ISO date strings
                    const date = new Date(value)
                    return date.toLocaleDateString(undefined, { month: "short" })
                  }
                  return value
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}k`
                  }
                  return value
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltip>
                        <ChartTooltipContent>
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">{payload[0].payload[dateField]}</p>
                            <p className="text-sm font-semibold flex items-center gap-1">
                              <span 
                                className="size-3 rounded-full"
                                style={{ 
                                  backgroundColor: categoryColors[selectedCategory] || "#888" 
                                }}
                              />
                              {selectedCategory}: {payload[0].value}
                            </p>
                          </div>
                        </ChartTooltipContent>
                      </ChartTooltip>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey={selectedCategory}
                fill={categoryColors[selectedCategory] || "#8884d8"}
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </CardContent>
      {footer && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">{footer}</p>
        </CardFooter>
      )}
    </Card>
  )
}