"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Label, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartWrapper } from "@/components/ui/chart-wrapper"

interface DataItem {
  [key: string]: number | string
}

interface CustomLabelBarChartProps {
  title: string
  description?: string
  footer?: string
  trendingText?: string
  trendingValue?: number
  data: DataItem[]
}

export function CustomLabelBarChart({
  title,
  description,
  footer,
  trendingText,
  trendingValue,
  data,
}: CustomLabelBarChartProps) {
  // Get the first field that could represent a date/month field for the X-axis
  const labelField = React.useMemo(() => {
    const firstItem = data[0] || {}
    return Object.keys(firstItem).find(key => 
      ["date", "month", "year", "day", "week", "quarter"].includes(key.toLowerCase())
    ) || Object.keys(firstItem)[0] || "month"
  }, [data])
  
  // Get the value fields (excluding the label field)
  const valueFields = React.useMemo(() => {
    const firstItem = data[0] || {}
    return Object.keys(firstItem).filter(key => 
      key !== labelField && typeof firstItem[key] === "number"
    )
  }, [data, labelField])
  
  // Define colors for different data series
  const seriesColors: { [key: string]: string } = {
    desktop: "#8884d8",
    mobile: "#82ca9d",
    tablet: "#ffc658",
    web: "#ff8042",
    ios: "#0088fe",
    android: "#00c49f",
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {trendingText && trendingValue !== undefined && (
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 mr-1 text-emerald-500" />
            <span>
              {trendingText} <strong className="text-emerald-500">{trendingValue}%</strong>
            </span>
          </div>
        )}
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
                bottom: 25,
              }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey={labelField} 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
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
              >
                <Label
                  value="Users"
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fontSize: 12, fill: '#888' }}
                  offset={-5}
                />
              </YAxis>
              
              {valueFields.map((field, index) => (
                <Bar
                  key={field}
                  dataKey={field}
                  name={field.charAt(0).toUpperCase() + field.slice(1)}
                  fill={seriesColors[field] || `hsl(${index * 50}, 70%, 50%)`}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                  label={{
                    position: 'top',
                    formatter: (value: number) => {
                      if (value >= 1000) {
                        return `${(value / 1000).toFixed(1)}k`
                      }
                      return value
                    },
                    fontSize: 10,
                    fill: '#888',
                  }}
                />
              ))}
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