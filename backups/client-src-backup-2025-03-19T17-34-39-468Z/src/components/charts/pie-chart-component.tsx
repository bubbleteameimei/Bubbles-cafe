"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartWrapper } from "@/components/ui/chart-wrapper"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DataItem {
  name: string
  value: number
  color?: string
}

interface PieChartComponentProps {
  title: string
  description?: string
  footer?: string
  data: DataItem[]
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  showLabels?: boolean
  showPercentage?: boolean
}

export function PieChartComponent({
  title,
  description,
  footer,
  data,
  innerRadius = 0,
  outerRadius = 80,
  showLegend = true,
  showLabels = false,
  showPercentage = true,
}: PieChartComponentProps) {
  // Calculate total for percentage
  const total = React.useMemo(() => 
    data.reduce((sum, item) => sum + item.value, 0), 
    [data]
  )

  // Generate colors if not provided
  const defaultColors = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", 
    "#00c49f", "#ffbb28", "#ff8042", "#a4de6c", "#d0ed57"
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartWrapper className="aspect-square max-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={showLabels}
                label={showLabels ? renderCustomizedLabel(total, showPercentage) : undefined}
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || defaultColors[index % defaultColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const entry = payload[0];
                    const percent = ((entry.value as number) / total * 100).toFixed(1);
                    
                    return (
                      <ChartTooltip>
                        <ChartTooltipContent>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium">{entry.name}</p>
                            <p className="text-sm font-semibold flex items-center gap-1">
                              <span 
                                className="size-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              Value: {entry.value}
                              {showPercentage && ` (${percent}%)`}
                            </p>
                          </div>
                        </ChartTooltipContent>
                      </ChartTooltip>
                    )
                  }
                  return null
                }}
              />
              {showLegend && (
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20, fontSize: 12 }}
                />
              )}
            </PieChart>
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

// Helper function to render custom label
const renderCustomizedLabel = (total: number, showPercentage: boolean) => 
  ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const displayValue = showPercentage 
      ? `${(percent * 100).toFixed(0)}%` 
      : value.toString();
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {displayValue}
      </text>
    );
};