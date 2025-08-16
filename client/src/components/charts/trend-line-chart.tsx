"use client"

import * as React from "react"
import { 
  Line, 
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartWrapper } from "@/components/ui/chart-wrapper"

interface DataItem {
  [key: string]: string | number
}

interface TrendLineChartProps {
  title: string
  description?: string
  footer?: string
  data: DataItem[]
  lines: Array<{
    dataKey: string
    name: string
    color: string
    strokeWidth?: number
    dotSize?: number
  }>
  yAxisLabel?: string
  xAxisDataKey?: string
}

export function TrendLineChart({
  title,
  description,
  footer,
  data,
  lines,
  yAxisLabel,
  xAxisDataKey = "date",
}: TrendLineChartProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartWrapper className="aspect-[4/3]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                dataKey={xAxisDataKey} 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
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
                label={
                  yAxisLabel 
                    ? { 
                        value: yAxisLabel, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12, fill: '#888' },
                        offset: -5
                      } 
                    : undefined
                }
              />
              <Tooltip
                formatter={(value: any, name: any, entry: any) => [value as number, String(name)]}
                labelFormatter={(label: any) => String(label)}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                wrapperStyle={{ fontSize: 12 }}
              />
              {lines.map((line, index) => (
                <Line
                  key={`line-${index}`}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth || 2}
                  dot={{ r: line.dotSize || 4 }}
                  activeDot={{ r: (line.dotSize || 4) + 2 }}
                />
              ))}
            </LineChart>
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