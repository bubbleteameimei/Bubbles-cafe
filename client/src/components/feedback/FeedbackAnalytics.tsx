"use client"

import React from 'react';
import { TrendingUp } from "lucide-react";
import { 
  Pie, 
  PieChart, 
  Label, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  LabelList,
  ResponsiveContainer
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { FeedbackItem } from './FeedbackDetails';

interface FeedbackAnalyticsProps {
  feedbackItems: FeedbackItem[];
}

export function FeedbackAnalytics({ feedbackItems }: FeedbackAnalyticsProps) {
  // Process feedback data for charts
  const feedbackByType = React.useMemo(() => {
    const result = {
      suggestion: 0,
      bug: 0,
      praise: 0,
      complaint: 0
    };
    
    feedbackItems.forEach(item => {
      if (item.type in result) {
        result[item.type as keyof typeof result]++;
      }
    });
    
    return Object.entries(result).map(([type, count]) => ({
      type,
      count,
      fill: `var(--color-${type})`
    }));
  }, [feedbackItems]);

  // Rating analytics removed

  const feedbackByStatus = React.useMemo(() => {
    const result = {
      pending: 0,
      reviewed: 0,
      resolved: 0,
      rejected: 0
    };
    
    feedbackItems.forEach(item => {
      if (item.status in result) {
        result[item.status as keyof typeof result]++;
      }
    });
    
    return Object.entries(result).map(([status, count]) => ({
      status,
      count,
      fill: `var(--color-${status})`
    }));
  }, [feedbackItems]);

  const totalFeedback = feedbackItems.length;
  const resolvedFeedback = feedbackItems.filter(item => item.status === 'resolved').length;
  const resolutionRate = totalFeedback ? Math.round((resolvedFeedback / totalFeedback) * 100) : 0;

  const typeChartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--foreground))",
    },
    suggestion: {
      label: "Suggestions",
      color: "hsl(var(--chart-1))",
    },
    bug: {
      label: "Bug Reports",
      color: "hsl(var(--chart-2))",
    },
    praise: {
      label: "Praise",
      color: "hsl(var(--chart-3))",
    },
    complaint: {
      label: "Complaints",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  const statusChartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--foreground))",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--chart-1))",
    },
    reviewed: {
      label: "Reviewed",
      color: "hsl(var(--chart-2))",
    },
    resolved: {
      label: "Resolved",
      color: "hsl(var(--chart-3))",
    },
    rejected: {
      label: "Rejected",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  // Rating chart config removed

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feedback by Type Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Feedback by Type</CardTitle>
            <CardDescription>Distribution of feedback types</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <ChartContainer
              config={typeChartConfig}
              className="h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="type" />}
                />
                <Pie
                  data={feedbackByType}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {totalFeedback}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-sm"
                            >
                              Total
                            </tspan>
                          </text>
                        )
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Feedback by Status Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Feedback by Status</CardTitle>
            <CardDescription>Current status of all feedback</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <ChartContainer
              config={statusChartConfig}
              className="h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="status" />}
                />
                <Pie
                  data={feedbackByStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {resolutionRate}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-sm"
                            >
                              Resolved
                            </tspan>
                          </text>
                        )
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rating chart section removed */}
    </div>
  );
}