"use client"

import * as React from "react"
import {
  Cell, 
  Legend, 
  Tooltip,
  ResponsiveContainer
} from "recharts"

import { cn } from "@/lib/utils"

// Define chart configuration type
export type ChartConfig = Record<string, {
  label: string
  color: string
}>

// Container for charts
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  // Create CSS variables from config
  const configCSSVariables = React.useMemo(() => {
    return Object.entries(config).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [`--color-${key}`]: value.color,
      }
    }, {})
  }, [config])

  return (
    <div
      className={cn("recharts-responsive-container", className)}
      style={configCSSVariables}
      {...props}
    >
      <style>
        {Object.entries(config).map(([key, value]) => {
          return `
            .recharts-responsive-container [fill="var(--color-${key})"],
            .recharts-tooltip-item [fill="var(--color-${key})"] {
              fill: ${value.color};
            }
            
            .recharts-responsive-container [stroke="var(--color-${key})"] {
              stroke: ${value.color};
            }
          `
        })}
      </style>
      {children}
    </div>
  )
}

// Custom tooltip content component
interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  nameKey?: string
  active?: boolean
  payload?: Array<{
    stroke: string
    strokeWidth: number
    name: string
    dataKey: string
    color: string
    fill: string
    value: number
    payload?: {
      [key: string]: number | string
    }
  }>
  label?: string
  labelFormatter?: (value: string) => string
  formatter?: (value: number, name: string, entry: any) => React.ReactNode
  hideLabel?: boolean
  indicator?: "dot" | "line"
}

function ChartTooltipContent({
  className,
  nameKey,
  active,
  payload = [],
  label,
  labelFormatter,
  formatter,
  hideLabel = false,
  indicator = "dot",
  ...props
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        className
      )}
      {...props}
    >
      {!hideLabel && label && (
        <div className="border-b pb-1 text-sm font-medium">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="pt-2">
        {payload.map((item, i) => {
          return (
            <div
              key={`item-${i}`}
              className="flex items-center justify-between text-sm leading-6"
            >
              <div className="flex items-center gap-1.5">
                {indicator === "dot" ? (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: item.fill,
                    }}
                  />
                ) : (
                  <div
                    className="h-2 w-4"
                    style={{
                      backgroundColor: item.fill,
                    }}
                  />
                )}
                <span className="text-muted-foreground">
                  {nameKey && item.payload ? item.payload[nameKey] : item.name}:
                </span>
              </div>
              <span className="ml-3 font-medium">
                {formatter
                  ? formatter(
                      item.value,
                      item.name,
                      item.payload ? item.payload : {}
                    )
                  : item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Simple wrapper components using any type to avoid TypeScript errors
function ChartLegend(props: any) {
  return <Legend {...props} />;
}

function ChartTooltip(props: any) {
  return <Tooltip {...props} />;
}

function ChartCell(props: any) {
  return <Cell {...props} />;
}

export { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent, ChartCell }