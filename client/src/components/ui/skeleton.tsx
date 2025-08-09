import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function SkeletonText({ 
  lines = 3, 
  className = "",
  lastLineWidth = "75%"
}: { 
  lines?: number; 
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
      <Skeleton 
        className="h-4" 
        style={{ width: lastLineWidth }}
      />
    </div>
  )
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={cn("border rounded-lg p-4 space-y-3", className)}>
      <Skeleton className="h-6 w-3/4" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

function SkeletonList({ 
  items = 5, 
  className = "" 
}: { 
  items?: number; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className = "" 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonTable 
}