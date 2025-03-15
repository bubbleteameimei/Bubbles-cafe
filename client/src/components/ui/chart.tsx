"use client"

import * as React from "react"
import { type TooltipProps } from "recharts"
import { Badge } from "@/components/ui/badge"

// Define the ChartConfig type for better type safety
export type ChartConfig = {
  [key: string]: {
    label: string
    color?: string
  }
}

// Create a context to share chart configuration
type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

// Container component that provides chart configuration
type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig
  children: React.ReactNode
}

function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  // Inject CSS variables for chart colors
  const style = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(config).flatMap(([key, value]) => {
        if (!value.color) return []
        return [[`--color-${key}`, value.color]]
      })
    )
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={className} style={style} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

// Custom tooltip component that displays formatted data
type ChartTooltipContentProps = {
  active?: boolean
  payload?: Array<{ name?: string; value?: string | number; dataKey?: string }>
  label?: string
  className?: string
  formatter?: (value: string | number) => string | number
  labelFormatter?: (value: string | number) => string | number
  nameKey?: string
  indicator?: "dot" | "line"
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  formatter,
  labelFormatter,
  nameKey,
  indicator = "dot",
}: ChartTooltipContentProps) {
  const context = React.useContext(ChartContext)

  if (!active || !payload?.length || !context) {
    return null
  }

  const formattedLabel = labelFormatter ? labelFormatter(label as string) : label

  return (
    <div
      className={`rounded-lg border bg-background px-3 py-2 text-sm shadow-sm ${
        className ?? ""
      }`}
    >
      {formattedLabel ? (
        <div className="mb-2 font-medium">{formattedLabel}</div>
      ) : null}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, index) => {
          const key = item.dataKey as string
          const config = getPayloadConfigFromPayload(
            context.config,
            item,
            nameKey ?? key
          )
          const name = config?.label ?? nameKey ?? key
          const color = config?.color ?? `var(--color-${key})`
          const formattedValue = formatter
            ? formatter(item.value as string | number)
            : item.value

          return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              {indicator === "dot" ? (
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ) : (
                <div
                  className="h-0.5 w-4"
                  style={{ backgroundColor: color }}
                />
              )}
              <span className="text-muted-foreground">{name}:</span>
              <span>{formattedValue}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Custom tooltip component that wraps the tooltip content
function ChartTooltip({
  content,
  cursor,
  ...props
}: TooltipProps<any, any> & {
  cursor?: React.ReactNode
  content?: React.ReactNode
}) {
  return (
    <foreignObject className="overflow-visible">
      {content ?? <ChartTooltipContent {...(props as any)} />}
    </foreignObject>
  )
}

// Legend component for charts
type ChartLegendContentProps = {
  payload?: Array<{
    value?: string
    type?: string
    id?: string
    color?: string
    dataKey?: string
  }>
}

function ChartLegendContent({ payload }: ChartLegendContentProps) {
  const context = React.useContext(ChartContext)

  if (!context || !payload?.length) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-4">
      {payload.map((entry, index) => {
        const dataKey = entry.dataKey as string
        const config = getPayloadConfigFromPayload(
          context.config,
          entry,
          dataKey
        )
        const label = config?.label ?? dataKey
        const color = entry.color ?? config?.color ?? `var(--color-${dataKey})`

        return (
          <div key={`item-${index}`} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function ChartLegend(props: any) {
  return <ChartLegendContent {...props} />
}

// Chart style component for visual consistency
type ChartStyleProps = {
  children: React.ReactNode
  items: Array<{
    color: string
    label: string
    value?: number
  }>
}

function ChartStyle({ children, items }: ChartStyleProps) {
  return (
    <div className="space-y-2">
      {children}
      <div className="flex flex-wrap gap-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="pointer-events-none border-0 p-0"
            >
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
            </Badge>
            <span className="text-sm font-medium">{item.label}</span>
            {item.value !== undefined ? (
              <span className="text-sm text-muted-foreground">
                {item.value}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper function to get configuration from payload
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

// ChartCell is a simple component for showing a data cell in charts
type ChartCellProps = {
  color?: string;
  fill?: string;  // Allow for fill property as used in site-statistics.tsx
  value?: string | number;
  label?: string;
  key?: string;
  className?: string;
}

function ChartCell({ color, fill, value, label, className }: ChartCellProps) {
  // Use fill as a fallback if color is not provided
  const backgroundColor = color || fill || "#cbd5e1";
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor }} />
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{label || "Unknown"}</p>
        <p className="font-medium">{value || "-"}</p>
      </div>
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartCell,
}